# Values scenarios: how they are designed

The content lives in `src/data/values-scenarios.ts`, and its rules are tested in `src/data/values-scenarios.test.ts`.

## Why 38

Part 4 of *Our Common Bond* (pages 34 to 39) states a set of distinct rules: things the test can ask about. Each rule gets one scenario. The count follows from the booklet, not from a target.

| Area | Booklet page | Rules (one scenario each) | Count |
|---|---|---|---|
| Rule of Law and parliamentary democracy | 34 | What values are based on; obeying when no one is watching; no one above the law; law over custom; elected parliaments make laws; compulsory voting | 6 |
| Freedom of speech, association and religion | 35 | Criticising government (media too); peaceful protest; promoting violence; false allegations and urging law-breaking; joining and leaving groups; any religion or none; religious law and polygamy; forced marriage | 8 |
| Equality under the law and a fair go | 36 | Equal rights whatever your faith or background; same-sex marriage; women's choices about study, work, marriage and religion; better-qualified woman gets the job; either spouse can divorce; violence against a partner; merit over class and connections | 7 |
| Mutual respect and tolerance | 37 | Disagreeing peacefully; verbal abuse is violence; racism, including online and at sport; religious intolerance; lawful police requests; age of consent | 6 |
| Community, contribution and loyalty | 38 to 39, plus page 4 | Contributing and supporting yourself; mateship and compassion; volunteering; English; reporting serious crime; reporting child abuse; cyber abuse; dual citizenship; laws that apply overseas; secrets and spreading fear; the pledge | 11 |

**Coverage is tested.** Every one of the 54 values questions in the practice bank is listed in some scenario's `covers`. If a bank question is added or changed, the test fails until a scenario teaches it.

## How a scenario works

1. **Situation and question first.** The learner judges a real-life situation before seeing the rule. Answering first and then reading the explanation is what turns the rule into understanding instead of word-matching. Learners who need help can tap **Show a hint**, which shows the rule in plain words.
2. **After answering**, the screen shows:
   - what the value means, plus the booklet's own example where there is one
   - why each of the three answers is right or wrong
   - a one-line "Remember" rule
   - the booklet page
3. **The values gate** then tests without hints. It asks 10 questions in a row, 2 from each area, mixing scenarios and bank questions. One wrong answer ends the run, just as one wrong values answer fails the real test.
4. **The readiness check** needs the gate cleared plus the last 3 real-format practice tests at 85% or more with no values errors.

## Writing rules

- **Plain English.** Every sentence is 26 words or fewer (tested). Use everyday words.
- **One question, three options, one reason per option.** Each wrong option is a real misconception, not filler.
- **The right answer is not the longest option** in more than half of the scenarios (tested), and right answers are spread across A, B and C (tested).
- **No group is cast as the problem.** People who do the wrong thing get no name, nationality or religion. Named characters come from many backgrounds and are always the ones doing the right thing, or being wronged.
- **Sensitive topics stay factual.** Violence, abuse and consent are stated plainly and never described in detail.
- **Stay inside the booklet.** A few reasons add a closely related, well-established fact: the marriage law is the same in every state, calling 000 when a child is in immediate danger, and that voting is not optional. Nothing should go further than that.

## Before launch: human review

A person must check every scenario against the current booklet PDF before paid launch. Every scenario was written from the booklet text, and the facts and page numbers were spot-checked against the official PDF on 30 October 2026, but they have not had a line-by-line review. To review one:

1. Open the scenario at `/practice/values/<area>/#<id>`.
2. Check the meaning and every reason against the cited page.
3. Log any fix on `/corrections/` (`src/lib/corrections.ts`).
