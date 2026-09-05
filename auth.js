import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import {
  doc,
  getDoc,
  getFirestore,
  serverTimestamp,
  setDoc
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';
import { FIREBASE_CONFIG } from './config.js?v=firebase-1';

const configured = FIREBASE_CONFIG.apiKey?.length > 20 && FIREBASE_CONFIG.projectId?.length > 2;

export async function initAuth(fallbackState) {
  window.studymonkeyAuth = { isConfigured: configured, email: null, storageKey: 'studymonkey', storageReady: false, syncState: () => {} };
  if (!configured) return readLocalState('studymonkey', fallbackState);

  let auth;
  let database;
  try {
    const firebaseApp = initializeApp(FIREBASE_CONFIG);
    auth = getAuth(firebaseApp);
    database = getFirestore(firebaseApp);
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    showConnectionProblem();
    return fallbackState;
  }

  let user = await waitForUser(auth);
  if (!user) user = await showAuthGate(auth);
  if (!user) return fallbackState;

  const storageKey = `studymonkey:${user.uid}`;
  let state = readLocalState(storageKey, fallbackState);
  let storageReady = false;
  try {
    const studentSnapshot = await getDoc(doc(database, 'students', user.uid));
    if (studentSnapshot.exists()) {
      const studentData = studentSnapshot.data();
      state = {
        ...fallbackState,
        ...(studentData.appState || {}),
        subjects: studentData.subjects?.length ? studentData.subjects : fallbackState.subjects
      };
    } else {
      await setDoc(doc(database, 'students', user.uid), {
        email: user.email,
        subjects: state.subjects,
        appState: { ...state, subjects: undefined },
        updatedAt: serverTimestamp()
      });
    }
    storageReady = true;
  } catch (error) {
    storageReady = false;
  }

  window.studymonkeyAuth = {
    isConfigured: true,
    email: user.email,
    storageKey,
    storageReady,
    signOut: async () => {
      await signOut(auth);
      window.location.reload();
    },
    syncState: async currentState => {
      try {
        await setDoc(doc(database, 'students', user.uid), {
          email: user.email,
          subjects: currentState.subjects,
          appState: { ...currentState, subjects: undefined },
          updatedAt: serverTimestamp()
        }, { merge: true });
        window.studymonkeyAuth.storageReady = true;
      } catch (error) {
        window.studymonkeyAuth.storageReady = false;
      }
    }
  };
  return state;
}

function readLocalState(storageKey, fallbackState) {
  try {
    const savedState = localStorage.getItem(storageKey);
    return savedState ? { ...fallbackState, ...JSON.parse(savedState) } : fallbackState;
  } catch (error) {
    return fallbackState;
  }
}

function waitForUser(auth) {
  return new Promise(resolve => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      unsubscribe();
      resolve(user);
    }, () => resolve(null));
  });
}

function showAuthGate(auth) {
  const app = document.querySelector('#app');
  app.innerHTML = `<main class="auth-screen"><section class="auth-card"><div class="eyebrow">STUDYMONKEY</div><h1>Your private study space</h1><p>Create an account to keep your subjects, progress, and quiz results safe across devices.</p><form id="auth-form"><label>Email<input id="auth-email" type="email" required autocomplete="email"></label><label>Password<input id="auth-password" type="password" minlength="8" required autocomplete="current-password"></label><p id="auth-message" role="status"></p><button class="primary" type="submit">Sign in</button><button id="sign-up" type="button">Create account</button><button id="reset-password" class="text-button" type="button">Forgot password?</button></form><p class="auth-note">Your password is handled securely by Firebase. New accounts receive a verification email.</p></section></main>`;

  return new Promise(resolve => {
    const form = document.querySelector('#auth-form');
    const message = document.querySelector('#auth-message');
    const emailInput = document.querySelector('#auth-email');
    const passwordInput = document.querySelector('#auth-password');

    const submit = async creatingAccount => {
      if (!form.reportValidity()) return;
      setFormBusy(form, true);
      message.textContent = creatingAccount ? 'Creating your account...' : 'Signing you in...';
      try {
        const credential = creatingAccount
          ? await createUserWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value)
          : await signInWithEmailAndPassword(auth, emailInput.value.trim(), passwordInput.value);
        if (creatingAccount && !credential.user.emailVerified) {
          try {
            await sendEmailVerification(credential.user, {
              url: `${window.location.origin}${window.location.pathname}`
            });
          } catch (error) {
            message.textContent = 'Your account was created, but the verification email could not be sent yet.';
          }
        }
        resolve(credential.user);
      } catch (error) {
        message.textContent = friendlyAuthError(error.code);
        setFormBusy(form, false);
      }
    };

    form.addEventListener('submit', event => {
      event.preventDefault();
      submit(false);
    });
    document.querySelector('#sign-up').addEventListener('click', () => submit(true));
    document.querySelector('#reset-password').addEventListener('click', async () => {
      if (!emailInput.value.trim()) {
        message.textContent = 'Enter your email first, then choose Forgot password.';
        return;
      }
      message.textContent = 'Sending reset email...';
      try {
        await sendPasswordResetEmail(auth, emailInput.value.trim(), {
          url: `${window.location.origin}${window.location.pathname}`
        });
        message.textContent = 'Check your email for a password-reset link.';
      } catch (error) {
        message.textContent = friendlyAuthError(error.code);
      }
    });
  });
}

function setFormBusy(form, busy) {
  form.querySelectorAll('button').forEach(button => {
    button.disabled = busy;
  });
}

function friendlyAuthError(code) {
  const messages = {
    'auth/email-already-in-use': 'An account already uses this email. Choose Sign in instead.',
    'auth/invalid-credential': 'The email or password is incorrect.',
    'auth/invalid-email': 'Enter a valid email address.',
    'auth/missing-password': 'Enter your password.',
    'auth/network-request-failed': 'The internet connection failed. Please try again.',
    'auth/too-many-requests': 'Too many attempts were made. Wait a little while, then try again.',
    'auth/weak-password': 'Use a stronger password with at least 8 characters.'
  };
  return messages[code] || 'The account request did not work. Please try again.';
}

function showConnectionProblem() {
  document.querySelector('#app').innerHTML = `<main class="auth-screen"><section class="auth-card"><div class="eyebrow">STUDYMONKEY</div><h1>Accounts need one small fix</h1><p>StudyMonkey could not connect to Firebase. Check the Firebase configuration, then refresh this page.</p></section></main>`;
}

