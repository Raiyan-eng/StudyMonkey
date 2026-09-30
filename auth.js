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
import { FIREBASE_CONFIG } from './config.js?v=firebase-3';

const configured = FIREBASE_CONFIG.apiKey?.length > 20 && FIREBASE_CONFIG.projectId?.length > 2;
let signInNotice = '';

export async function initAuth(fallbackState) {
  if (localStorage.getItem('studymonkey-demo') === 'true') {
    window.studymonkeyAuth = {
      isConfigured: configured,
      isDemo: true,
      email: 'Explorer mode',
      emailVerified: true,
      storageReady: true,
      getIdToken: async () => null,
      syncState: async state => { localStorage.setItem('studymonkey-demo-state', JSON.stringify(state)); return true; },
      signOut: () => { localStorage.removeItem('studymonkey-demo'); localStorage.removeItem('studymonkey-demo-state'); window.location.reload(); }
    };
    const saved = JSON.parse(localStorage.getItem('studymonkey-demo-state') || 'null');
    return saved || { ...fallbackState, onboarded: true, subjects: ['Biology', 'Mathematics', 'Computer Science', 'Physics', 'Chemistry', 'Additional Maths', 'Accounting', 'Economics', 'Business Studies', 'English'] };
  }
  window.studymonkeyAuth = { isConfigured: configured, email: null, emailVerified: false, storageReady: false, getIdToken: async () => null, syncState: async () => false };
  if (!configured) {
    showConnectionProblem();
    return fallbackState;
  }

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

  let state = { ...fallbackState };
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
        appState: createCloudAppState(state),
        updatedAt: serverTimestamp()
      });
    }
    storageReady = true;
  } catch (error) {
    storageReady = false;
  }

  let syncQueue = Promise.resolve();
  window.studymonkeyAuth = {
    isConfigured: true,
    email: user.email,
    emailVerified: user.emailVerified,
    storageReady,
    signInNotice,
    getIdToken: () => user.getIdToken(),
    signOut: async () => {
      await signOut(auth);
      window.location.reload();
    },
    resendVerification: async () => {
      if (user.emailVerified) return 'Your email is already verified.';
      try {
        await sendEmailVerification(user, actionCodeSettings());
        return 'Verification email sent. Check your inbox and spam folder.';
      } catch (error) {
        return friendlyAuthError(error.code);
      }
    },
    syncState: currentState => {
      const stateSnapshot = JSON.parse(JSON.stringify(currentState));
      syncQueue = syncQueue.catch(() => undefined).then(async () => {
        await setDoc(doc(database, 'students', user.uid), {
          email: user.email,
          subjects: stateSnapshot.subjects,
          appState: createCloudAppState(stateSnapshot),
          updatedAt: serverTimestamp()
        }, { merge: true });
        window.studymonkeyAuth.storageReady = true;
        return true;
      }).catch(() => {
        window.studymonkeyAuth.storageReady = false;
        return false;
      });
      return syncQueue;
    }
  };
  return state;
}

function createCloudAppState(state) {
  const { subjects, ...appState } = state;
  return appState;
}

function actionCodeSettings() {
  return { url: `${window.location.origin}${window.location.pathname}` };
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
  app.innerHTML = `<main class="auth-screen"><section class="launch-copy"><div class="launch-badge"><span></span> IGCSE LEARNING UNIVERSE</div><h1>Study like you're<br><em>leveling up.</em></h1><p>Ten subjects. Every syllabus unit. A personal AI tutor, interactive missions, audio explanations, quizzes and 3D learning worlds.</p><div class="launch-stats"><div><b>10</b><span>subject worlds</span></div><div><b>96</b><span>learning missions</span></div><div><b>24/7</b><span>AI tutor access</span></div></div><button id="demo-mode" class="demo-button" type="button"><span>Enter demo universe</span><i>→</i></button><small>No account needed. Your demo progress stays on this device.</small></section><section class="auth-stage"><div class="auth-orbit" aria-hidden="true"><span class="planet planet-a">Σ</span><span class="planet planet-b">DNA</span><span class="planet planet-c">01</span><div class="orbit-core">SM</div></div><section class="auth-card"><div class="eyebrow">PLAYER LOGIN</div><h2>Continue your journey</h2><p>Sign in to sync progress across devices.</p><form id="auth-form"><label>Email<input id="auth-email" type="email" required autocomplete="email" placeholder="you@example.com"></label><label>Password<input id="auth-password" type="password" minlength="8" required autocomplete="current-password" placeholder="8+ characters"></label><p id="auth-message" role="status"></p><button class="primary" type="submit">Enter StudyMonkey</button><button id="sign-up" type="button">Create new player</button><button id="reset-password" class="text-button" type="button">Forgot password?</button></form><p class="auth-note">Secured by Firebase. We never see your password.</p></section></section></main>`;

  return new Promise(resolve => {
    const form = document.querySelector('#auth-form');
    const message = document.querySelector('#auth-message');
    const emailInput = document.querySelector('#auth-email');
    const passwordInput = document.querySelector('#auth-password');
    document.querySelector('#demo-mode').addEventListener('click', () => {
      localStorage.setItem('studymonkey-demo', 'true');
      window.location.reload();
    });

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
            await sendEmailVerification(credential.user, actionCodeSettings());
            signInNotice = 'We sent a verification email. You can keep studying while you verify it.';
          } catch (error) {
            signInNotice = 'Your account was created, but the verification email could not be sent yet.';
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
        await sendPasswordResetEmail(auth, emailInput.value.trim(), actionCodeSettings());
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

