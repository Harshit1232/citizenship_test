# Content issues

These are problems found in the question bank (`src/data/question-bank.json`). A full content audit has **not** been done yet. This list only covers what came up during the rebuild.

| # | Question | Issue | Severity | Status |
|---|---|---|---|---|
| 1 | Q176 "Who is Australia's Head of State?" | The answer names King Charles III. The bank's source line says *Our Common Bond* © 2020, which predates his reign, so the bank was edited from a later edition or by hand. If the explanations' page numbers come from the 2020 edition, they may not match the booklet people download today. | Medium: wrong page numbers erode the "every answer traced to its page" promise | Open: check which edition the page numbers came from, then update `meta.source` |
| 2 | Bank-wide | `meta.note` says IDs don't match the four-option PDF answer key, and one distractor per question was dropped. Nobody has checked that the dropped distractor was always the weakest. | Low | Open |
| 3 | Bank-wide | Page references in explanations have not been spot-checked against the current PDF. | Medium | Open: check a sample of 30 before launch |

## Verified by tests

`src/lib/marketing-data.test.ts` checks every number used in marketing copy against the bank:

- 336 questions and 54 values questions
- the five values-area counts (6, 11, 11, 7 and 19)
- the sample question shown on the home page, which must exist verbatim

If the bank changes, these tests fail before the copy goes stale.
