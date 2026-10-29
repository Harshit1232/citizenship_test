# Current state: checkpoint 2 (29 October 2026)

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
  - `/practice/test/`, the mock test:
    - timer, question map, review flags, Listen, A/B/C keys, save and resume
    - results showing both pass conditions
    - a notice when custom settings are in use
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
- **Explanations** now show the question's reference number and a "Report a mistake" link.
- **Security:**
  - headers in `public/_headers`
  - the plan in `docs/security.md`
  - unused font packages removed; 3 runtime dependencies left
- **Storage:** the same `ocb.*` keys as the old app, plus `ocb.schema` (v1).

## Not built yet

- Accounts, payments and a waitlist
- A contact address (`site.contactEmail` is empty, so the corrections and privacy pages say contact is being set up)
- CI on GitHub, branch protection and Dependabot (owner actions listed in `docs/security.md`)

## Verified (29 October 2026)

| Check | Result |
|---|---|
| Unit tests (Vitest) | 59 passing: paper building, marking, session restore, migration, marketing numbers, progress aggregates, study filters and saved order, export and delete |
| TypeScript, ESLint | Clean |
| Static build | 13 routes plus a 404 page |
| axe-core (WCAG 2.2 AA plus best practice) | 0 violations on every route, light and dark, 1280 and 360 px wide. Checked with sample data, including revealed flashcards, list view, custom settings, the heatmap detail panel, the delete dialog and every exam state. |
| Keyboard | Full mock test by keyboard only. Study: Space reveals then moves on; arrows move. Heatmap: one tab stop, arrows move, Enter opens the detail. Chart: arrows read out each test. Settings are reachable and save. |
| Content-Security-Policy | Every route loads under the policy in `public/_headers` with 0 violations. A deliberately strict policy does produce violations, so the test works. |
| Returning user from the old HTML | Checked at checkpoint 1: the old file's data carries over byte-identical. Storage keys are unchanged since then. |
| Horizontal overflow, console errors | None on any route at 360 or 1280 px, either theme |
| JavaScript weight | About 154 to 158 KB gz per page in modern browsers, almost all of it the Next/React runtime. The question bank is a 33 KB gz chunk loaded on practice pages only. CSS is about 12 KB gz. |
| Dependencies | `npm audit`: 0 known vulnerabilities |

## Not verified

- Lighthouse or real-device performance on a mid-range phone
- Screen readers (VoiceOver, TalkBack). axe and keyboard checks are not a substitute.
- Safari and Firefox. All automated checks used Chromium. Scroll-driven parallax only works in Chromium today; other browsers show a still landscape by design.
- The headers on a real host, because nothing is deployed yet
- The question bank's content (see `CONTENT_ISSUES.md`)
