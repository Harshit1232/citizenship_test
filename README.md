# Wattle: Australian citizenship test practice

"Wattle" is a working name (see `OPEN_QUESTIONS.md`).

A practice site for the Australian citizenship test. It has a mock test that follows the published rules: 20 questions, 45 minutes, a 75% pass mark, and all five Australian values questions correct. It also has a 10-question values check. Every explanation points back to its page in *Australian Citizenship: Our Common Bond*.

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
| `npm test` | Unit tests (Vitest): exam rules, scoring, session restore, storage migration, marketing numbers |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint (Next config) |

## Deploy

`npm run build` writes a fully static site to `out/`. There's no server. Any static host works: Cloudflare Pages, Netlify, Vercel, S3 with CloudFront, or GitHub Pages.

- Output directory: `out`
- Build command: `npm run build`
- `trailingSlash` is on, so routes are `/practice/test/` and so on. Most hosts serve `out/404.html` for unknown paths automatically.

Payments and accounts need a server. When they're added, drop `output: "export"` in `next.config.ts` and deploy to a host that runs Next.js. See `docs/adr/001-stack.md`.

## Routes

| Route | What |
|---|---|
| `/` | Marketing home: hero with the animated "values gate", the values rule, how it works, trust, pricing, FAQ |
| `/practice/test/` | The mock test: start, running, results. Resumes a paused test. |
| `/practice/values-check/` | Ten values questions with instant feedback |
| `/design/` | Design system reference (not indexed) |

Study, history, analytics and settings aren't ported yet. Until they are, the old HTML file still has them.

## Layout

```
src/
  app/                 routes, global CSS (design tokens), fonts
  components/
    marketing/         home page sections
    exam/              test UI: answer options, timer, map, results, values check
    ui/                Button, Dialog, icons
    brand/ theme/ practice/ design/
  data/question-bank.json   336 questions (54 values), extracted from the original HTML
  lib/
    exam/              plan.ts (paper building), score.ts (marking), session.ts (save and resume)
    storage/           localStorage wrapper with in-memory fallback, schema migration
    site.ts            name, price, official links: the owner's decisions in one file
    marketing-data.ts  numbers used in marketing copy, tested against the bank
```

## Docs

- `DESIGN.md`: visual direction, tokens, motion and accessibility rules
- `docs/adr/001-stack.md`: why Next.js with a static export, and what it costs
- `docs/current-state.md`: what is built, what was verified, what is not done
- `OPEN_QUESTIONS.md`: decisions the owner needs to make
- `CONTENT_ISSUES.md`: question-bank problems found so far
- `CHANGELOG.md`
