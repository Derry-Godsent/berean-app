# 3 · Funding Berean: a place for people worldwide to help

You asked for a place where people across the world can fund the continuity and expansion
of a one-person project. This document covers **where the money comes from, how it reaches
you, what the app stores allow, and how to ask without damaging trust.**

The page itself is built: **`#/support`** ("Keep the lamp lit"), also reachable in the app.
It is the public link you put in WhatsApp statuses, church announcements, your bio and the
store listing's website field.

> **Confirmed (2026-09-29):** you are in **Ghana**, working alone and full-time, with **no
> registered business yet** and no plan to register one now. §2 is written for that. Berean is
> a **web app you install from the browser** for now (no store fees), so the money it needs
> today is small; see §5.

## 1 · Principles (these protect the mission)

1. **Scripture is never behind a paywall or a guilt trip.** Reading, seasons, games and
   community stay free. Giving is a gift, not a purchase.
2. **Be transparent to the dollar.** Publish what it costs and what came in. Christians give
   to what they trust, and a one-person project has nothing to trade on *but* trust.
3. **Never ask mid-reading.** Ask after a moment of value (a finished season, a 7-day streak),
   at most once a month, with a permanent "don't ask again".
4. **Don't call it a charity if it isn't.** Say plainly that gifts go to the developer and
   are not tax-deductible until you have a registered vehicle that makes them so.

## 2 · How money actually reaches a developer in Ghana

This is the part most "how to fundraise" guides skip, and it decides what you can use.

| Channel | Works from Ghana? | Notes |
|---|---|---|
| **Stripe** (direct) | **No.** Ghana is only an *extended-network* market via **Paystack**; you cannot open a normal Stripe account | Stripe Atlas (US company, ≈ $500) is the later workaround |
| **Paystack** | **Yes** | Mobile money (MTN/Vodafone/AirtelTigo) and local cards. Owned by Stripe. Ask them whether international cards are enabled on your account. Best for Ghana/Nigeria supporters |
| **Flutterwave** | Yes | Pan-African alternative to Paystack; wide mobile-money coverage |
| **Ko-fi** | **Probably**, *if* you can hold a PayPal or Stripe account to be paid into | 0% platform fee on one-time gifts; money goes straight to *your* PayPal/Stripe. **Verify PayPal can receive in your case before you rely on it** |
| **Buy Me a Coffee** | **No, most likely.** Payouts run only through Stripe, so you must live in a Stripe-supported country | Skip unless you get a Stripe-supported entity |
| **GitHub Sponsors** | Needs an **open-source** project. **You decided to keep Berean closed, so this channel is dropped** (and removed from the app) | Revisit only if you ever open the code (§7) |
| **Patreon** | Payout depends on PayPal/bank options in your country. Verify | Fees 8–12%. Not needed at the start |
| **Wise / Payoneer / a domiciled USD account** | Useful for *receiving* international transfers | Talk to your bank; keep records for tax |

