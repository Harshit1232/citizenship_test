# Changelog

## Unreleased

### Added
- **Exam-day simulator.** The practice test now follows the official practice test's layout and rules (checked 30 October 2026):
  - 5 questions from each part, in part order, each with its part label, so the values questions are the last five
  - a question list with not answered, answered and Review later marks
  - plain radio answers and a Review later checkbox
  - Previous, Next and Submit; Submit is locked until every question has an answer
  - a "Warning: Are you ready to submit your test attempt?" confirmation
  - a footer with questions answered and "Time remaining: hh:mm:ss"
  - a result page worded like the official one, followed by the missed questions with their reasons
- Larger text during tests: a button on the test screen and a setting under Appearance.
- "Listen to why" on every explanation and on scenario feedback.
- **Automated tests in three layers:**
  - component tests with Testing Library in jsdom
  - end-to-end tests with Playwright at desktop and phone sizes, against the built site served with the production headers
  - axe accessibility and CSP checks on every page and test state
- A CI workflow running all of the above, `npm run check`, and `scripts/serve-static.mjs`.
- **Values mastery track.** 38 scenarios, one for each rule in Part 4 of *Our Common Bond*, grouped into the five values areas. Each puts a rule in an everyday situation, asks one question, then explains the value, why each answer is right or wrong, and the booklet page. Answer first, with an optional hint. Scenarios can be linked to directly. Tests check that the scenarios teach all 54 values questions in the bank, and check sentence length and answer balance.
- **Values gate.** 10 values questions in a row, 2 from each area, mixing scenarios and bank questions. One wrong answer ends the run.
- **Readiness check** on the overview and progress pages. It is a published rule, not a prediction: the last 3 real-format tests at 85% or more with no values errors, plus the gate cleared.
- "Values" in the practice nav. The home page and pricing point to the values track. Values mastery and the readiness check are free during early access.

### Removed
- The "Label the values questions" setting. The official practice test labels every question with its part, so the values part is always visible.
- The A, B and C answer keys on the test screen. The letters are gone to match the official test; arrow keys still work. Scenarios and the values check keep them.
- The score ring on the result page.

### Checked
- Q314's page reference (p.38) was checked against the official PDF and is correct, so it was not changed. See `CONTENT_ISSUES.md`.

### Changed
- Official-format papers no longer include glossary questions, because the official practice test scores only Parts 1 to 4. Glossary questions stay in study and custom tests.
- Custom papers are also put in part order.
- The home page's "how it works" phone shows the new test screen and result wording.
- Each dialog has its own title id. Before, every dialog shared one, which breaks screen-reader labels when two are on a page.
- The timer no longer pulses in the last minute. Mid-fade, the red digits failed the contrast check.
- The result page's next steps point to the values track and the readiness check, now that both exist. They replace the "coming in the full version" note.
- The home page widget about the values rule is redesigned after user feedback that it was hard to follow. It now compares two example tests: Jordan gets 19 of 20 and doesn't pass, and Alex gets 16 of 20 and passes. The values questions sit on their own row, each pass rule is checked off in words, and a takeaway line says why. The old tap-to-flip sandbox is gone.

## 0.2.0: checkpoint 2 (2026-10-29)

### Added
- Practice area with a shared section nav: overview, study, progress and settings, ported from the original app with the same `ocb.*` storage keys
- Progress charts: score trend (keyboard and hover readout), accuracy by part and topic, question heatmap with a detail panel
- Settings save as you change them; download your data as JSON; delete history
- About, pricing, privacy, terms and corrections pages; privacy and terms are marked as drafts
- A question reference and "Report a mistake" link under every explanation
- Security headers (`public/_headers`) and `docs/security.md`

### Changed
- History and analytics are combined into one progress page
- The test start screen names the custom settings in use and links to settings
- "Save and exit" now returns to the practice overview
- The pricing page lists study and topic tests as free; they were free in the original app

### Removed
- Two unused font packages; their licences are kept beside the font files

## 0.1.0: checkpoint 1 (2026-10-29)

The single-file app has been rebuilt as a Next.js 16 project.

### Added
- Design system with light and dark themes and a `/design/` reference page
- Marketing home page with hero values-gate animation, scroll-driven landscape, how it works, values rule (sourced figures), trust, pricing, FAQ
- Values check: 10 values questions with instant feedback
- Storage schema version (`ocb.schema`) and migration that keeps old data
- Unit tests for paper building, marking, session restore, migration and marketing numbers

### Changed
- Pass mark compares the exact fraction instead of a rounded percentage (same result for 20-question tests)
- Answering no longer auto-advances to the next question
- Exam questions no longer show their booklet part, which gave away the values questions
- Dimmed answer options in feedback use muted colour instead of opacity, so the text stays readable

### Not yet ported
- Study, history, analytics, settings and data export
