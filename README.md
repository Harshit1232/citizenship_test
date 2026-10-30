# Wattle: Australian citizenship test practice

"Wattle" is a working name (see `OPEN_QUESTIONS.md`).

A practice site for the Australian citizenship test. It has a mock test that follows the published rules: 20 questions, 45 minutes, a 75% pass mark, and all five Australian values questions correct. Around it are a values mastery track (38 scenarios and a values gate), a quick values check, a study mode, a progress page with a readiness check, and settings. Every explanation points back to its page in *Australian Citizenship: Our Common Bond*.

This replaces the single-file `citizenship-mock-test.html`. A returning user's saved data in that file's `ocb.*` storage keys carries over unchanged (tested; see `docs/current-state.md`).

## Run it

Requires Node 20.9 or later.

```bash
npm install
npm run dev          # http://localhost:3000
```

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | Static export to `out/` |
| `npm run serve` | Serves `out/` at http://localhost:4321 with the production security headers |
| `npm test` | Unit and component tests (Vitest; components in jsdom with Testing Library) |
| `npm run test:e2e` | End-to-end tests (Playwright, Chromium) against the built site. Run `npm run build` first. |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint (Next config) |
| `npm run check` | Everything above, in order, as CI runs it |

## Tests

There are three layers. GitHub Actions runs all of them on every push to `main` and on every pull request (`.github/workflows/ci.yml`).

- **Unit tests** (`src/**/*.test.ts`, Node) cover:
  - the rules: paper building in part order, marking, the values rule and readiness
  - data: saving and resuming, storage migration, the question bank and scenario content
- **Component tests** (`src/**/*.test.tsx`, jsdom) drive real screens with a simulated user:
  - a whole test from start to result, with the Submit lock, the warning dialog, and resuming after leaving
  - the result page's pass and fail cases
  - a values scenario and the values gate
  - the readiness card
- **End-to-end tests** (`e2e/`, real Chromium, desktop and phone sizes) run against the built site, served with the production headers:
  - the full test flow, reloading mid-test, and the clock running out
  - keyboard answering, the values track, and data saved by the original app
  - axe accessibility checks on every page and on each state of the test
  - a check that no page logs an error or breaks the Content-Security-Policy

First time on a new machine, install the browser once:

```bash
npx playwright install chromium
```

## Deploy

`npm run build` writes a fully static site to `out/`. There's no server. Any static host works: Cloudflare Pages, Netlify, Vercel, S3 with CloudFront, or GitHub Pages.

- Output directory: `out`
- Build command: `npm run build`
- `trailingSlash` is on, so routes are `/practice/test/` and so on. Most hosts serve `out/404.html` for unknown paths automatically.
- Security headers are in `public/_headers`, which Cloudflare Pages and Netlify read. On Vercel, copy them into `vercel.json`. See `docs/security.md`.

Payments and accounts need a server. When they're added, drop `output: "export"` in `next.config.ts` and deploy to a host that runs Next.js. See `docs/adr/001-stack.md`.

## Routes

| Route | What |
|---|---|
| `/` | Marketing home: hero with the "why 19 out of 20 can still fail" comparison, the values rule, how it works, trust, pricing, FAQ |
| `/about/`, `/pricing/`, `/corrections/` | About, pricing with payment questions, the corrections log |
| `/privacy/`, `/terms/` | Drafts until reviewed by a lawyer (`site.legalReviewed`) |
| `/practice/` | Overview: resume a paused test, start practising, scores, weakest topics, recent tests |
| `/practice/test/` | The mock test: start, running, results. Resumes a paused test. |
| `/practice/values/` | Values mastery hub: progress by area, values gate status |
| `/practice/values/<area>/` | Scenarios for one values area (`law`, `freedoms`, `equality`, `respect`, `community`); `#<scenario-id>` links to one scenario |
| `/practice/values/gate/` | The values gate: 10 values questions in a row, 2 from each area |
| `/practice/values-check/` | Ten values questions with instant feedback |
| `/practice/study/` | Flashcards or list, by part or topic, or only missed questions |
| `/practice/progress/` | Score trend, accuracy by part and topic, question heatmap, full history |
| `/practice/settings/` | Test format, topics, timer, values rules, theme, download or delete your data |
| `/design/` | Design system reference (not indexed) |

## Layout

```
src/
  app/                 routes, global CSS (design tokens), fonts
  components/
    marketing/         home page sections, content page shell
    exam/              test UI laid out like the official practice test: question list, timer, results, values check
    practice/          practice nav, overview, study, progress (charts, heatmap), settings, readiness check
    values/            values hub, scenario player, values gate
    ui/                Button, Dialog, icons
    brand/ theme/ design/
  data/question-bank.json   336 questions (54 values), extracted from the original HTML
  data/values-scenarios.ts  38 values scenarios, one per rule in Part 4 of the booklet
  test/setup.ts        component-test setup (jsdom, dialog support, clean storage)
  lib/
    exam/              plan.ts (paper building), score.ts (marking), session.ts (save and resume)
    storage/           localStorage wrapper with in-memory fallback, schema migration
    progress.ts        history aggregates, heatmap levels, suggested test
    study.ts           study filters and saved position
    user-data.ts       download and delete the data stored in the browser
    corrections.ts     the public corrections log
    values-progress.ts scenario progress and the values gate (ocb.values)
    readiness.ts       the published readiness rule
    site.ts            name, price, official links: the owner's decisions in one file
    marketing-data.ts  numbers used in marketing copy, tested against the bank
```

Outside `src/`:

```
e2e/                   Playwright end-to-end tests
scripts/serve-static.mjs  dependency-free static server with the production headers
playwright.config.ts   desktop and phone projects; starts the server itself
```

## Docs

- `DESIGN.md`: visual direction, tokens, motion and accessibility rules
- `docs/adr/001-stack.md`: why Next.js with a static export, and what it costs
- `docs/current-state.md`: what is built, what was verified, what is not done
- `docs/security.md`: threat model and the security plan by phase
- `docs/values-scenarios.md`: why there are 38 values scenarios, how they work, writing and review rules
- `OPEN_QUESTIONS.md`: decisions the owner needs to make
- `CONTENT_ISSUES.md`: question-bank problems found so far
- `CHANGELOG.md`
