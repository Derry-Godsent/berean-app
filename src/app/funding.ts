import { platform } from "./platform";

/**
 * Everything about how people can support Berean lives here, so changing a
 * link or a price never means touching UI code.
 *
 * Links come from environment variables (see .env.example). An option with
 * no link is simply not shown — we never render a dead "Donate" button.
 */
const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined);

export interface GiveChannel {
  id: "kofi" | "paystack" | "paypal";
  label: string;
  blurb: string;
  url: string;
}

const allChannels: (Omit<GiveChannel, "url"> & { url?: string })[] = [
  {
    id: "kofi",
    label: "Ko-fi",
    blurb: "Card, Apple Pay, Google Pay or PayPal. One-time or monthly. Works from anywhere.",
    url: clean(env.VITE_GIVE_KOFI_URL),
  },
  {
    id: "paystack",
    label: "Mobile money & local cards",
    blurb: "MTN, Vodafone and AirtelTigo money, plus local bank cards. Best if you are in Ghana or Nigeria.",
    url: clean(env.VITE_GIVE_PAYSTACK_URL),
  },
  {
    id: "paypal",
    label: "PayPal",
    blurb: "Send a gift straight from your PayPal balance.",
    url: clean(env.VITE_GIVE_PAYPAL_URL),
  },
];

/**
 * Store policy, in one place.
 *
 * Apple (App Review 3.1.1 / 3.2.1): inside an iOS app, asking for money for a
 * non-charity outside In-App Purchase — including a link — gets apps rejected.
 * So on iOS we show no external giving at all. iOS supporters will use an
 * in-app "Supporter" purchase (RevenueCat, roadmap phase 2).
 *
 * Android and web can link out. Re-check both stores' current policy before
 * each release — see docs/03-FUNDING.md.
 */
export function giveChannels(): GiveChannel[] {
  if (platform() === "ios") return [];
  return allChannels.filter((c): c is GiveChannel => !!c.url);
}

export const iosGivingHidden = () => platform() === "ios";

export const contactEmail = clean(env.VITE_CONTACT_EMAIL);

/**
 * What gifts are for, in the order they unlock. `cumulativeUsd` is the running
 * total needed to reach that step, so one "total raised" number places the meter.
 * Amounts are planning estimates from published 2026 price lists: check them,
 * and edit this list as reality changes. Berean is a website you install from
 * the browser, so it costs almost nothing to run today; the steps below are
 * the things that need money.
 */
export interface Milestone {
  id: string;
  label: string;
  why: string;
  usd: number;
  cumulativeUsd: number;
  estimate?: boolean;
}

const steps: Omit<Milestone, "cumulativeUsd">[] = [
  { id: "domain", label: "A real web address", why: "So the link to Berean is short and yours, instead of a long free address.", usd: 12, estimate: true },
  { id: "rooms", label: "Three months of accounts and live rooms", why: "Sign-in, saving your progress across phones, and chat rooms with real people.", usd: 75, estimate: true },
  { id: "play", label: "Google Play", why: "A one-time fee that puts Berean in the Android store.", usd: 25 },
  { id: "ai", label: "Three months of instant answers", why: "The 'ask about any verse' feature answers with AI, which costs money per question.", usd: 60, estimate: true },
  { id: "apple", label: "Apple App Store, first year", why: "$99 a year to be on iPhones' store. Until then, iPhone users install from the browser.", usd: 99 },
];

export const milestones: Milestone[] = (() => {
  let total = 0;
  return steps.map((m) => ({ ...m, cumulativeUsd: (total += m.usd) }));
})();

/** Total given so far, in whole US dollars. Set VITE_FUNDING_RAISED_USD; empty hides the meter. */
export const raisedUsd = (() => {
  const n = Number(clean(env.VITE_FUNDING_RAISED_USD));
  return Number.isFinite(n) && n >= 0 && clean(env.VITE_FUNDING_RAISED_USD) !== undefined ? n : undefined;
})();

/** The step currently being funded, and how far into it we are. */
export function milestoneProgress(raised: number) {
  const idx = milestones.findIndex((m) => raised < m.cumulativeUsd);
  if (idx === -1) return { done: true as const, current: null, fraction: 1, remaining: 0 };
  const m = milestones[idx];
  const start = m.cumulativeUsd - m.usd;
  return { done: false as const, current: m, fraction: (raised - start) / m.usd, remaining: m.cumulativeUsd - raised };
}

/**
 * The founder's note on the support page. It is written in the first person, so it
 * is only shown once `approved` is true (approved by the founder on 2026-09-29).
 */
export const founderNote = {
  approved: true,
  title: "Why I'm building this",
  paragraphs: [
    "I'm one person, building Berean from Ghana. There is no team and no company behind it.",
    "Most people I know only open a Bible at church. I want reading to be something you look forward to: a short episode you can finish in a few minutes, the next one waiting for you, and friends to talk it over with.",
    "I can't yet afford the store fees for the Android and Apple stores, so Berean runs in your browser and installs to your phone from there. Gifts go to the servers, the store fees, and the time it takes to write more seasons.",
    "If you'd rather not give, sharing Berean with one person who has stopped reading means just as much to me.",
  ],
  signature: "",
};
