# 1 · Assessment of the current project

*Assessed 2026-09-29 at commit `2cc93fa`. I read the source, built it, type-checked it,
and traced where every piece of data comes from.*

## The short version

You have a **very good front-end prototype with a distinctive idea**, and no product
behind it yet. Your instinct is right: there is **no backend**. Everything a user sees
that looks social or live is either stored on their own device or invented.

That is not a criticism. It is what a prototype should be, and the hard-to-copy part
(the *feeling* of reading the Bible as a series) is already in it. But the gap between
"convincing demo" and "app strangers install and trust" is mostly *removing fakery and
adding real plumbing*, and that is a well-understood job.

## What it is, technically

| | |
|---|---|
| Stack | React 19, TypeScript (strict), Vite 7, Tailwind 4, Framer Motion |
| Size | ~8,300 lines in ~50 files; type-check clean; production build passes (≈720 KB single HTML file, ≈210 KB gzipped) |
| Storage | `localStorage` for state, IndexedDB for downloaded Bible chapters |
| Navigation | A `useState` value called `screen`, not a router |
| Bible text | Fetched live from the free `bible-api.com`; only 4 chapters bundled as a last-resort fallback |
| AI answers | A local rule-based engine, plus an optional Cloudflare Worker calling an AI provider |
| Backend | None |

## What is real and what is simulated

This is the most important table in this document, because store reviewers, journalists
and users will find the simulated parts.

| Feature | Reality today |
|---|---|
| Reading any chapter, both testaments | **Real**, KJV and WEB, via a third-party API, cached offline |
| Seasons and episodes | **Real content, but small**: 25 episodes across seasons 1–5 (S5 has one placeholder episode, S6 none) |
| Streaks, highlights, saved questions, progress | **Real, on this device only.** Lose the phone, lose the streak |
| Word-meaning tap-to-explain (archaic words) | **Real**, from a curated glossary |
| "Ask a question" | **Real** and honest: the local engine says *"I'm not confident enough"* rather than guess. Nice instinct |
| Games: daily word, trivia, timeline | **Real, tiny**: 20 words, 14 trivia questions |
| Downloads for offline reading | **Real** (IndexedDB), rate-limited by the free API |
| **The Room (chat)** | **Simulated.** `BroadcastChannel` syncs *browser tabs on one device*. The other "people" are seeded messages |
| **"18,432 reading now"**, "watching" counts, the activity ticker ("Kwame in Accra finished…") | **Invented.** Random numbers in `useLiveCount` and `data/community.ts` |
| **Season 5 premiere countdown** | **Fake.** It always counts to "next Sunday 18:00" and resets weekly; the episode never actually releases |
| **Cell group, group streak, nudge-on-WhatsApp** | **Hard-coded fixtures** (`cellGroup` in `data/berean.ts`), labelled "Sample preview" |
| **Pastor dashboard** ("61% read this week", "+37 points", GHS 150 plan) | **Fixed 2026-10-01.** The invented congregation is gone. Church insights now shows this device's real numbers and states plainly that congregation numbers need accounts |
| **Sermon builder** | **Real UI, template logic**: picks from a fixed table by topic and real references. No AI and no fake pause. Outlines save on this device and feed the Sunday → Monday view |
| **Accounts / profile / "Signed in on this device"** | **Local profile.** No sign-in exists |

## Findings, most serious first

### Blockers for a public launch

1. **No accounts or database.** Nothing syncs, nothing is shared, and there is no way to
   contact or protect a user. The schema in `supabase/migrations/` is the fix.
2. **Fake social proof.** Invented live counts and a fictional activity feed will
   eventually be noticed and will cost you the one thing this product runs on: trust
   from Christians. It can also breach store rules on misleading content. Replace with
   real (even if small) numbers, or clearly label demo content. *A small honest number
   beats a large fake one.* "12 people reading now" is a better story than 18,432 lies.
3. **The Bible text depends on a free third-party API.** `bible-api.com` has no SLA
   and is limited to 15 requests per 30 seconds per IP (the code even sleeps to
   respect it). One busy Sunday and your readers see a blank page. Ship the text inside
   the app. Public-domain translations (see §2 of Architecture) are small.
4. **No safety systems for user-generated content.** Apple and Google both *require*
   in-app reporting, blocking, moderation, and a way to contact you before they allow
   chat. Also required: a privacy policy and in-app **account deletion**. None exist
   yet. The schema includes the data model for all of them.
5. **The AI endpoint is an open door.** `worker/ask.js` allows any website to call it
   (`Access-Control-Allow-Origin: *`), has no login and no rate limit. Anyone who finds
   the URL can spend your AI budget. It needs authentication and a per-user quota.

### Serious, fix during the build-out

6. **Two overlapping state systems.** `berean/ui.tsx` (`StoreProvider`: hard-coded
   streak of 5, fake prayer list) and `app/store.tsx` (the real one). The Group,
   Sunday and Church screens still read the old one and fixtures. Retire the old one.
7. **No router.** Screens switch by `useState`, so: no URL per verse or episode, no
   deep links from a shared message, and no Android *back button* behaviour. All three
   matter enormously for a mobile app that grows by people sharing verses in WhatsApp.
8. **One giant context** (`app/store.tsx`) mixes persisted data, navigation and derived
   values, so every change re-renders everything. Fine at this size; not once data
   comes from a server. Move server data to TanStack Query.
9. **Your portfolio ships inside the Bible app.** `src/components/*`, `data/portfolio.ts`,
   `public/images/project-*.jpg`, `portrait.jpg`, Lenis and a custom cursor are all in the
   bundle and reachable at `#/portfolio`. The package was even named `react-vite-tailwind`
   (renamed to `berean` in this change). Move the portfolio to its own repo. It bloats the
   download on phones where data is expensive.
