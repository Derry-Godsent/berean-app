# 4 · Getting Berean onto phones: PWA first, stores later

**Decision (2026-09-29):** publishing to the app stores is something to do *later*, when the
app earns money or gets help. **For now Berean is a PWA** (a web app that installs to the phone's
home screen). That costs **$0**, needs **no Mac**, and needs **no store review**. The Capacitor
files stay in the repo for stage 3, but nothing below the "Stage 2 / 3" line needs to happen yet.

## The three stages

| Stage | What | Cost | Needs | When |
|---|---|---|---|---|
| **1 · PWA** | Website hosted free; people tap **Install** (Android/desktop) or **Share → Add to Home Screen** (iPhone) | **$0** (+ ~$12/yr for a domain, optional) | Windows is fine | **Now** |
| **2 · Google Play** | The same PWA wrapped as a **Trusted Web Activity** (TWA) with **PWABuilder** or **Bubblewrap**, both of which run on **Windows** | **$25 once** | Play account; the 12-tester rule (below) | When you have $25 and users to recruit |
| **3 · Apple App Store** | Native wrapper with **Capacitor**, built on a **cloud Mac** (Codemagic or GitHub Actions macOS runners), so you never buy a Mac | **$99 / year** + cloud build minutes | Apple Developer account | When funded |

## Stage 1 · Ship the PWA (do this now)

What's already built in the repo:

- `vite-plugin-pwa` generates the **web manifest** (name, colours, icons) and a **service worker**
  that stores the app on first visit, so it **opens offline**. Season posters are kept after first
  view.
- Icons in `public/icons/` (regenerate with `node scripts/make-icons.mjs`), iOS home-screen tags in
  `index.html`, fonts bundled (no Google Fonts request).
- An **Install card** on Home and Me: a real **Install** button on Android/Chrome/Edge, and the
  "Share → Add to Home Screen" steps on iPhone Safari. It hides itself once installed.
- `public/_headers` so the host never caches `sw.js` (otherwise updates get stuck).

**Already on Vercel?** That works just as well. Vercel detects Vite by itself (build `npm run build`,
output `dist`), and `vercel.json` in the repo sets the same cache headers. Put any `VITE_*` values
under Project → Settings → Environment Variables and redeploy. Every branch also gets its own
preview link, so you can look at changes before they go live.

**Or deploy on Cloudflare Pages (free, works from Ghana, no card needed):**

1. Make the GitHub repo **private** first (see `docs/03-FUNDING.md` §7). Cloudflare Pages can build
   private repos.
2. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** → **Connect to Git** →
   pick `berean-app`.
3. Build command `npm run build`, output directory `dist`. Add any `VITE_*` values from
   `.env.example` under **Environment variables** (they are public once built, never secrets).
4. You get a free `*.pages.dev` address. Open it on your phone in Chrome: the install prompt should
   appear. On an iPhone open it in **Safari** (not Chrome) → Share → Add to Home Screen.
5. Later, buy a domain and attach it under **Custom domains**, then set `VITE_SITE_URL`.

I cannot deploy for you (I have no access to your Cloudflare account), and **I could not test the
install prompt in a real browser** (none was available here). Test it on a real Android phone and a
real iPhone before you tell anyone it installs. **Also check:** Lighthouse → "Installable" in
Chrome DevTools.

**Known limits of a PWA:**

- **Reminders.** A web app can't schedule local "read today" notifications. Real reminders need
  **web push**, which needs a backend (Phase 1). Web push works on Android, and on iPhone only for
  an app **already added to the Home Screen** (iOS 16.4 and later; verify current behaviour).
- iPhone Safari may clear a website's stored data after weeks of non-use. Home-screen installs are
  treated better, but this is another reason to add accounts and cloud sync in Phase 1.
- No store listing means people find Berean through links, WhatsApp and churches. For your first
  100 users that is actually what works.

---

# Stage 2 / 3 reference: Google Play and the App Store (later)

Berean can also be wrapped as a native app with **Capacitor** (`capacitor.config.ts`). The
rest of this document is the checklist from "works in the browser" to "installed from the store".
**Skip it until stores are funded.** For Google Play a **TWA** built from the PWA is simpler than
Capacitor and works on Windows; use Capacitor when you need native features (push, store
purchases) or for iOS.

## 0 · Start the slowest thing first (once you decide to publish on Play)

Google now requires new **personal** developer accounts to run a **closed test with at
least 12 real testers for 14 consecutive days** before you can publish to production
(accounts created after 13 Nov 2023; count reduced from 20 to 12 in Dec 2024). It also
rolled out **identity verification** for new accounts from September 2026 (ID, address
proof, phone), reported to add a few business days.

That is roughly **3 weeks from account creation to public release** that no amount of
coding speeds up. So:

1. Create the Play Console account **when you are ready to publish, not before**. The tester clock starts at first upload, so don't start it until you have people to recruit.
2. Upload a *rough but working* build to the **closed testing** track as soon as it can
   install and open.
3. Recruit **15+ people** (one dropping out can reset the clock). Youth groups, your cell
   group, church WhatsApp groups. Ask them to *use* it: Google looks for real engagement
   and for visible improvement during the test.
4. Alternatively, an **organisation account** is exempt from the 12-tester rule, but needs
   a registered business and a D-U-N-S number. Worth it if you are registering one anyway.

