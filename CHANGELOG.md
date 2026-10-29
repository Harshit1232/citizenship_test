# Changelog

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
- Study, history, analytics, settings, export and import
