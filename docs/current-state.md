# Current state: checkpoint 1 (29 October 2026)

## Built

- **Design system:** tokens, light and dark themes, type scale, components. Live at `/design/`.
- **Marketing home:**
  - Hero with the animated values gate and a parallax landscape
  - Values-rule section with sourced pass-rate figures
  - Scroll-driven "how it works"
  - Trust section, pricing (paid tier marked "In development"), FAQ, footer with CC BY attribution
- **Mock test:**
  - Start screen
  - Running test with timer, question map, review flags, Listen (speech), A/B/C keys and save-and-resume
  - Finish dialog
  - Results showing both gates, a by-part breakdown and every wrong answer with its explanation
- **Values check:** 10 values questions with instant feedback.
- **Storage:** reads and writes the old file's `ocb.*` keys, and adds `ocb.schema` (v1). Corrupt entries are dropped and valid data is kept.

## Not built yet (old HTML still covers these)

- Study by booklet part, history, analytics, settings, and data export or import
- Pricing, About, Corrections, Privacy and Terms pages
- Accounts, payments, waitlist

## Verified

| Check | Result |
|---|---|
| Unit tests (Vitest) | 38 passing: paper building, marking, session restore, migration, marketing numbers |
| TypeScript, ESLint | Clean |
| Static build | 4 routes plus a 404 page |
| axe-core (WCAG 2.2 AA plus best practice) | 0 violations on home, exam start, question, finish dialog, results, values check, design and 404. Light and dark, 1280 and 360 px wide. |
| Keyboard-only full test | Passed. Skip link first; A/B/C to answer; visible focus on every control; focus moves to each new question heading; Escape closes the finish dialog and returns focus; focus lands on the result heading. |
| Returning user from the old HTML | Ran the old file on the same origin, finished one test and paused a second at question 4 with 3 answers. Opened the new app: theme kept, history and question stats byte-identical, the paused test resumed at question 4 with the clock intact. |
| Horizontal overflow | None at 360 or 1280 px, either theme |
| Console errors | None on any route |
| Home page JS | About 156 KB gz in modern browsers (a 39 KB legacy polyfill loads only in old browsers). About 11 KB is app code. |
| Question bank | 33 KB gz lazy chunk, loaded on practice routes only. CSS is about 10 KB gz. |

## Not verified

- Lighthouse or real-device performance on a mid-range phone
- Screen readers (VoiceOver, TalkBack). axe and keyboard checks are not a substitute.
- Safari and Firefox. Screenshots and automated checks used Chromium only. Scroll-driven parallax is Chromium-only today; other browsers show a static landscape by design.
- The question bank's content (see `CONTENT_ISSUES.md`)