Sources: [closed-testing rule](https://www.testerscommunity.com/google-play-closed-testing),
[2026 verification (reported)](https://testerbee.com/blog/google-play-developer-verification-2026).
*Confirm both on Google's own Play Console help pages.*

## 1 · Accounts and costs

| | Google Play | Apple App Store |
|---|---|---|
| Fee | **$25 once** | **$99 per year** |
| Who | Personal or organisation | Individual or organisation |
| Review | Automated + human; typically hours to days | Human; typically 1–3 days, often more for a first app |
| Dev machine | Any | **A Mac is required to build.** Without one, use a cloud Mac (Codemagic or GitHub Actions macOS runners) |

## 2 · Getting the native projects

Requirements: Node 22+, Android Studio (Android), Xcode on a Mac (iOS).

```sh
npm install
npm run cap:add:android      # once
npm run cap:add:ios          # once, on a Mac
npm run cap:android          # build web → sync → open Android Studio
npm run cap:ios              # build web → sync → open Xcode
```

**Before the first publish, decide the app ID.** `appId` in `capacitor.config.ts` is
`app.berean.bible`, a **placeholder**. It is permanent on both stores. Use a reverse-domain
you control (buy the domain first).

## 3 · Passing Apple's "not just a website" rule (4.2)

Apple rejects apps that feel like a wrapped website. Berean should clearly have, at the
first submission:

- **Local notifications** for the daily reminder (works with no server).
- **Push notifications** for group nudges and season premieres.
- **Offline library** with the Bible text stored on device (already the architecture).
- **Native share sheet**, **haptics**, **status-bar and safe-area handling**.
- Real accounts and real community (not a static demo).
- Later: home-screen **widget** (verse of the day, streak), **deep links**.

## 4 · Content-safety requirements (both stores)

You have chat, prayer requests and user posts, so these are **mandatory**:

| Requirement | Where it lives |
|---|---|
| Filter objectionable content | Message filter + moderation API |
| **Report** content and users in-app | `reports` table + report button |
| **Block** abusive users | `blocks` table |
| Published **contact info** and response promise | Support page + email |
| **Account deletion** inside the app and on a web page | `request_account_deletion()` + Edge Function |
| Privacy policy URL, data-safety / privacy-nutrition labels | Write once, keep in the repo |
| **Sign in with Apple** if you offer Google/other social login | Auth setup |
| Age rating and audience | Target **13+**; don't opt into the "Families/Kids" tracks |

## 5 · Store listing checklist

- App name: **Berean**: check store availability and search for existing trademarks before
  committing. (The Berean Standard Bible team invites apps that use their verbatim text to
  carry the Berean name; that helps your position, but it isn't a trademark clearance.)
- Category: **Books & Reference** (or Lifestyle).
- Icon 1024×1024, Play **feature graphic 1024×500**, 4–8 screenshots per device size,
  short and long descriptions.
- **Website:** your `#/support` and marketing page. **Support email.** **Privacy policy URL.**
- Release notes; screenshots that show *real* content, not fake numbers.
- **Never** write "the first Christian community app". Describe what it does.

## 6 · Performance and data budget (this is where you win or lose in your market)

Design for a **2 GB-RAM Android phone on a weak connection**. Most of your first users have one.

| Budget | Target |
|---|---|
| Install size | Under ~30 MB |
| Cold start to readable text | Under 2 seconds on a low-end device |
| First-run data use | Under 5 MB before the user chooses to download more |
| Offline | Reading, progress, highlights, notes work with no signal; sync later |
| Motion | Respect "reduce motion"; audit Framer Motion on low-end devices |
| Lite mode | Skip images and animation, one tap in settings |

Test on a real cheap Android, not just the emulator. This is the single best predictor
of good reviews.

## 7 · Release pipeline

- **Versioning:** semantic; the build number must increase every upload.
- **Signing:** create the Android upload key and keep it (and its password) somewhere
  safe *outside* git. Losing it is painful.
- **Android:** internal test → closed test (the 14-day one) → production with **staged
  rollout** (start at 10%).
- **iOS:** TestFlight → App Store. Prepare demo credentials for App Review if sign-in is required.
- **Updates:** web-layer fixes can ship faster with an over-the-air bundle service, but
  Apple and Google limit *what* can change that way. Read the rules, and use it for bug
  fixes rather than new features.
- **CI:** GitHub Actions runs `typecheck`, `build`, `test:db` on every push.

## 8 · Suggested launch order

1. **Web/PWA** at your domain: free, instant, shareable, no review. Good for testers and
   the funding page.
2. **Android** (closed test → production). Cheaper, faster, and matches where your first
   users are.
3. **iOS** once the Android build is stable and you have a Mac or cloud Mac.

## 9 · Launch-day plan for the first 100 real users

You have the strongest distribution channel a Christian product can have: **pastors and
cell leaders each bring a room of people.**

1. Enrol **3–5 churches / cell groups** as a pilot before launch; their members are your
   closed-test testers.
2. Use the **weekly episode release** as your rhythm. Real episode, real time, real
   discussion.
3. Short clips ("Season 2, Episode 4 in 30 seconds") for WhatsApp Status, Reels and TikTok.
4. Ask each pilot leader for one testimonial and one screenshot with their permission.
5. Publish the **funding page** with an honest number: your real active readers.
