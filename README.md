# StudyMonkey

A browser-based MVP for a Cambridge IGCSE study tutor.

## Included features

- Firebase email/password accounts with verification, password reset, and sign-out.
- Private Firestore progress storage protected by per-student security rules.
- First-login subject picker for ten IGCSE subjects.
- Subject-specific starter lessons, summaries, read-aloud, quizzes, and progress.
- Dark and eye-soothing display modes.
- Three-session free trial counter and a subscription preview that takes no payments.

## Firebase setup

1. Register a Firebase web app and place its public configuration in `config.js`.
2. Enable Email/Password in Firebase Authentication.
3. Create a Standard-edition Firestore database in Production mode.
4. Replace the database rules in the Firebase console with `firestore.rules`, then publish them.
5. Add `raiyan-eng.github.io` under Authentication > Settings > Authorized domains if it is not already listed.

The Firebase web configuration is public and safe for browser use. Never add private service-account credentials or an OpenAI API key to this repository.

## Still needed before a full launch

- A secure server-side AI tutor connection.
- Payment processing for subscription plans.
- Full original curriculum content and a reviewed privacy policy.
