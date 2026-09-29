import { motion } from "framer-motion";
import {
  BellRing,
  Check,
  Crown,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import { church } from "../data/berean";
import { Card, EASE, Label, Meter, Pill, SampleBanner } from "./ui";
import { siteUrl } from "../app/site";

const week = [
  { d: "Mon", v: 38 },
  { d: "Tue", v: 44 },
  { d: "Wed", v: 52 },
  { d: "Thu", v: 61 },
  { d: "Fri", v: 47 },
  { d: "Sat", v: 31 },
  { d: "Sun", v: 74 },
];

export default function Church() {
  const gain = church.weeklyReaders - church.beforeBerean;

  return (
    <div className="flex flex-col gap-5">
      <SampleBanner what="The church dashboard" />
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Label>/ Pastor's dashboard</Label>
            <h2 className="mt-2 font-fraunces text-[28px] font-semibold leading-tight text-parchment">
              {church.name}
            </h2>
            <p className="mt-1 font-newsreader text-sm italic text-mist">
              {church.pastor} · {church.members} members · {church.cells} cell groups
            </p>
          </div>
          <Pill tone="gold">
            <Crown className="h-3 w-3" /> {church.plan} — {church.price}/month
          </Pill>
        </div>
      </Card>

      {/* Hero metric */}
      <Card className="overflow-hidden p-6">
        <Label>/ The number that matters</Label>
        <div className="mt-3 flex items-end gap-4">
          <span className="font-fraunces text-[68px] font-semibold leading-none text-gold">
            {church.weeklyReaders}%
          </span>
          <div className="pb-2">
            <p className="font-newsreader text-sm text-parchment">
              of your congregation read the Bible this week
            </p>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-sage">
              <TrendingUp className="h-3 w-3" /> +{gain} points vs. before
            </p>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
            <span>Before Berean · {church.beforeBerean}%</span>
            <span className="text-gold">Now · {church.weeklyReaders}%</span>
          </div>
          <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-line">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-mist/40"
              initial={{ width: 0 }}
              animate={{ width: `${church.beforeBerean}%` }}
              transition={{ duration: 0.9, ease: EASE }}
            />
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${church.weeklyReaders}%` }}
              transition={{ duration: 1.4, delay: 0.3, ease: EASE }}
            />
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line/70 pt-5 sm:grid-cols-3">
          {[
            { v: `${church.avgStreak}d`, l: "Avg. personal streak" },
            { v: church.minutesWeek.toLocaleString(), l: "Minutes in the Word" },
            { v: `${church.cells}`, l: "Active cell groups" },
          ].map((s) => (
            <div key={s.l}>
              <p className="font-fraunces text-2xl font-semibold text-parchment">
                {s.v}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                {s.l}
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* Weekly rhythm chart */}
      <Card className="p-6">
        <Label>/ Reading rhythm this week</Label>
        <div className="mt-6 flex h-40 items-end gap-2 sm:gap-3">
          {week.map((w, i) => (
            <div key={w.d} className="flex flex-1 flex-col items-center gap-2">
              <span className="font-mono text-[10px] text-mist">{w.v}%</span>
              <motion.div
                className={`w-full rounded-t-md ${
                  w.d === "Sun" ? "bg-gold" : "bg-gold/35"
                }`}
                initial={{ height: 0 }}
                animate={{ height: `${(w.v / 74) * 110}px` }}
                transition={{ duration: 0.8, delay: i * 0.06, ease: EASE }}
              />
              <span className="font-mono text-[10px] uppercase tracking-wider text-mist">
                {w.d}
              </span>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-line/60 pt-4 font-newsreader text-sm italic text-mist">
          Sunday is a spike; Monday to Saturday is where faith is actually built. The
          dip is what this app exists to flatten.
        </p>
      </Card>

      {/* Passages + cells */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="p-6">
          <Label>/ Most-read passages</Label>
          <div className="mt-5 flex flex-col gap-4">
            {church.topPassages.map((t) => (
              <div key={t.ref}>
                <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em]">
                  <span className="text-parchment">{t.ref}</span>
                  <span className="text-gold">{t.pct}%</span>
                </div>
                <Meter pct={t.pct} />
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-line/60 pt-4 font-newsreader text-sm italic text-mist">
            What your people are actually hungry for. Useful for planning the next
            sermon series.
          </p>
        </Card>

        <Card className="p-6">
          <Label>/ Which cells need encouragement</Label>
          <div className="mt-5 flex flex-col divide-y divide-line/60">
            {church.cellsActive.map((c) => (
              <div key={c.name} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-newsreader text-[15px] text-parchment">
                    {c.name}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                    {c.pct}% active · {c.streak}d streak
                  </p>
                </div>
                {c.pct < 55 ? (
                  <Pill tone="gold">Needs a call</Pill>
                ) : (
                  <Check className="h-4 w-4 text-sage" />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Retention — the B2B gold */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <Label>/ Visitors to follow up</Label>
          <Pill tone="sage">
            <UserCheck className="h-3 w-3" /> Retention
          </Pill>
        </div>
        <div className="mt-5 flex flex-col gap-3">
          {church.visitors.map((v) => (
            <div
              key={v.name}
              className="flex flex-wrap items-center gap-3 rounded-xl border border-line/70 bg-night/50 p-4"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gold/40 font-mono text-[10px] text-gold">
                {v.name.split(" ").map((n) => n[0]).join("")}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-newsreader text-[15px] text-parchment">{v.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                  First visit: {v.first} · {v.follows}
                </p>
              </div>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Blessings ${v.name.split(" ")[0]} 🤍 We're so glad you worshipped with us at ${church.name}. Here's this week's scripture thread — it takes 6 minutes: ${siteUrl()}/join`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-wa/40 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-wa transition-colors hover:bg-wa/10"
              >
                Follow up
              </a>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-line/60 pt-4 font-newsreader text-sm italic text-mist">
          A visitor who reads during the week is far more likely to come back. That is
          the sentence you sell to a pastor.
        </p>
      </Card>

      {/* Send + pricing */}
      <Card className="p-6">
        <Label>/ Broadcast</Label>
        <h3 className="mt-2 font-fraunces text-xl font-semibold text-parchment">
          Send Monday's devotional
        </h3>
        <p className="mt-2 font-newsreader text-sm text-mist">
          One tap reaches {church.members} members. About 12 KB each, roughly 3 minutes of
          WhatsApp Voice Note worth of data per person.
        </p>
        <button className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-4 font-fraunces text-base font-semibold text-night transition-transform hover:scale-[1.01]">
          <BellRing className="h-4 w-4" /> Send to all {church.members} members
        </button>

        <div className="mt-6 rounded-2xl border border-gold/25 bg-gold/[0.06] p-5">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gold" />
              <span className="font-fraunces text-lg font-semibold text-parchment">
                {church.plan} plan
              </span>
            </div>
            <span className="font-fraunces text-2xl font-semibold text-gold">
              {church.price}
              <span className="font-mono text-[10px] uppercase tracking-wider text-mist">
                {" "}
                /month
              </span>
            </span>
          </div>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              "Unlimited members & cell groups",
              "Sermon-to-scripture automation",
              "Weekly engagement report",
              "Visitor follow-up list",
              "Broadcast to WhatsApp",
              "Your church's own branded space",
            ].map((f) => (
              <li
                key={f}
                className="flex items-start gap-2 font-newsreader text-sm text-parchment"
              >
                <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" />
                {f}
              </li>
            ))}
          </ul>
          <p className="mt-4 border-t border-gold/20 pt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
            Members never pay. The church pays.
          </p>
        </div>
      </Card>
    </div>
  );
}
