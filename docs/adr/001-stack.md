# ADR 001: Next.js 16 with a static export

- Status: accepted for checkpoint 1; revisit before adding payments
- Date: 2026-10-29

## Context

The product was one 1,739-line HTML file (312 KB) with inline CSS, JS and the question bank. It needs to become something a team can maintain and sell. The near-term roadmap adds accounts, payments, progress synced across devices, and SEO content pages.

The constraints:

- Most users will be on phones, often mid-range Android, sometimes on slow connections. This is an assumption with no analytics behind it yet.
- The test screen must stay fast and calm. Animation belongs on the marketing pages, not the exam.
- Saved progress in the old file (`ocb.*` keys in localStorage) must survive the move.

## Options

| | Next.js 16 (App Router), static export | Astro with React islands | Vite single-page app |
|---|---|---|---|
| JS on the home page | About 156 KB gz for modern browsers, measured. About 11 KB of that is our code; the rest is the React and Next runtime. | Near zero for static sections; only islands ship JS | About 60 to 70 KB gz (React) plus app code (estimate, not measured) |
| Path to accounts and payments | Same framework: remove `output: "export"`, add route handlers and server actions | Possible via adapters and endpoints, but a second mental model | Needs a separate backend |
| SEO content pages | Good | Best | Poor without prerendering |
| Team familiarity (assumed) | High | Medium | High |

## Decision

Use Next.js 16 with `output: "export"` now. The question bank is a lazy chunk (33 KB gz) that loads only on practice routes. Marketing motion is CSS and IntersectionObserver, not a JS animation library.

## Consequences

- **The home page carries the framework runtime even though it is mostly static.** This is the main cost. For a phone-first audience it is real: the hero animation and nav need hydration, so the page is interactive later than an Astro build would be. A Lighthouse run on a throttled phone has not been done yet, so the user-facing impact is unmeasured.
- An early version used the `motion` library for the hero. It added 51 KB gz and was replaced with CSS scroll-driven animations (`animation-timeline: view()`) plus IntersectionObserver. Browsers without scroll timelines get a static landscape, which is fine.
- `next/dynamic` with `ssr: false` is used for the exam and values check, so they can read localStorage in `useState` initialisers. Those routes prerender a skeleton only. That's fine for a tool page; it would not be fine for SEO pages.
- When payments land, the export goes away and hosting needs a Node runtime (or Vercel). Everything in `src/lib` is framework-free and unit-tested, so the logic moves unchanged.

## Revisit if

- Lighthouse on a mid-range phone shows the home page's Total Blocking Time or INP above "good". In that case, the cheapest fix is to make the hero gate render its final state on the server and hydrate later, before considering Astro for marketing pages.
- Content pages (for example "what's in Part 2 of the booklet") become the main acquisition channel. Static-first matters more then.
