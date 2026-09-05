import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config.js';

const configured = SUPABASE_URL.startsWith('https://') && SUPABASE_PUBLISHABLE_KEY.length > 20;

export async function initAuth(fallbackState) {
  window.studymonkeyAuth = { isConfigured: configured, email: null, syncState: () => {} };
  if (!configured) return fallbackState;

  const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
  let { data: { session } } = await supabase.auth.getSession();
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
    syncState: async currentState => {
      await supabase.from('profiles').upsert({
        id: session.user.id,
        email: session.user.email,
        app_state: { ...currentState, subjects: undefined },
        updated_at: new Date().toISOString()
      });
      await supabase.from('student_subjects').delete().eq('user_id', session.user.id);
      if (currentState.subjects.length) {
        await supabase.from('student_subjects').insert(currentState.subjects.map(subject => ({ user_id: session.user.id, subject })));
      }
    }
  };
  return state;
}

function showAuthGate(supabase) {
  document.body.innerHTML = `<main class="auth-screen"><section class="auth-card"><div class="eyebrow">STUDYMONKEY</div><h1>Your private study space</h1><p>Create an account to keep your subjects, progress, and quiz results safe across devices.</p><form id="auth-form"><label>Email<input id="auth-email" type="email" required autocomplete="email"></label><label>Password<input id="auth-password" type="password" minlength="8" required autocomplete="current-password"></label><p id="auth-message" role="status"></p><button class="primary" type="submit">Sign in</button><button id="sign-up" type="button">Create account</button></form><p class="auth-note">We never show your password to StudyMonkey. You can delete your data later from Settings.</p></section></main>`;
  return new Promise(resolve => {
    const message = document.querySelector('#auth-message');
    const submit = async signUp => {
      const email = document.querySelector('#auth-email').value;
      const password = document.querySelector('#auth-password').value;
      message.textContent = 'Please wait...';
      const result = signUp
        ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.href } })
        : await supabase.auth.signInWithPassword({ email, password });
      if (result.error) { message.textContent = result.error.message; return; }
      if (!result.data.session) { message.textContent = 'Check your email, confirm your account, then sign in.'; return; }
      resolve(result.data.session);
    };
    document.querySelector('#auth-form').addEventListener('submit', event => { event.preventDefault(); submit(false); });
    document.querySelector('#sign-up').addEventListener('click', () => submit(true));
  });
}

