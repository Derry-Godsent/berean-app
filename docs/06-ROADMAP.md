# 6 · Roadmap, risks, and decisions

*Updated 2026-09-29 after your answers: Ghana, no registered business, full-time and flexible
hours, Windows and no Mac, code stays closed, and **the web app is the product for now** (a PWA
installed from the browser). App stores come later, when money or help arrives.*

## Start here: the six things that matter most

1. **Make the GitHub repo private.** It is public today. See `docs/03-FUNDING.md` §7 (two clicks).
2. **Put the app online** on Cloudflare Pages (free) and test the install on a real Android
   phone and a real iPhone. Steps: `docs/04-MOBILE-LAUNCH.md`, Stage 1.
3. **Open one funding door.** Test whether PayPal can receive money in your name (then Ko-fi
   works today). Look up Business Name registration for Paystack. Then approve the founder note.
4. **Recruit three pastors or cell leaders** as a pilot. They are your distribution *and* your
   testers *and* your future paying customers.
5. **Put the Bible text inside the app** with the modern **Berean Standard Bible** as the
   default. The free API will fail you on a busy Sunday.
6. **Then build the real community** (Phase 1). Accounts, live rooms and reminders are what turn
   a reading app into a habit.

## Time estimates

In **focused weeks of full-time work**, which matches what you told me. One-person estimates
usually run 1.5× long, so treat the ranges as honest, not optimistic.

## Phases

### Phase 0 · Foundation, honesty and the PWA · *2–3 weeks* (mostly done)

**Goal:** a codebase you can trust, something people can install, and a page that can start
raising money.

- [x] Backend schema written and security-tested (`supabase/`, `npm run test:db`)
- [x] Funding page with milestones, config, founder-note draft
- [x] **Portfolio moved out** to its own project (`/home/user/portfolio-site` in this workspace; copy it to its own repo)
- [x] **Fake numbers and simulated people removed** (reader counts, "watching", live ticker, chat bot, demo profile, fake premiere). The Pastor Studio was finished on 2026-10-01: the `sermon`/`church` fixtures are deleted, Sunday → Monday runs on the pastor's own saved outline, and Church insights shows this device's real numbers plus an honest "needs accounts" panel. The cell-group view in the Room still carries a "Sample preview" banner
- [x] **Fonts bundled**; `vite-plugin-singlefile` dropped
- [x] **PWA:** manifest, service worker, icons, install card, iOS home-screen tags, `_headers`
- [ ] **Deploy** to Cloudflare Pages *(your action; I have no access)*
- [ ] **Test install** on a real Android phone and iPhone *(not tested in a browser here)*
- [x] **The path:** season 1, episode 1 for everyone; seasons unlock in order, begun seasons are never taken away, and the Bible itself is never locked (`src/app/seasonPath.ts`, see Product §D). The welcome screen no longer jumps a new reader into Season 4
- [ ] **Sync the path to accounts** when they exist: `done` → `episode_progress`, chapters → `reading_progress` (tables already written and security-tested)
- [ ] **Router** (deep links, back button) and code-splitting (the JS bundle is ~560 kB)
- [ ] **Bundle Bible text** (BSB default + WEB + KJV) as static JSON in IndexedDB; remove `bible-api.com`
- [ ] CI: typecheck, build, `test:db`
- [ ] Domain, privacy policy, terms, support email
- [ ] Repo private; one funding door open; founder note approved

**Exit test:** a stranger can open your link on a phone, install it, read a chapter offline, and
see only true statements.

### Phase 1 · Accounts and real community · *4–6 weeks*

**Goal:** a real product for a small group of real people.

- [ ] Create the Supabase project; apply `0001_init.sql`; email login
- [ ] Sign-in (email code, Google); guest → account merge
- [ ] Sync progress, highlights, notes, streak (via `log_reading`)
- [ ] **The Room, real:** live chat, real presence count, reactions (this replaces the "opening soon" banner)
- [ ] **Groups:** create, invite code, group chat, prayer wall, group streak
- [ ] **Spoiler-safe episode rooms**
- [ ] Safety: report, block, filters, moderator queue, account deletion, Data Protection Commission registration (Ghana)
- [ ] **Reminders via web push** (needs the backend; on iPhone only for a Home-Screen install, iOS 16.4+, verify), grace days, "previously on…"
- [ ] **A real weekly episode schedule** (set `premiereAt` in `src/data/seasons.ts` and the countdown appears)
- [ ] Ko-fi/Paystack webhooks → `donations`; the funding meter reads real data
- [ ] Sentry + PostHog (counts only)

**Exit test:** one cell group of 8+ people uses it for two weeks without you touching the database.

### Phase 2 · Content, AI and growth · *3–4 weeks*

**Goal:** enough to read every day, and a reason to invite a friend.

- [ ] **AI gateway** (auth, quota, verified references) replaces the open Worker
- [ ] Content: 6+ real seasons on the schedule; 10× the game questions
- [ ] Verse memory (spaced repetition), reading plans, shareable episode cards, invite links
- [ ] Twi or Yoruba as the first extra language

