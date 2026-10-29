# Changelog

## Unreleased

### Changed
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
