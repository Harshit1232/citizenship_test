# Security plan

- Status: phase 1 controls in place; phases 2 and 3 are plans, not built
- Last reviewed: 29 October 2026

The goal is to build security in stages that match what the site actually holds. Right now that is very little. Accounts and payments change that completely, so most of this plan is about getting phase 2 right before it ships.

## Phase 1: today (static site, no accounts, no payments)

### What there is to protect

| Asset | Where it lives | Main threat |
|---|---|---|
| The site's integrity: what visitors see and run | GitHub repo, the hosting account | Someone takes over the GitHub or hosting account and changes the site, for example to add a fake payment page |
| Practice data | Each visitor's own browser (`ocb.*` in localStorage) | Only a script running on our pages could read it. There is no server copy to steal |
| Trust in the brand | | Look-alike sites that copy the design to phish for card details |
| The build | npm dependencies | A compromised package that ends up in the shipped JavaScript |

### Controls in place

- **Security headers** (`public/_headers`, copied into `out/` at build). Cloudflare Pages and Netlify read this file; on Vercel, mirror it in `vercel.json`.
  - A Content-Security-Policy that only allows scripts, styles, fonts and images from the site itself, blocks framing (clickjacking), and blocks plugins and form posts to other sites.
  - `nosniff`, a strict referrer policy, a Permissions-Policy that turns off camera, microphone, location and payment APIs, COOP, and HSTS.
  - Tested: every route loads under this policy with **zero violations** (`csp.py` in the verification scripts). A stricter test policy did produce violations, so the test really does detect them.
- **No secrets in the repo.** The site has no API keys today. `.gitignore` excludes `.env*` files.
- **No user data in URLs.** Nothing personal is ever put in a query string, so it can't leak through logs or the `Referer` header.
- **Dependencies.** `npm audit` reports 0 known vulnerabilities (29 October 2026). The lockfile is committed. There are only 3 runtime dependencies (`next`, `react` and `react-dom`); two unused font packages were removed, and their licences are kept beside the font files.
- **React escaping.** All text, including question text, is rendered through React, which escapes it. The one use of `dangerouslySetInnerHTML` is the fixed theme script in `src/app/layout.tsx`, which contains no data. Keep it that way.

### Known weaknesses, accepted for now

- **The CSP allows inline scripts** (`'unsafe-inline'`). Next.js puts its page data in inline scripts, and their content changes with every build. Removing `'unsafe-inline'` needs a post-build step that hashes each inline script into the policy for its page. The risk is low while the site shows no user-supplied content, but **this must be fixed before phase 2**.
- **The full question bank ships to the browser** as a JavaScript file. Anyone can download all 336 questions. That is fine for free content. It is not fine for anything paid: see phase 3.

### To do before launch (owner actions)

1. Turn on two-factor authentication on GitHub and on the hosting account. A passkey or authenticator app is better than SMS.
2. Protect the `main` branch: require pull requests and passing checks, and block force-pushes.
3. Turn on Dependabot alerts and security updates for the repo.
4. Add a CI workflow that runs `npm ci`, `npm audit --omit=dev`, lint, tests and the build on every pull request.
5. Choose the host and confirm it serves `_headers`, or port the headers to that host's config. Then check the live site with a header scanner.
6. Register the final domain with auto-renew and registrar lock, plus obvious typo variants if budget allows.

## Phase 2: accounts and payments

This is where real risk starts. The rule: **don't build the risky parts yourself.**

### Accounts

- **Use a managed identity provider** (examples: Clerk, Auth0, Supabase Auth, or Auth.js with a managed database). Do not store passwords. Prefer passkeys or emailed magic links.
- **Sessions:** cookies marked `HttpOnly`, `Secure` and `SameSite=Lax` or stricter. Never keep session tokens in localStorage.
- **Authorisation on the server, on every request.** A user can only read and write their own progress. Test this with two accounts before launch.
- **Rate limits** on sign-in, sign-up and email sending, plus bot protection on sign-up (for example Cloudflare Turnstile).
- **Migrating local data:** when someone signs up, offer to upload their `ocb.*` data once. Validate it on the server with the same rules as `src/lib/storage/migrate.ts`. Never trust what the browser sends.

### Payments

- **Use hosted checkout** (Stripe Checkout, or a merchant of record such as Paddle or Lemon Squeezy, which also handle GST and other sales tax). Card details then never touch our servers, which keeps PCI compliance at the simplest level (SAQ A).
- **Unlock access only from a verified webhook.** Check the webhook signature, make the handler idempotent so a repeated event doesn't grant access twice, and never unlock access from a client-side "success" redirect.
- **Refunds and chargebacks** must remove access automatically, using the same webhook path.

### Platform

- Secrets live in the host's encrypted environment settings, never in the repo. Development and production get separate keys.
- Replace `'unsafe-inline'` in the CSP with per-page hashes or nonces. Add the payment provider's domains to `script-src`, `frame-src` and `connect-src` only.
- Logging and alerts for failed sign-ins, webhook failures and 5xx errors. Logs must not contain tokens, emails or card details.
- Daily database backups, with a restore that has actually been tested.
- **Privacy law.** Once you hold accounts and payment records, check whether the Australian Privacy Principles apply to the business. Small businesses under A$3 million turnover are often exempt, but there are exceptions. Either way, update `/privacy/` before launch. *(Not legal advice.)*
- **Before taking real money:** work through the OWASP ASVS level 1 checklist and get an independent penetration test of the sign-in, payment and account pages.

## Phase 3: protecting paid content

Once some questions or features are paid, the question bank becomes the asset worth stealing.

- Paid questions must be served by the server, one test at a time, to a signed-in user who is entitled to them. They must never sit in a JavaScript file.
- Rate-limit question requests per account, and alert on accounts that pull far more questions than a person could read.
- Accept the limit: a determined person can copy anything they can see. The terms of use and fast takedown requests are the backstop, not technology.

## Incident basics (any phase)

1. If the GitHub or hosting account may be compromised, rotate credentials and review recent deploys and commits.
2. Roll back to the last known-good deploy. Static hosts keep previous deploys for this.
3. After phase 2, if personal data may be involved, check the Notifiable Data Breaches scheme and its 30-day assessment deadline. *(Not legal advice; I may be wrong on the details, so confirm with the OAIC.)*
