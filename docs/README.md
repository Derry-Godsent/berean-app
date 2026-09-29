# Berean — project docs

Berean is an installable web app (a PWA; store apps come later) that turns Bible reading into a series you keep up with and
talk about with other people: seasons and episodes, a live room, cell-group tools,
games and quizzes, and a workspace for pastors.

These documents are the plan for taking it from a convincing prototype to a real
product people install to their phones, funded by people around the world.

| # | Read this when you want to know… | File |
|---|---|---|
| 1 | What exists today, what is real vs. simulated, what is risky | [01-ASSESSMENT.md](01-ASSESSMENT.md) |
| 2 | How the finished system is built: stack, data, realtime, AI, safety, cost | [02-ARCHITECTURE.md](02-ARCHITECTURE.md) |
| 3 | How people worldwide can fund it, and what the app stores allow | [03-FUNDING.md](03-FUNDING.md) |
| 4 | How to get it onto phones: PWA now, Google Play and the App Store later | [04-MOBILE-LAUNCH.md](04-MOBILE-LAUNCH.md) |
| 5 | The vision, personas, and every feature idea ranked | [05-PRODUCT-AND-FEATURES.md](05-PRODUCT-AND-FEATURES.md) |
| 6 | What to do in what order, and the decisions I need from you | [06-ROADMAP.md](06-ROADMAP.md) |

**If you only read one thing:** the top of [06-ROADMAP.md](06-ROADMAP.md).

## What was built alongside these docs

| Change | Where |
|---|---|
| Complete backend schema for Supabase (Postgres): 32 tables, 3 views, 58 row-level-security policies, streaks, groups, chat, prayer, moderation, quizzes, sermons, funding ledger | `supabase/migrations/0001_init.sql` |
| 36 automated security checks that run the schema in an in-process Postgres and try to break it | `supabase/tests/rls.test.mjs` → `npm run test:db` |
| A public **"Keep the lamp lit"** funding page, at `#/support` and inside the app | `src/screens/Support.tsx` |
| All giving links and costs in one config file, with per-platform store-policy gating | `src/app/funding.ts`, `src/app/platform.ts` |
| Capacitor config so the same code builds native Android and iOS apps | `capacitor.config.ts`, `npm run cap:*` |
| `.env.example` documenting every setting | `.env.example` |

**Phase 0 follow-up (2026-09-29):** the portfolio was moved out; fake reader counts, the
simulated chat, the demo profile and the fake premiere were removed; fonts are bundled; and
the app is now an installable PWA (manifest, service worker, icons, install card). The funding
page now uses milestones and a hidden-until-approved founder note.

## Facts that may have changed

Store policies, prices and payment availability change often. Where a claim depends on a
third party's current rules, the docs say **"verify"** and link the source I checked on
2026-09-29. Re-check those before you commit money or submit a build.
