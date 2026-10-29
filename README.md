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
| `npm test` | Unit tests (Vitest): exam rules, scoring, session restore, storage migration, progress, study, marketing numbers |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint (Next config) |

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
    exam/              test UI: answer options, timer, map, results, values check
    practice/          practice nav, overview, study, progress (charts, heatmap), settings, readiness check
    values/            values hub, scenario player, values gate
    ui/                Button, Dialog, icons
    brand/ theme/ design/
  data/question-bank.json   336 questions (54 values), extracted from the original HTML
  data/values-scenarios.ts  38 values scenarios, one per rule in Part 4 of the booklet
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

## Docs

- `DESIGN.md`: visual direction, tokens, motion and accessibility rules
- `docs/adr/001-stack.md`: why Next.js with a static export, and what it costs
- `docs/current-state.md`: what is built, what was verified, what is not done
- `docs/security.md`: threat model and the security plan by phase
- `docs/values-scenarios.md`: why there are 38 values scenarios, how they work, writing and review rules
- `OPEN_QUESTIONS.md`: decisions the owner needs to make
- `CONTENT_ISSUES.md`: question-bank problems found so far
- `CHANGELOG.md`
