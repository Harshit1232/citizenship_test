# Design

The live reference is `/design/` (run `npm run dev`). This file covers why the system looks the way it does and the rules that keep it consistent.

## Direction

The visual direction is a calm, Australian landscape that feels local without becoming a tourism poster. People studying for this test are often anxious, and many read English as a second language. So the type is large, the contrast is high and the layout is plain. The test screen has no decoration at all.

The site must never look like a government site. There are no crests, no Commonwealth blue, and no "official" language. The trust section says outright that we don't have the real questions.

## Colour

Tokens live in `src/app/globals.css` as raw CSS variables on `:root` and `[data-theme="dark"]`. Tailwind maps them in `@theme inline`. Tailwind's default palette is switched off (`--color-*: initial`), so only these colours exist.

| Token | Role | Rule |
|---|---|---|
| `paper` | Page background (cool mist, not cream) | |
| `surface` | Cards, answer options | |
| `ink` | Headings and question text | 14.9:1 on paper |
| `copy` (variable `--body`) | Body text | Use the class `text-copy`, never `text-body`. `text-body` is the 17px size. |
| `muted` | Secondary text | 5.4:1. Never for anything a user must read to answer. |
| `euc` / `euc-deep` / `euc-tint` | Primary actions, pass, selected | |
| `wattle` | Values accent | **Fill only.** For text, use `wattle-text`. |
| `fail` / `fail-tint` | Wrong answer, not a pass | |
| `band-*` | The dark green bands (values section, footer) | Its own text tokens, all 4.5:1 or above |
| `part1`–`part4`, `glossary` | Booklet parts | Ochre, ocean, gum, wattle, slate |

Contrast was checked with a script for both themes. axe-core reports zero violations on every route in both themes at 1280 and 360 wide.

## Type

- **Display:** Bricolage Grotesque (variable, self-hosted). Headings only, with tight tracking.
- **Text:** Atkinson Hyperlegible Next. It was designed for low-vision readers, and it distinguishes 0/O and 1/l/I. The slashed zero is intentional.
- **Scale:** caption 13, small 15, body 17, lead 20, title 24, heading 30, display-sm 40, display fluid 42 to 84 px.
- **Question text** is title size (24 px) and **answer options** are lead size (20 px). Don't shrink them to fit more on screen.

## Shape and depth

- **Radius:** 8 (controls), 14 (cards, options), 28 (large panels).
- **Elevation:** three levels (`shadow-1..3`), all soft and green-tinted. The grain texture is a single fixed layer on `body::before`. Don't add grain per section, because it creates seams.

## Motion

| Where | What | How |
|---|---|---|
| Hero | "Why 19 out of 20 can still fail": two example tests side by side. The squares are marked, each pass rule is checked off, then the results and a one-line takeaway appear (about 3 seconds). "Play again" replays it. | IntersectionObserver (low threshold, because the card is taller than a phone screen) plus timers; CSS for the marks |
| Hero and closing call to action | Landscape layers drift at different speeds as you scroll | CSS `animation-timeline: view()`, no JS |
| How it works | The phone screen changes as each step scrolls past | IntersectionObserver, CSS transitions |
| Exam | A short slide between questions | CSS keyframes |

Rules:

1. Every motion has a reduced-motion path that shows the final state. Check `prefers-reduced-motion` in CSS; in JS, use `usePrefersReducedMotion`.
2. No JS animation library. One was tried and added 51 KB gz.
3. The exam never animates anything that competes with reading: no parallax, no confetti, no pulsing timer. (The last-minute pulse was removed: mid-fade, the red digits failed contrast exactly when people need to read them.)
4. Durations are 150 to 400 ms with the `--motion-out` easing. The hero gate is the only sequence longer than a second.

## Charts

Charts follow a few rules:

- One series per chart.
- Recessive solid gridlines and 2 px lines.
- Bars no thicker than 10 px, with a square base and a rounded end.
- Every value printed as text, so nothing depends on reading colour or bar length.

| Chart | Encoding | Accessibility |
|---|---|---|
| Score trend (`trend-chart.tsx`) | Line with a 10% area wash. Passes are filled dots; a not-pass is a hollow red ring, so shape differs as well as colour. A solid gold reference line marks 75%. | Focusable, and arrow keys read each test aloud. The history table is the table view. |
| Bars (`MeterRow`) | One colour for every bar. A hairline marks 75%. | The percentage and "x of y correct" are always printed. |
| Heatmap (`heatmap.tsx`) | Green wash for never missed, then four steps of one red ramp. The miss count is printed in each square. | One tab stop, arrow keys between squares, Enter opens the question. |

Charts are drawn at their real pixel width (a ResizeObserver), not scaled down from a fixed viewBox, so labels stay readable on phones.

## Values track

- **Answer first.** The situation and question come first, and the meaning appears after answering (or on "Show a hint"). See `docs/values-scenarios.md`.
- **Colour roles:** gold (`wattle`) marks values things (the gate's streak, area chips, "Remember" boxes); green and red are only right and wrong.
- **The gate's streak bar** fills gold for each right answer and turns red where a run ended. The text "x of 10 in a row" is always shown too.
- **The readiness check** shows its rule in words and ticks off each part. It never shows a percentage or a "chance of passing".

## Exam screen rules

The test screen follows the official practice test (checked 30 October 2026) in layout, labels and rules, in our own colours and type. Its government branding is not copied.

- **Layout.** A question list on the left ("Question 1" to "Question 20"), with three statuses: a dashed ring for not answered, a filled circle for answered, and "?" for Review later. On phones, the list opens as a sheet from the "Questions" button.
- **Part label** above every question, worded as on the official test: "Part 1 – Australia and its people" through "Part 4 – Australian values". Papers are in part order, so the values questions are the last five.
- **Answers** are native radio inputs inside labels, shown with a radio circle and no letters, as on the official test. Arrow keys move between answers. The letter shortcuts were removed with the letters.
- **Review later** is a checkbox under the answers.
- **Buttons.** Previous, Next and Submit; there is no Previous on the first question and no Next on the last. Submit is always shown but stays locked (`aria-disabled`, still focusable) until every question has an answer. Pressing it early explains why and offers to go to the first unanswered question.
- **Confirmation dialog.** Titled "Warning", asking "Are you ready to submit your test attempt?", with No and Yes.
- **Footer.** "N of 20 questions answered" and "Time remaining: hh:mm:ss".
- **Our additions:**
  - Save and exit.
  - Listen.
  - Larger text, also in Settings.
  - The light/dark switch.
  - After the result, every missed question with its explanation.
- On a new question, focus moves to the question heading so screen readers read it first. The heading has no focus ring because it is not interactive.
- Timer warnings are announced politely at 10, 5 and 1 minute. The clock turns ochre at 10 minutes and red at 5, and never pulses.
- When time runs out, the paper is submitted as it stands.
- Dialogs are native `<dialog>` with `showModal()`, so focus trapping and Escape come from the browser. Each dialog gets its own title id from `useId()`.
- **Result page.** It is worded as the official one:
  - "Test result: PASS/FAIL".
  - "Correct Australian values questions x/5 (y%)".
  - "Overall mark x/20 (y%)".
  - Each part out of 5.
  - The pass rule in the official sentence.

## Copy

Use plain English at about a year 8 reading level, and second person. Don't use "ace", "guaranteed" or "official". Don't make pass-rate claims about our own users until there is data. Each number in the marketing copy is either computed from the question bank (and unit-tested) or links to its source.