Sources checked 2026-09-29: [Stripe availability](https://stripe.com/global),
[Ko-fi](https://ko-fi.com/), [Buy Me a Coffee payouts](https://postunreel.com/blog/what-is-buy-me-a-coffee),
[GitHub Sponsors regions](https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors),
[Stripe in Africa](https://ngwaspenn.com/stripe-supported-countries-africa/).

### What an unregistered individual in Ghana can realistically open

Findings from 2026 searches. Several are SEO blog posts of mixed reliability, so **verify each
one with the provider before you rely on it**:

- **Paystack (Ghana)** most likely wants a **registered Business Name** (a sole proprietorship
  is enough; it is *not* a limited company), a **GRA Tax ID (TIN)**, a **Ghana Card**, and a Ghana
  bank account. Some guides say you can start the application while registration is pending,
  possibly with lower limits. A "Starter Business" tier exists for Nigeria; I could not confirm
  it for Ghana. **Registering a Business Name is probably the single step that unlocks
  Paystack.** Check the current fee and process at the Office of the Registrar of Companies
  (orc.gov.gh) and with Paystack.
- **Ko-fi** pays supporters' gifts *straight into your own PayPal or Stripe account*; Ko-fi holds
  no money. It charges 0% on donations. It is usable **today** only if a **PayPal account in
  your name can receive money**. Test by logging into PayPal and checking that "receive
  payments" works for a Ghana account. If it doesn't, Ko-fi is not an option yet.
- **Mobile-money-only providers** exist for individuals, but card acceptance (what
  international supporters use) generally needs registration.
- **Data protection:** Ghana's Data Protection Act expects anyone who processes personal
  data as a business to register with the Data Protection Commission. Berean stores almost
  nothing today, but this matters once accounts exist (Phase 1).

**Until one door is open, the Support page says "Giving is opening soon" and offers your contact
email.** That is honest and costs nothing. It does not show a dead button.

### Recommended setup: two doors, no code, this week

1. **Ko-fi page** for the *world*, **if PayPal can receive for you** (cards, Apple/Google Pay, PayPal; one-time and monthly).
2. **Paystack payment page** for *Ghana and Nigeria* (mobile money and local cards), **after a Business Name is registered**.

Put both URLs in `.env.local` as `VITE_GIVE_KOFI_URL` and `VITE_GIVE_PAYSTACK_URL`. The
funding page shows exactly the options that have a link, so it never shows a dead button.
Then add a third door only when it earns its keep.

## 3 · What the app stores allow (this shapes the design)

| Store | Rule | Consequence |
|---|---|---|
| **Apple (iOS)** | Tips to the developer must go through **In-App Purchase** (Guideline 3.1.1). An exception for gifts *"to another individual"* exists (3.2.1(vii)), but developers report Apple applying it only to reader-type apps and telling apps to use IAP; a *"Buy Me a Coffee"* link was removed in review. Charity fundraising in-app is only for approved nonprofits | **Treat external giving links inside the iOS app as forbidden.** The app hides them on iOS (`src/app/funding.ts`). iOS supporters give through an **in-app Supporter purchase** (roadmap phase 2, via RevenueCat) |
| **Google Play** | Historically tolerant of external tip links; 2025-26 rulings and policy changes (*Epic v. Google*) now allow external links and alternative billing, with fees on *digital-goods* purchases that start in-app | A donation link to a developer is low risk, but **re-read Google's Payments policy at submission** |
| **Web (`#/support`)** | No store rules | This is your **canonical, most flexible** giving page |

**Do not give donors perks that unlock app features** unless it goes through the store's
billing. Apple says a gift "associated at any point with receiving digital content or
services must use in-app purchase". Keep gift perks *non-functional* (recognition, a
vote, a letter) and put anything that unlocks features in a separate paid product (§4).

Sources: [Apple App Review Guidelines §3](https://developer.apple.com/app-store/review/guidelines/),
[developer report on a rejected tip link](https://medium.com/@robert-baer/my-ongoing-battle-with-apple-over-a-buy-me-a-coffee-link-is-over-9c158df81c05),
[Google's 2026 billing programs (reported)](https://www.appcharge.com/blog/making-sense-of-google-payment-programs-ecl-billing-choice-level-up-and-the-global-model).
*These change quarterly. Re-check before each release.*

## 4 · The revenue stack (five layers, in build order)

### Layer 1: Gifts ("Lamp Lighters")
One-time or monthly, any amount, via the two doors above.

- **Perks that are safe on every platform:** name on the supporters wall (opt-in), a
  monthly "what I built this month" letter, a vote on which season comes next, and a small
  badge that changes nothing functional.
- **Transparency:** the `donations` table and `funding_public` view already exist. Webhooks
  from Ko-fi and Paystack write to the ledger; the meter on the page reads from it, so the
  progress bar is true. (Until then `VITE_FUNDING_RAISED_USD` is a manual stand-in.)

### Layer 2: iOS/Android in-app "Supporter" and optional "Berean Plus"
Use **RevenueCat** to handle Apple/Google billing, receipts and restores with one SDK.

- **Supporter:** monthly/annual gift-like subscription whose only benefit is recognition.
  Keeps iOS fundable without breaking Apple's rules.
- **Plus** (a normal product, not a donation): things that cost you money to provide:
  higher daily AI quota, audio downloads, extra themes and fonts, offline packs, advanced
  study tools. **Never Scripture, never the core reading experience.**
- Store cut: Apple's Small Business Program and Google's reduced tiers lower the
  commission for small developers (**verify the current rates**).

### Layer 3: Sponsor a Season *(unique to your format)*
Because content is *seasons*, you can offer a **dedication line**: *"Season 2, The Money
Question, is sponsored by Grace Chapel Accra."* A church, business or family pays to fund
a season's production. This is a natural fit and a story people will share.

- Price by production effort, not by a rigid rate card. Start as a pilot with 1–3 sponsors.
- **Editorial independence, in writing:** sponsors fund; they don't edit or steer doctrine.
- Schema hook exists: `seasons.sponsor_name`.

### Layer 4: Church plan (the real business)
Pastors, cell-group tools and congregation insights are worth money to churches, and
churches have budgets that individuals don't.

- Sell on the **web**, not in the app. Apple's rules treat organisational purchases
  differently from individual ones, so keep the app as the members' *reader* and take
  church subscriptions on your website (Paystack for local currency).
- Price by congregation size and in local currency (your fixture uses GHS 150/month,
  which is a reasonable starting point to test, not a price to keep).
- Include a **free tier for very small churches**, and a **"sponsor a church"** option where
  donors pay for a church that can't. That turns Layer 1 money into growth.
- Pastors need trust before they'll pay, so ask a few to co-design it.

### Layer 5: Grants and partners
- Scripture-engagement organisations and Bible societies (for example your national Bible
  Society) sometimes fund or endorse tools that get people reading. An endorsement also
  helps you recruit testers and churches.
- Christian tech and mission funds exist; the pitch is measurable: **chapters read by
  previously lapsed readers**. Track that from day one (see Product §metrics).
- Applying needs a legal entity, which leads to §6.

## 5 · What the money is for (the honest budget)

Because Berean is a website you install from the browser, it is hosted **free** (Cloudflare
Pages, see `docs/04-MOBILE-LAUNCH.md`). Gifts are not "keeping the lights on"; they unlock
**steps**. The page shows a **milestone list and one total-raised meter**, from
`src/app/funding.ts` (`milestones`). Amounts are planning estimates; check them.

| # | Step | Cost | Running total |
|---|---|---|---|
| 1 | A real web address (domain) | ~$12 / year (estimate) | $12 |
| 2 | Three months of accounts and live rooms (Supabase Pro, ~$25/mo) | ~$75 (estimate) | $87 |
| 3 | Google Play developer account | $25 once | $112 |
| 4 | Three months of instant answers (AI) | ~$60 (estimate) | $172 |
| 5 | Apple Developer Program, year one | $99 / year | $271 |
| Later | A licensed modern translation, if you want one beyond BSB/WEB/KJV | ≈ $39/mo (published price lists) | n/a |

Set `VITE_FUNDING_RAISED_USD` to the **total** given so far and the meter moves. Leave it
empty to hide the meter. Until real money has arrived, **leave it empty**; never show a made-up
number.

**So the first goals are small and winnable.** About $12 buys the domain; $87 buys the live
rooms for a quarter. Say that out loud on the page. Small, concrete goals convert far better
than "help me build a Bible app".

Beyond that: a **reserve of three months** first, licensed translations next, then paying for
your own time. Publish your pay policy honestly, even if it is "none yet".

*Illustrative scenarios, not forecasts:*

| | Result |
|---|---|
| 10,000 monthly readers × 1% giving × $5 | ≈ $500/mo |
| 40 churches × $30/mo | ≈ $1,200/mo |
| 3 season sponsors a year × $500 | ≈ $1,500/yr |

The church plan matters most for sustaining a full-time developer, which is why Phase 3
of the roadmap is dedicated to it.

## 6 · Legal and tax (sort this before serious money arrives)

- **Gifts to you personally are not tax-deductible** for the donor, and are probably
  taxable income for you. That is why the page says so. Speak to a Ghanaian accountant
  about registering a business (sole proprietorship vs. company), tax on foreign income,
  and record-keeping. **I can't give tax advice; verify locally.**
- **To offer deductible receipts** you need a registered charity or a **fiscal sponsor** (an
  established nonprofit that receives gifts on your project's behalf for a small fee).
  Worth it once gifts pass a few thousand dollars a year, and required by many grantmakers.
- **Never publish a personal mobile-money or bank number** on social media for donations.
  It invites scams and looks unprofessional. Use the payment pages.
- **Keep a simple ledger** from the first dollar. The `donations` table is that ledger.

## 7 · Open source: decided **no** (for now)

"Open source" means the program's code is **public**: anyone can read it, copy it, and start
their own version. You chose to keep Berean **closed and private**, and to reconsider only once it
has earned a little money.

Consequences: **GitHub Sponsors is dropped** (it needs open source), and volunteer developers
can't join without your invitation.

> ⚠ **Check your repository's visibility.** On 2026-09-29 GitHub reported
> `Derry-Godsent/berean-app` as **public** (`gh repo view --json isPrivate` returned `false`).
> Anyone can read it today. To make it private: GitHub → the repository → **Settings** →
> scroll to **Danger Zone** → **Change visibility** → **Make private**. Do this before you put
> real API endpoints, keys or unreleased seasons in it. Keys should never be in the code
> either way (`.env*` is git-ignored).

If you ever change your mind: open the app but keep the season texts and the Berean name and
logo under your own licence. Decide slowly, because it is hard to undo.

## 8 · How to ask (the page copy and behaviour)

- Lead with the **mission** (get people into the Bible), then the **person** (one developer),
  then the **numbers**. That's the order the page uses.
- Add a **founder note** (`founderNote` in `src/app/funding.ts`). A first-person draft is in
  the file, **hidden until you set `approved: true`**. Change anything that isn't true for you,
  add your name and (if you want) a photo. Real people give to real people.
- Show **proof of work**: "Seasons shipped, chapters read this month, next season". Update monthly.
- Offer **non-money help** first: share, test, translate, introduce your church. Many who
  can't give will do these; later they're also what Google Play's 12-tester rule needs.
- Thank publicly (opt-in), promptly, personally.

## 9 · Implementation status

| Item | Status |
|---|---|
| Public funding page at `#/support`, in-app screen, header/sidebar entry | ✅ built |
| Link config, milestone list + total-raised meter, iOS-native gating | ✅ built (`src/app/funding.ts`, `platform.ts`) |
| Founder note (draft, hidden until approved) | ✅ written, ⏳ your approval |
| Ledger tables and public views with privacy rules | ✅ built and tested |
| Ko-fi and Paystack webhooks → `donations` (verify signatures) | ⏳ phase 1 (Edge Function) |
| RevenueCat Supporter purchase (native apps only) | ⏳ when native apps exist |
| Real custom domain for a clean shareable link | ⏳ your action / milestone 1 |
| Church plan checkout (web) | ⏳ phase 3 |

Note on iOS: Apple's link rules (§3) apply to the **native App Store app**, not to Berean opened in
Safari or installed to the home screen from the web. The web version can show giving links on
iPhones. `iosGivingHidden()` only turns on inside a future native iOS build.

## 10 · Your checklist this week

1. Test whether **PayPal can receive money** in your name. If yes, create the **Ko-fi** page.
2. Look up **Business Name registration** at orc.gov.gh (cost, time). It probably unlocks
   Paystack. Ask a local accountant what it means for tax.
3. Put any working link in `.env.local`, rebuild, and open `#/support`.
4. Read the **founder note draft** in `src/app/funding.ts`, edit it, set `approved: true`.
5. Make the GitHub repo **private** (see §7).
6. Tell five pastors and get one to say yes to co-designing the church plan.
