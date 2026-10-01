import { useMemo } from "react";
import { BarChart3, Check, MessageCircle, TrendingUp, Unplug, Users } from "lucide-react";
import { useApp, wa } from "../app/store";
import { useProfile } from "../app/profile";
import { Card, Label, Meter, Pill, useBerean } from "./ui";
import { TOTAL_CHAPTERS } from "../data/bible";
import { allEpisodes } from "../data/seasons";
import { siteUrl } from "../app/site";

/** What the church plan will show once real members are connected. */
const planned = [
  { t: "Weekly readers", d: "How many of your congregation opened Scripture this week — and how many did not." },
  { t: "Cell groups needing encouragement", d: "Which groups are reading together and which have gone quiet." },
  { t: "Visitors to follow up", d: "First-time worshippers, with a one-tap WhatsApp follow-up." },
  { t: "Most-read passages", d: "What your people are actually hungry for, useful for planning the next series." },
];

/**
 * Church insights.
 *
 * There is no backend in this build, so nothing here can know what a
 * congregation is doing — and it will not invent it. The numbers shown are the
 * pastor's own, read from this device; the congregation panel states plainly
 * what it will show once accounts exist, and stays empty until then.
 */
export default function Church() {
  const app = useApp();
  const { profile } = useProfile();
  const { saved, prayers, note } = useBerean();

  const readThisWeek = useMemo(() => {
    const since = Date.now() - 7 * 86400000;
    return app.readDates.filter((d) => {
      const t = new Date(`${d}T12:00:00`).getTime();
      return Number.isFinite(t) && t >= since;
    }).length;
  }, [app.readDates]);

  const chapterPct = Math.round((app.chaptersRead.length / TOTAL_CHAPTERS) * 100);
  const episodePct = allEpisodes.length ? Math.round((app.done.length / allEpisodes.length) * 100) : 0;

  const stats = [
    { v: `${app.streak}d`, l: "Your streak" },
    { v: `${readThisWeek}/7`, l: "Days read this week" },
    { v: String(app.chaptersRead.length), l: `Chapters (of ${TOTAL_CHAPTERS})` },
    { v: String(app.done.length), l: "Episodes finished" },
    { v: String(app.questions.length), l: "Questions asked" },
    { v: String(saved.length), l: "Verses saved" },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Your own numbers — the only ones that exist on this device */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Label>/ Your own reading on this device</Label>
            <h2 className="mt-2 font-fraunces text-[28px] font-semibold leading-tight text-parchment">
              {profile?.name ? `${profile.name}'s Berean` : "Your Berean"}
            </h2>
            <p className="mt-1 font-newsreader text-sm italic text-mist">
              {[profile?.church, profile?.city].filter(Boolean).join(" · ") || "Saved on this phone only — no account"}
            </p>
          </div>
          <Pill tone="line">
            <BarChart3 className="h-3 w-3" /> Real numbers, this device
          </Pill>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 border-t border-line/70 pt-5 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.l}>
              <p className="font-fraunces text-2xl font-semibold text-parchment">{s.v}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.15em] text-mist">{s.l}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em]">
              <span className="text-parchment">Bible read</span>
              <span className="text-gold">{chapterPct}%</span>
            </div>
            <Meter pct={chapterPct} />
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em]">
              <span className="text-parchment">Seasons finished</span>
              <span className="text-gold">{episodePct}%</span>
            </div>
            <Meter pct={episodePct} />
          </div>
        </div>

        <p className="mt-5 border-t border-line/60 pt-4 font-newsreader text-sm italic text-mist">
          {prayers.length} prayers and {note ? "a study note" : "no study notes"} are also kept on this phone. A pastor's
          own habit is the first thing worth measuring — and today it is the only thing Berean can measure.
        </p>
      </Card>

      {/* The congregation panel: honest about what does not exist yet */}
      <Card className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Label>/ Congregation</Label>
            <h2 className="mt-2 font-fraunces text-[26px] font-semibold leading-tight text-parchment">
              Nobody is connected yet
            </h2>
            <p className="mt-1 max-w-xl font-newsreader text-[15px] leading-relaxed text-mist">
              Berean has no accounts in this build, so it cannot see your members' phones — and it will not invent them.
              The day real people sign in, this panel fills with real numbers and nothing else.
            </p>
          </div>
          <Pill tone="line">
            <Unplug className="h-3 w-3" /> Needs accounts
          </Pill>
        </div>

        <div className="mt-5 flex flex-col divide-y divide-line/60">
          {planned.map((p) => (
            <div key={p.t} className="flex items-start gap-3 py-3.5">
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full border border-mist/60" aria-hidden />
              <div>
                <p className="font-newsreader text-[15px] text-parchment">{p.t}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">{p.d}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-5 border-t border-line/60 pt-4 font-newsreader text-sm leading-relaxed text-mist">
          The data model behind all of it is already written and tested (<span className="text-parchment">supabase/migrations/0001_init.sql</span>,
          58 row-level-security policies) — it just has nowhere to run yet. That is milestone 2 on the support page.
        </p>
      </Card>

      {/* Invite: the one thing that genuinely helps today */}
      <Card className="p-6">
        <div className="flex items-center justify-between gap-3">
          <Label>/ Invite your congregation</Label>
          <Pill tone="wa">
            <Users className="h-3 w-3" /> Works today
          </Pill>
        </div>
        <p className="mt-3 font-newsreader text-[15px] leading-relaxed text-mist">
          One tap shares Berean with a member. Everything they read stays on their own phone, and their progress is
          theirs alone — the same honesty you would want from any app your church uses.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <a
            href={wa(
              `Join me on Berean 📖\n\nThe Bible in seasons — short episodes, games, and the scriptures from Sunday linked and ready.\n\n${
                profile?.code ? `My invite code: ${profile.code}\n\n` : ""
              }${siteUrl()}`
            )}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-wa px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-night"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Share with a member
          </a>
          {profile?.code && (
            <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
              Invite code {profile.code}
            </span>
          )}
        </div>
      </Card>

      {/* The plan, clearly labelled as a plan */}
      <Card className="p-6">
        <Label>/ The church plan</Label>
        <div className="mt-3 flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-gold" />
          <span className="font-fraunces text-lg font-semibold text-parchment">Coming with accounts — not on sale yet</span>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {[
            "Sunday's scriptures linked for every member",
            "A Monday–Saturday reading plan from your sermon",
            "Cell-group questions prepared for you",
            "Weekly engagement report, once accounts exist",
            "Visitor follow-up list",
            "Your church's own space on the web",
          ].map((f) => (
            <li key={f} className="flex items-start gap-2 font-newsreader text-sm text-parchment">
              <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-gold" />
              {f}
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap items-baseline gap-3 border-t border-line/60 pt-4">
          <span className="font-fraunces text-2xl font-semibold text-gold">GHS 150</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-mist">
            per month, a starting price to test — not a price to keep
          </span>
        </div>
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
          Members never pay. The church pays.
        </p>
      </Card>
    </div>
  );
}
