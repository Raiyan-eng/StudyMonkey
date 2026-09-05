# StudyMonkey

A browser-based MVP prototype for an IGCSE AI study tutor.

## Run it

Open `index.html` in a browser. No installation is required.

## Included prototype features

- Subject selection: Biology, Mathematics, Computer Science, Physics, Chemistry, Additional Maths, Accounting, Economics, Business Studies, and English.
- Chapter 1–2 dashboard structure for every subject.
- Lesson, tutor, quiz, results, and progress flow.
- Dark and eye-soothing display modes.
- Local data deletion control and privacy placeholder.
- Three-session free trial counter and subscription-plan preview.

## Before launch

This is a front-end prototype. A production version still needs secure authentication, a private database, server-side AI calls, payment processing, a real privacy policy, and full lesson content.

## Enable real accounts

1. Create a Supabase project.
2. In the Supabase SQL Editor, run `supabase/schema.sql`.
3. Copy `config.example.js` to `config.js` and replace the two placeholder values with the project URL and publishable key from Supabase.
4. In Supabase Authentication settings, add `https://raiyan-eng.github.io/StudyMonkey/` as an allowed redirect URL.

The publishable key is safe to use in the browser. Never put a Supabase service-role key or an OpenAI API key in this project.

