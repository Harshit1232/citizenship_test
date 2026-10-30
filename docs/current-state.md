# Current state: checkpoint 4 (30 October 2026)

## Built

- **Design system:** tokens, light and dark themes, type scale and components. Live at `/design/`.
- **Marketing site**
  - Home page:
    - hero with the animated values gate and a parallax landscape
    - values-rule section with sourced pass-rate figures
    - scroll-driven "how it works"
    - trust section, pricing, FAQ, and a footer with the CC BY attribution
  - Content pages:
    - `/about/`
    - `/pricing/`
    - `/privacy/` and `/terms/`, both shown as drafts until a lawyer reviews them
    - `/corrections/`, with a public log of fixes
- **Practice area.** A shared section nav runs across every practice page: inline on desktop, a scrollable row on phones.
  - `/practice/`, the overview:
    - a resume card for a paused test
    - links to start a test, the values check or study
    - stat tiles, weakest and strongest topics, and the last five tests
  - `/practice/test/`, the mock test, laid out like the official practice test (checked 30 October 2026):
    - 5 questions from each part, in part order, with a part label above each question, so the values questions are the last five
    - a question list with not answered, answered and Review later marks
    - plain radio answers, a Review later checkbox, Previous, Next and Submit
    - Submit locked until every question has an answer, then a "Warning" confirmation
    - a footer with "N of 20 questions answered" and "Time remaining: hh:mm:ss"
    - Listen, Larger text and the theme switch; save and resume
    - a result page worded like the official one (values x/5, overall mark x/20, each part out of 5), then every missed question with its reason
    - a notice when custom settings are in use
  - `/practice/values/`, the values mastery track:
    - 38 scenarios, one for each rule in Part 4 of the booklet, in five areas (see `docs/values-scenarios.md`)
    - answer first, then the meaning, why each answer is right or wrong, and the booklet page
    - an optional hint, and direct links to each scenario
  - `/practice/values/gate/`: 10 values questions in a row, 2 from each area, mixing scenarios and bank questions. One wrong answer ends the run.
  - A readiness check on the overview and progress pages: the last 3 real-format tests at 85% or more with no values errors, plus the gate cleared. It is a rule, not a prediction.
  - `/practice/values-check/`: 10 values questions with instant feedback.
  - `/practice/study/`:
    - flashcards or a list, filtered by part or topic, or only the questions you've missed
    - shuffle, and the Space and arrow keys
    - your place is saved in `ocb.study`, the same key the old app used
  - `/practice/progress/`, which combines the old History and Analytics pages:
    - stat tiles
    - score trend chart, which you can explore by keyboard
    - accuracy by part and by topic
    - a suggested next test aimed at weak topics
    - a question heatmap with a detail panel
    - "keeps catching you out"
    - the full test history, with an option to delete it
  - `/practice/settings/`:
    - the real test's format or a custom one: topics, length, timer and the values rules
    - appearance
    - download your data as JSON
    - delete your history
    - saves as you change things
- **Explanations** show the question's reference number, a "Report a mistake" link and a "Listen to why" button. Scenario feedback can be listened to as well.
- **Security:**
  - headers in `public/_headers`
  - the plan in `docs/security.md`
  - unused font packages removed; 3 runtime dependencies left
- **Storage:** the same `ocb.*` keys as the old app, plus `ocb.schema` (v1).

## Not built yet

- Accounts, payments and a waitlist
- A contact address (`site.contactEmail` is empty, so the corrections and privacy pages say contact is being set up)
- Branch protection and Dependabot (owner actions listed in `docs/security.md`). CI is running; branch protection would make a green CI run required before merging.

## Verified (30 October 2026)

| Check | Result |
|---|---|
| Unit and component tests (Vitest) | 101 passing across 14 files. **Unit tests** cover the rules and data: paper building (5 per part, in part order, values last), marking, sessions, storage, progress, study, scenario content, the gate and readiness. **Component tests** run in jsdom with Testing Library and drive real screens: a whole test, the Submit lock and warning, resuming after leaving, the larger-text setting, both result outcomes, a scenario (first attempt only), the gate ending on a wrong answer and clearing after 10, and the readiness card. |
| End-to-end tests (Playwright, Chromium) | 72 passing: 36 tests at desktop (1280 px) and phone (Pixel 7) sizes, against the built site with the production headers. They cover: <ul><li>the full test in the official layout</li><li>No in the warning</li><li>Review later</li><li>a reload mid-test</li><li>the clock running out (simulated with a fake clock)</li><li>keyboard answering</li><li>the result reaching progress</li><li>the values track and its deep links</li><li>the gate</li><li>data written by the original app</li><li>the 404 page</li></ul> |
| axe-core (WCAG 2.2 AA plus best practice) | 0 violations, run inside the end-to-end tests at both sizes. Covers all 20 pages, plus the test screen, the locked-Submit message, larger text, the warning dialog, the result, and the test screen in dark mode. These tests found two real problems, both fixed: <ul><li>the last-minute timer pulse faded red text below contrast</li><li>every dialog shared one title id</li></ul> |
| Content-Security-Policy and console | Every page loads under the policy from `public/_headers` with no console errors or CSP violations. The tests check that the header is actually sent. |
| TypeScript, ESLint | Clean |
| Static build | 20 routes plus a 404 page |
| Official practice test comparison | Gone through by hand on 30 October 2026: <ul><li>the welcome page</li><li>the question screen and Review later</li><li>the locked Submit and its tooltip</li><li>the warning dialog</li><li>the result page</li></ul>Layout and wording were matched as listed in `DESIGN.md`. |
| Dependencies | `npm audit`: 0 known vulnerabilities |
| CI | `.github/workflows/ci.yml` runs lint, typecheck, unit and component tests, the build and the end-to-end tests on every push to `main` and every pull request. The first run on GitHub caught a typecheck that only passed locally: generated Next types were missing on a fresh checkout. It was fixed with `next typegen`, and the next run passed every step. |

Not re-checked this round: JavaScript weight (about 154 to 158 KB gz per page at checkpoint 3) and horizontal overflow on pages other than the test screen and home page.

## Not verified

- Lighthouse or real-device performance on a mid-range phone
- Screen readers (VoiceOver, TalkBack). axe and keyboard checks are not a substitute.
- Safari and Firefox. All automated checks used Chromium. Scroll-driven parallax only works in Chromium today; other browsers show a still landscape by design.
- The headers on a real host, because nothing is deployed yet
- The question bank's content (see `CONTENT_ISSUES.md`)
