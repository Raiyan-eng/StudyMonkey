import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config.js';

const configured = SUPABASE_URL.startsWith('https://') && SUPABASE_PUBLISHABLE_KEY.length > 20;

export async function initAuth(fallbackState) {
  window.studymonkeyAuth = { isConfigured: configured, email: null, syncState: () => {} };
  if (!configured) return fallbackState;

  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  let session;
  try {
    ({ data: { session } } = await supabase.auth.getSession());
  } catch (error) {
    showConnectionProblem();
    return fallbackState;
  }
  if (!session) session = await showAuthGate(supabase);
  if (!session) return fallbackState;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
  const { data: userSubjects } = await supabase.from('student_subjects').select('subject').eq('user_id', session.user.id);
  const state = {
    ...fallbackState,
    ...(profile?.app_state || {}),
    subjects: userSubjects?.length ? userSubjects.map(item => item.subject) : fallbackState.subjects
  };

  window.studymonkeyAuth = {
    isConfigured: true,
    email: session.user.email,
    signOut: async () => {
      await supabase.auth.signOut();
      window.location.reload();
    },
    syncState: async currentState => {
      const profileResult = await supabase.from('profiles').upsert({
        id: session.user.id,
        email: session.user.email,
        app_state: { ...currentState, subjects: undefined },
        updated_at: new Date().toISOString()
      });
      if (profileResult.error) return;
      const deleteResult = await supabase.from('student_subjects').delete().eq('user_id', session.user.id);
      if (deleteResult.error) return;
      if (currentState.subjects.length) {
        await supabase.from('student_subjects').insert(currentState.subjects.map(subject => ({ user_id: session.user.id, subject })));
      }
    }
  };
  return state;
}

function showAuthGate(supabase) {
  const app = document.querySelector('#app');
  app.innerHTML = `<main class="auth-screen"><section class="auth-card"><div class="eyebrow">STUDYMONKEY</div><h1>Your private study space</h1><p>Create an account to keep your subjects, progress, and quiz results safe across devices.</p><form id="auth-form"><label>Email<input id="auth-email" type="email" required autocomplete="email"></label><label>Password<input id="auth-password" type="password" minlength="8" required autocomplete="current-password"></label><p id="auth-message" role="status"></p><button class="primary" type="submit">Sign in</button><button id="sign-up" type="button">Create account</button><button id="reset-password" class="text-button" type="button">Forgot password?</button></form><p class="auth-note">Your password is handled securely by Supabase. New accounts may need email confirmation before signing in.</p></section></main>`;
  return new Promise(resolve => {
    const message = document.querySelector('#auth-message');
    const form = document.querySelector('#auth-form');
    const submit = async signUp => {
      if (!form.reportValidity()) return;
      const email = document.querySelector('#auth-email').value;
      const password = document.querySelector('#auth-password').value;
      message.textContent = 'Please wait...';
      let result;
      try {
        result = signUp
          ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}` } })
          : await supabase.auth.signInWithPassword({ email, password });
      } catch (error) {
        message.textContent = 'We could not reach the account service. Please try again.';
        return;
      }
      if (result.error) { message.textContent = result.error.message; return; }
      if (!result.data.session) { message.textContent = 'Check your email, confirm your account, then sign in.'; return; }
      resolve(result.data.session);
    };
    form.addEventListener('submit', event => { event.preventDefault(); submit(false); });
    document.querySelector('#sign-up').addEventListener('click', () => submit(true));
    document.querySelector('#reset-password').addEventListener('click', async () => {
      const email = document.querySelector('#auth-email').value;
      if (!email) { message.textContent = 'Enter your email first, then choose Forgot password.'; return; }
      message.textContent = 'Sending reset email...';
      const result = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.href });
      message.textContent = result.error ? result.error.message : 'Check your email for a password-reset link.';
    });
  });
}

function showConnectionProblem() {
  document.querySelector('#app').innerHTML = `<main class="auth-screen"><section class="auth-card"><div class="eyebrow">STUDYMONKEY</div><h1>Accounts need one small fix</h1><p>StudyMonkey could not connect to its account service. Check the Supabase project URL and publishable key, then refresh this page.</p></section></main>`;
}

