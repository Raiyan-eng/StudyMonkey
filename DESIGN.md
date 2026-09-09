# StudyMonkey Design Guide

## Visual direction

StudyMonkey should feel focused, energetic, and reassuring for Cambridge IGCSE students. It uses a deep black-and-blue study space with bright blue actions, short plain-English writing, and roomy layouts that do not feel like a school portal.

## Colour roles

- Background: `#060b16`
- Surface: `#101b2e`
- Raised surface: `#172842`
- Primary action: `#1479ff`
- Primary action hover: `#2d8cff`
- Main text: `#f8fbff`
- Supporting text: `#aebbd0`
- Border: `#36577e`
- Success: `#38d996`
- Warning: `#ffd166`

Eye-soothing mode uses warm paper colours and dark brown text. It should reduce glare while keeping the same layout and meaning.

## Type and writing

- Use a clear system sans-serif font.
- Keep headings short and helpful.
- Explain difficult ideas in small chunks, using familiar examples before technical terms.
- Buttons should start with a clear action: “Start studying”, “Ask the tutor”, “Try a quiz”.
- Never use jargon without explaining it.

## Components

- Cards have one job each and should not be nested unnecessarily.
- Main actions use bright blue filled buttons.
- Secondary actions use dark outlined buttons.
- Inputs must have visible labels, clear focus rings, and friendly error messages.
- Progress should show a number or plain-language explanation, not only a coloured bar.
- Account notices should explain what happened and the next action in one sentence.

## Layout and responsiveness

- The desktop sidebar contains navigation and account status.
- On small screens, navigation becomes a compact two-column grid.
- Keep main content easy to scan, with generous spacing and a readable maximum width.
- Use at least 44px touch targets for buttons and controls.

## Accessibility rules

- Keep text contrast high in both display modes.
- Do not use colour alone to show correct, incorrect, or important states.
- Use semantic headings, labels, and status messages.
- Support keyboard use for every action.

## Avoid

- Purple gradients, glassy panels, or unnecessary animation.
- Dense walls of text.
- More than one main blue button per small card.
- Payment wording that suggests money was taken before payments are connected.
