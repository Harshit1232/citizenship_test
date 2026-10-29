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
| Hero | The values gate marks 20 tiles, then shows how one wrong values answer fails the paper | IntersectionObserver plus a timer; can be replayed by flipping tiles |
| Hero and closing call to action | Landscape layers drift at different speeds as you scroll | CSS `animation-timeline: view()`, no JS |
| How it works | The phone screen changes as each step scrolls past | IntersectionObserver, CSS transitions |
| Exam | A short slide between questions, a score ring that counts up | CSS keyframes, requestAnimationFrame |

Rules:

1. Every motion has a reduced-motion path that shows the final state. Check `prefers-reduced-motion` in CSS; in JS, use `usePrefersReducedMotion`.
2. No JS animation library. One was tried and added 51 KB gz.
3. The exam never animates anything that competes with reading: no parallax, no confetti, no timer pulsing except in the last minute.
4. Durations are 150 to 400 ms with the `--motion-out` easing. The hero gate is the only sequence longer than a second.

## Exam screen rules

- Native radio inputs inside labels. Keys A, B and C pick an answer.
- On a new question, focus moves to the question heading so screen readers read it first. The heading has no focus ring because it is not interactive.
- The values tag is hidden by default, as in the original app. It is a setting there, and the settings page has not been ported yet. The part label was removed too, because it revealed which questions were values questions.
- Mobile: Previous and Next form a fixed two-column bar at the bottom. The question map is a bottom sheet.
- Timer warnings appear at 10, 5 and 1 minute, are announced politely, and fade after 15 seconds.
- Dialogs are native `<dialog>` with `showModal()`, so focus trapping and Escape come from the browser. The safe choice ("Keep going") gets focus first.

## Copy

Use plain English at about a year 8 reading level, and second person. Don't use "ace", "guaranteed" or "official". Don't make pass-rate claims about our own users until there is data. Each number in the marketing copy is either computed from the question bank (and unit-tested) or links to its source.
