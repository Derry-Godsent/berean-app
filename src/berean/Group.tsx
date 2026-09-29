import { useState } from "react";
import { Heart, MapPin, MessageCircle, Send, UserPlus, Flame } from "lucide-react";
import { cellGroup } from "../data/berean";
import { Avatar, Card, Label, Meter, Pill, StreakRing, useBerean, SampleBanner } from "./ui";
import { siteUrl } from "../app/site";

export default function Group() {
  const { prayers, addPrayer } = useBerean();
  const [draft, setDraft] = useState("");
  const [prayed, setPrayed] = useState<Record<string, boolean>>({});

  const readCount = cellGroup.members.filter((m) => m.read).length;
  const waiting = cellGroup.members.filter((m) => !m.read);

  const nudgeText = encodeURIComponent(
    `Good evening ${waiting.map((w) => w.name.split(" ")[0]).join(", ")} 🤍\n\n${cellGroup.name} is on a ${cellGroup.groupStreak}-day streak and today's reading (Psalm 1:1-3, "The Tree By The Water") is only 6 minutes. Don't let us break it — read now on Berean.\n\n— ${cellGroup.name}`
  );

  return (
    <div className="flex flex-col gap-5">
      <SampleBanner what="The cell group" />
      <Card className="p-5">
        <div className="flex items-start gap-5">
          <StreakRing value={cellGroup.groupStreak} label="group streak" size={104} />
          <div className="min-w-0 flex-1">
            <Label>/ Your cell group</Label>
            <h2 className="mt-1 font-fraunces text-2xl font-semibold leading-tight text-parchment">
              {cellGroup.name}
            </h2>
            <p className="mt-1.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
              <MapPin className="h-3 w-3 text-gold" /> {cellGroup.meeting}
            </p>
            <div className="mt-3">
              <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em]">
                <span className="text-parchment">Read today</span>
                <span className="text-gold">
                  {readCount}/{cellGroup.members.length}
                </span>
              </div>
              <Meter pct={(readCount / cellGroup.members.length) * 100} />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-line/70 pt-4">
          <a
            href={`https://wa.me/?text=${nudgeText}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-wa px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-night transition-transform hover:scale-[1.02]"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Nudge {waiting.length} on WhatsApp
          </a>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `You're invited to ${cellGroup.name} 🤍\n\nWe meet ${cellGroup.meeting}. Join our reading plan on Berean — 6 minutes a day: ${siteUrl()}/join/${cellGroup.church
                .toLowerCase()
                .replace(/\s+/g, "-")}`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full border border-wa/40 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-wa transition-colors hover:bg-wa/10"
          >
            <UserPlus className="h-3.5 w-3.5" /> Invite a friend
          </a>
        </div>
      </Card>

      {/* Who's read */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <Label>/ Who's read today</Label>
          <Pill tone="sage">
            <Flame className="h-3 w-3" /> Nobody wants to break this
          </Pill>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-y-5 sm:grid-cols-8">
          {cellGroup.members.map((m) => (
            <div key={m.name} className="relative">
              <Avatar initials={m.initials} read={m.read} />
              <p className="mt-1 truncate text-center font-mono text-[9px] uppercase tracking-wider text-mist">
                {m.name.split(" ")[0]}
              </p>
              {m.streak > 0 && (
                <p className="text-center font-mono text-[9px] text-gold/70">
                  {m.streak}d
                </p>
              )}
            </div>
          ))}
        </div>
        <p className="mt-4 border-t border-line/60 pt-3 font-newsreader text-sm italic text-mist">
          {waiting.length} still to read. A gentle WhatsApp nudge beats a sermon about
          discipline. That is the whole point.
        </p>
      </Card>

      {/* Prayer wall */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <Label>/ Prayer wall</Label>
          <Pill tone="gold">{prayers.length} requests</Pill>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {prayers.map((pr, i) => {
            const key = `${pr.name}-${i}`;
            return (
              <div
                key={key}
                className="rounded-xl border border-line/70 bg-night/50 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                    {pr.name}
                  </span>
                  <span className="font-mono text-[10px] text-mist">· {pr.time}</span>
                </div>
                <p className="mt-2 font-newsreader text-[15px] leading-relaxed text-parchment">
                  {pr.text}
                </p>
                <button
                  onClick={() => setPrayed((s) => ({ ...s, [key]: !s[key] }))}
                  className={`mt-3 flex items-center gap-2 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
                    prayed[key]
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-line text-mist hover:border-gold/40 hover:text-gold"
                  }`}
                >
                  <Heart className="h-3 w-3" />
                  {prayed[key] ? "You prayed" : "I prayed"} · {pr.praying + (prayed[key] ? 1 : 0)}
                </button>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!draft.trim()) return;
            addPrayer(draft.trim());
            setDraft("");
          }}
          className="mt-4 flex gap-2"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Share a prayer request…"
            className="min-w-0 flex-1 rounded-full border border-line bg-night/60 px-4 py-3 font-newsreader text-[15px] text-parchment placeholder:text-mist/60 focus:border-gold/50 focus:outline-none"
          />
          <button
            type="submit"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold text-night"
            aria-label="Post prayer request"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </Card>
    </div>
  );
}