**Exit test:** 100 real weekly readers, D7 retention measured.

### Phase 3 · Pastors and churches · *6–8 weeks*

**Goal:** the first paying customers.

- [ ] Church onboarding and pastor verification
- [ ] Sermon builder → **publish** to congregation; auto weekly plan + cell questions
- [ ] Aggregate insights (opt-in, ≥5 suppression, already in the schema)
- [ ] Live quiz and quiz builder
- [ ] Announcements, prayer routing
- [ ] Web checkout for the church plan (needs a Business Name and a payment provider); free tier for small churches
- [ ] Season sponsorship pilot

**Exit test:** 5 churches, of which at least 2 pay, and a pastor who says "I'd be upset if this went away".

### Phase 4 · Stores, depth and reach · *when funded*

- **Google Play** through a **TWA** built from the PWA ($25; Play's 12-tester / 14-day rule applies to
  personal accounts, so start that clock only when you have people to recruit)
- **Apple App Store** through Capacitor on a **cloud Mac** ($99/year; no Mac to buy)
- Cinematic beats, narration/audio, more languages, study tools, church-vs-church challenges,
  a part-time helper for content and moderation, grant applications

## Sequencing logic, briefly

- **Deploy first, then build.** Real users on a real link will teach you more than another week of code.
- **Router → repositories → bundled Bible → sync → chat** is ordered so every step ships and
  nothing is rewritten. Chat before sync would mean writing identity twice.
- **Safety ships with chat, not after it.**
- **Pastors come after real groups.** Pastors won't pay for insights about an empty app.
- **Stores come last.** They cost money and add review delays; the web version reaches Android and
  iPhone today.

## Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| **Code is public while you want it closed** | **Certain today** | Medium | Make the repo private now |
| Solo burnout / scope creep | **High** | **Critical** | Ship phases in order; cut features, not sleep; one part-time helper by Phase 3 |
| **iPhone install is fiddly** (Share → Add to Home Screen, no prompt) | High | Medium | Install card explains it; test on a real iPhone; stage 3 store app when funded |
| PWA storage cleared by iOS Safari after long non-use | Medium | Medium | Accounts and sync in Phase 1 |
| No payment door opens from Ghana without registration | **High** | High | Test PayPal/Ko-fi now; register a Business Name (sole proprietor) for Paystack; keep the "opening soon" state |
| **Moderation incident** (harassment, abuse, false teaching, a crisis disclosure) | Medium | **High** | No DMs at launch; report/block/auto-hide; prayer private; crisis resources; one trusted moderator |
| **AI states something false or heretical** | Medium | High | Retrieval-first; verify references; "unsure" fallback; pastoral referral; review panel |
| Doctrinal controversy over content | Medium | High | Public statement of faith; multi-tradition review panel |
| Copyright claim (translation, images, audio) | Low if disciplined | High | Only public-domain or licensed text; original art; record licences in the repo |
| Data breach of faith data | Low | **Critical** | RLS (tested), minimal data, no third-party ad SDKs, breach plan |
| AI bill spike | Medium | Medium | Auth, per-user quota, cache, spending cap at the provider |
| Funding too slow to sustain you | **High** | High | Church plan is the real business; running costs are near $0 until Phase 1; grants |
| Apple rejects a future native app as "just a website" or over giving links | Medium | High | Only matters at stage 3: native features (§3 of the launch doc); no external giving in the iOS app |
| "Berean" name conflict | Low–Med | Medium | Search trademarks and store names now, before assets are made |

## Decisions (resolved)

| # | Question | Answer | Source |
|---|---|---|---|
| 1 | Country / business | **Ghana; no business registered and none planned yet** | You |
| 2 | App ID | **Not needed for the PWA.** It is the internal package name (like `app.berean.bible`) that only a native store build needs. Placeholder stays until then | Me |
| 3 | Theological stance / review panel | Bible-centred, ecumenical tone; **still needs 3 named reviewers before AI or sermon content launches** | Default |
| 4 | Open source? | **No.** Reconsider once it has earned some money | You |
| 5 | Hours per week | **Full-time, flexible** | You |
| 6 | Mac | **Windows, no Mac.** Any iOS build uses a cloud Mac | You |
| 7 | Default translation | **BSB default, with WEB and KJV** (the current app still ships KJV until the bundled text lands) | Default (you left it blank) |
| 8 | Paid "Plus" tier | **No.** Supporter only | Default |
| 9 | First extra language | **Twi or Yoruba**, you pick when Phase 2 starts | Default |
| 10 | Remove the fake numbers | **Yes, done** | You |
| 11 | Founder story | **Draft written** in `src/app/funding.ts`, hidden until you approve it | You asked me to write it |
| 12 | Native store apps | **Later, when funded.** PWA is the path now | You |

## What I'd do next, if I were you

Make the repo private, deploy the PWA and install it on your own phone, test PayPal for Ko-fi,
approve the founder note, and ask three pastors. Then tell me to start **Phase 1**: Supabase
project, sign-in, and the first real live room.
