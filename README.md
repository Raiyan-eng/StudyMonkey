# StudyMonkey

A browser-based MVP for a Cambridge IGCSE study tutor.

## Included features

- Firebase email/password accounts with verification, password reset, and sign-out.
- Private Firestore progress storage protected by per-student security rules.
- First-login subject picker for ten IGCSE subjects.
- Subject-specific starter lessons, summaries, read-aloud, quizzes, and progress.
- Dark and eye-soothing display modes.
- Free access during the MVP launch, with one optional StudyMonkey Plus plan preview for later.
- A private AI tutor API that receives the current subject and unit with every question.

## Firebase setup

1. Register a Firebase web app and place its public configuration in `config.js`.
2. Enable Email/Password in Firebase Authentication.
3. Create a Standard-edition Firestore database in Production mode.
4. Replace the database rules in the Firebase console with `firestore.rules`, then publish them.
5. Add `raiyan-eng.github.io` under Authentication > Settings > Authorized domains if it is not already listed.

The Firebase web configuration is public and safe for browser use. Never add private service-account credentials or an OpenAI API key to this repository.

## Make the AI tutor live

The website stays on GitHub Pages. The private tutor API should be deployed as a separate Vercel project so its secrets never appear in the website code.

1. Create a Vercel account and import the `StudyMonkey` GitHub repository.
2. In Vercel Project Settings > Environment Variables, add these private values from `.env.example`:
   - `OPENAI_API_KEY`: create this in the OpenAI platform, then add it only in Vercel.
   - `FIREBASE_SERVICE_ACCOUNT`: the entire Firebase Admin service-account JSON, stored as one line.
   - `ALLOWED_ORIGIN`: `https://raiyan-eng.github.io`
   - `OPENAI_MODEL`: `gpt-5`
3. Deploy the Vercel project. Copy its public address ending in `/api/tutor`.
4. Put that address in `TUTOR_API_URL` in `config.js`, then publish the website update.

The endpoint checks that a caller is signed in with Firebase, accepts questions only from StudyMonkey, limits each user to 30 questions per hour in one server instance, and keeps OpenAI requests private. The simple rate limit is an early safeguard; a production subscription system should replace it with a shared database-based limit.

## Check the tutor deployment

Open the deployed `/api/tutor` address in a browser. A successful deployment returns a small status response. `configured: true` means both private server credentials are present.

## Still needed before a full launch

- A secure server-side AI tutor connection.
- Payment processing only if StudyMonkey Plus is introduced later.
- Full original curriculum content and a reviewed privacy policy.