10. **Fonts load from Google's servers at runtime** (`index.css`). They will not load
    offline, in a native app with no signal, or for privacy-conscious users. Bundle them.
11. **`vite-plugin-singlefile`** inlines everything into one file. Convenient for demos;
    for production you want code-splitting so the first screen loads fast on a slow phone.
12. **No tests, no CI, no lint.** A one-person project needs a safety net *more*, not less.
    (`npm run test:db` is the first test; add app tests as features land.)
13. **English only, no i18n framework.** Your stated goal is people across the world.

### Design and tone notes

- The "An honest moment: *Before you scroll…*" modal and the "Ends at midnight" streak
  warning lean on guilt. Some readers respond; many lapsed believers already feel guilty
  and will uninstall. Consider grace days ("you missed yesterday. Welcome back") and
  test it against a gentler version.
- The paper-and-ink visual identity (oxblood accent, Newsreader serif) is distinctive and
  fits Scripture. Keep it. It does not look like every other app.

## What is genuinely strong

- **The core idea is differentiated.** "Season 2, Episode 4" with a *next time on…*
  hook turns a chapter into an appointment. That is the reason someone opens it tomorrow.
- **The Sunday→Monday loop** (pastor preaches → every verse mentioned is already linked →
  congregation reads it → pastor sees aggregate engagement) is a real B2B wedge that
  YouVersion-style apps do not own.
- **Honest AI behaviour** is designed in (the *"I'm not confident"* fallback, the system
  prompt forbidding invented verses). Keep this as a non-negotiable.
- **Offline library** infrastructure already exists and is well built.
- **Clean, strict TypeScript** with few dependencies, so it is a pleasant base to extend.

## Is it "the first"? Please don't say that

I checked the current landscape. The idea is good; the claim would not survive a search.

| App | What it already does |
|---|---|
| **YouVersion** | ~1 billion installs, thousands of plans, friends, streaks, audio; in 2026 it opened its platform and licences to developers for free |
| **Glorify, Hallow, Pray.com, Dwell** | Guided devotion, prayer, immersive audio and Bible stories |
| **Bible Chat and similar** | AI Bible Q&A |
| **Bible Project, Lumo, The Chosen app** | Video and dramatised Scripture |

Nobody I found combines the specific set you describe: **serialised reading with
cliffhangers + spoiler-safe discussion per episode + cell-group and pastor tools +
games.** That combination is your position. Say *"the Bible as a series you read
together"*, not *"the first Christian community app"*. The first claim is defensible;
the second invites a hostile reply and a rejected store listing.

*Sources: [natality.app](https://natality.app/2026/04/10/best-christian-apps),
[YouVersion Platform announcement](https://www.youversion.com/news/introducing-youversion-platform).*

## What I changed in this pass, and what I deliberately did not

Changed: added the backend schema and its tests, the funding page, the mobile wrapper
config, docs, `.env.example`; renamed the package; allowed the preview host in Vite.

**Not changed:** the fake counters, the portfolio, the routing, the state. Those are
product decisions or large refactors; they are sequenced in
[06-ROADMAP.md](06-ROADMAP.md) so each one is done once, in the right order.

## Status update, 2026-09-29 (Phase 0)

Done since this assessment was written, at your request:

| Finding | Now |
|---|---|
| Fake or simulated chat, "reading now" counts, season "watching" counts, the pulse feed, the demo profile, the fake weekly premiere | **Removed.** The Room is an honest private notebook with an "opening soon" banner. The premiere countdown only appears when a real `premiereAt` date is set |
| Cell-group, church and Sunday dashboards on invented people | **Kept, labelled** "Sample preview" |
| Runtime Google Fonts | **Bundled** (`@fontsource`) |
| Single-file build | **Replaced** by a normal build plus a PWA service worker |
| Portfolio mixed into the app | **Moved out** to its own project |
| No installability | **PWA** manifest, icons, service worker, install card (not yet tested on real devices) |

Still open: no router, no tests beyond the database checks, no CI, the open AI Worker, the free
Bible API, thin content (25 episodes; Season 5 has none, Season 6 has none), no moderation,
privacy policy or account deletion in the UI. Also new: **the GitHub repo is public**.

## Status update, 2026-10-01 (Pastor Studio)

At your request: the Pastor Studio no longer runs on invented people. The `sermon` and `church`
fixtures were **deleted** from `data/berean.ts`, so they cannot be rendered again by accident.

| Screen | Now |
|---|---|
| **Sermon builder** | Builds from the real topic table and real references, with no fake "thinking" pause. Outlines **save on this device** (`berean:sermons:v1`) and can be deleted again. "Publish to congregation · 248 members notified" is gone — nothing here sends anything by itself, and the screen says what publishing will need |
| **Sunday → Monday** | Works from the pastor's **own saved outline** (picker when there are several): its title, date, points and references, with the real bundled KJV text where it exists and the reader for the rest. No invented preacher, church, or "142/248 read this week" meter |
| **Church insights** | Shows **only real numbers from this device** (streak, days read this week, chapters, episodes, questions, saved verses). The congregation panel states that nobody is connected yet and lists exactly what will appear when accounts exist. The GHS 150 plan is labelled *not on sale yet* |

What still needs accounts before it can be real: publishing a sermon to members, member and
cell-group progress, weekly reports and visitor follow-up. The schema for all of it is already in
`supabase/migrations/0001_init.sql`; the screens stay honest until it runs somewhere (milestone 2).
