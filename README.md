# StudyMonkey

A browser-based MVP prototype for an IGCSE AI study tutor.

## Run it

Open `index.html` in a browser. No installation is required.

## Included prototype features

- Subject selection: Biology, Mathematics, Computer Science, Physics, Chemistry, Additional Maths, Accounting, Economics, Business Studies, and English.
- First-login subject picker, so a student only sees the subjects they study.
- Chapter 1–2 dashboard structure for every subject.
- Subject-specific starter lessons, summary, browser read-aloud, tutor, quiz, results, and progress flow.
- Dark and eye-soothing display modes.
- Browser-data deletion control, sign-out, and account recovery link.
- Three-session free trial counter and a clearly labelled subscription-plan preview (no payments are taken).

## Before launch

This is a front-end prototype. Accounts and private student-data storage are connected through Supabase. A production version still needs server-side AI calls, payment processing, a real privacy policy, account-deletion support, and full lesson content.

## Enable real accounts

1. Create a Supabase project.
2. In the Supabase SQL Editor, run `supabase/schema.sql`.
3. Copy `config.example.js` to `config.js` and replace the two placeholder values with the project URL and publishable key from Supabase.
4. In Supabase Authentication settings, add `https://raiyan-eng.github.io/StudyMonkey/` as an allowed redirect URL.

The publishable key is safe to use in the browser. Never put a Supabase service-role key or an OpenAI API key in this project.
