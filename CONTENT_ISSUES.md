# Content issues

These are problems found in the question bank (`src/data/question-bank.json`). A full content audit has **not** been done yet. This list only covers what came up during the rebuild.

| # | Question | Issue | Severity | Status |
|---|---|---|---|---|
| 1 | Q176 "Who is Australia's Head of State?" | The answer names King Charles III, while the bank says © 2020. | | **Resolved 30 Oct 2026:** the current official PDF is still marked © 2020 and names King Charles III on page 26, so the bank matches it. |
| 4 | Q314 "What do Australian citizens pledge…?" | The bank cites page 38, but the pledge text is on page 4 of the current PDF. | Low | Open: change the source to p.4 after a human check, then log it on `/corrections/` |
| 2 | Bank-wide | `meta.note` says IDs don't match the four-option PDF answer key, and one distractor per question was dropped. Nobody has checked that the dropped distractor was always the weakest. | Low | Open |
| 3 | Bank-wide | Page references in explanations have not been spot-checked against the current PDF. | Medium | Open: check a sample of 30 before launch |

## Verified by tests

`src/lib/marketing-data.test.ts` checks every number used in marketing copy against the bank:

- 336 questions and 54 values questions
- the five values-area counts (6, 11, 11, 7 and 19)
- the sample question shown on the home page, which must exist verbatim

If the bank changes, these tests fail before the copy goes stale.
