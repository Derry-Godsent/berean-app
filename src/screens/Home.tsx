import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { useApp, wa } from "../app/store";
import { nextEpisode, seasonProgress, useCountdown, verseOfDay } from "../app/helpers";
import { seasons, accentOf, nextPremiere } from "../data/seasons";
import { bookById } from "../data/bible";
import { TOTAL_CHAPTERS, parseRef } from "../data/bible";
import { TaggedText } from "../app/tags";
import { useTheme } from "../app/theme";
import { EASE, InstallCard } from "../berean/ui";
import { Lamp } from "../berean/Lamp";

/** Remembered so "Not now" is once and for good, as the funding policy promises. */
const LAMP_ASK_KEY = "berean:lamp-ask";

function Section({
  title,
  note,
  accent = "var(--color-gold)",
  children,
}: {
  title: string;
  note?: string;
  /** Small coloured marker in front of the heading. */
  accent?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex items-center gap-4 border-b border-line pb-2">
        <h2 className="flex items-center gap-2.5 font-fraunces text-[22px] font-semibold leading-none text-parchment">
          <span aria-hidden className="h-2.5 w-2.5 shrink-0" style={{ background: accent }} />
          {title}
        </h2>
        <span className="h-px flex-1" />
        {note && <span className="font-mono text-[11px] text-mist">{note}</span>}
      </div>
      {children}
    </section>
  );
}

function PremiereSection({
  season,
  accent,
  at,
}: {
  season: { n: number; title: string; tagline: string };
  accent: string;
  at: Date;
}) {
  const t = useCountdown(at);
  return (
    <Section
      title="Premiere"
      accent={accent}
      note={at.toLocaleString(undefined, { weekday: "long", hour: "2-digit", minute: "2-digit" })}
    >
      <div className="border border-line bg-night2 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end">
          <div className="flex-1">
            <p className="font-fraunces text-[clamp(1.9rem,4vw,2.6rem)] font-semibold leading-tight">
              Season {season.n}: {season.title}
            </p>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-mist">{season.tagline}</p>
          </div>
          <div className="flex gap-2">
            {[
              [t.d, "days"],
              [t.h, "hrs"],
              [t.m, "min"],
              [t.s, "sec"],
            ].map(([v, l]) => (
              <div key={l as string} className="w-[68px] border border-line bg-night px-2 py-3 text-center">
                <p className="font-mono text-[26px] leading-none tabular-nums text-parchment">{String(v).padStart(2, "0")}</p>
                <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.12em] text-mist">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

export default function Home() {
  const app = useApp();
  const { skin } = useTheme();
  const next = nextEpisode(app.done);
  const votd = verseOfDay();
  const premiere = nextPremiere();
  const hero = next?.season ?? seasons[0];
  const lastMsg = app.messages.room?.[app.messages.room.length - 1];

  // The funding ask is quiet and permanent-until-dismissed: "Not now" means never again.
  const [lampAsked, setLampAsked] = useState(() => {
    try {
      return localStorage.getItem(LAMP_ASK_KEY) === "off";
    } catch {
      return false;
    }
  });
  const dismissLampAsk = () => {
    setLampAsked(true);
    try {
      localStorage.setItem(LAMP_ASK_KEY, "off");
    } catch {
      /* the card stays hidden for this visit */
    }
  };

  return (
    <div className="space-y-12">
      <InstallCard />

      {app.lastPlace && (
        <button
          onClick={() => app.openReader(app.lastPlace!)}
          className="flex w-full items-center justify-between gap-4 border border-line bg-night2 px-5 py-4 text-left transition-colors hover:border-gold"
        >
          <span>
            <span className="block font-mono text-[11px] text-gold">Pick up where you left off</span>
            <span className="mt-1 block font-fraunces text-[20px] font-semibold text-parchment">
              {bookById(app.lastPlace.bookId)?.name ?? app.lastPlace.bookId} {app.lastPlace.chapter}
            </span>
          </span>
          <ArrowRight className="h-4 w-4 text-gold" />
        </button>
      )}

      {/* Hero: the episode you are in the middle of */}
      <section>
        <div className="relative overflow-hidden border border-line bg-night3">
          {hero.poster && (
            <motion.img
              src={hero.poster}
              alt=""
              initial={{ scale: 1.08 }}
              animate={{ scale: 1 }}
              transition={{ duration: 2, ease: EASE }}
              className="h-[52vh] max-h-[560px] min-h-[340px] w-full object-cover object-center"
            />
          )}
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night3 via-night3/85 to-transparent" />

          <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
            <p className="font-mono text-[11px]" style={{ color: accentOf(hero, skin) }}>
              Season {hero.n} · Episode {next?.ep.n ?? hero.episodes.length} · {next?.ep.minutes ?? 5} min
            </p>
            <h1 className="mt-2 max-w-[16ch] font-fraunces text-[clamp(2rem,5.5vw,3.5rem)] font-semibold leading-[1.02] text-parchment">
              {next ? next.ep.title : "You are caught up for now"}
            </h1>
            <p className="mt-2 font-fraunces text-lg italic text-mist">{hero.title}</p>
            {next && (
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-parchment/80">
                {next.ep.synopsis}
              </p>
            )}
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {next && (
                <button
                  onClick={() => app.openReader({ bookId: next.ep.bookId, chapter: next.ep.chapter, episodeId: next.ep.id })}
                  className="bg-parchment px-6 py-3.5 text-[14px] font-medium text-night transition-colors hover:bg-gold"
                >
                  Read episode {next.ep.n}
                </button>
              )}
              <button onClick={() => app.go("seasons")} className="border border-parchment/30 px-6 py-3.5 text-[14px] text-parchment transition-colors hover:border-parchment">
                All episodes
              </button>
            </div>
          </div>
        </div>

        <div className="mt-2 h-[3px] w-full bg-night3">
          <motion.div className="h-full" style={{ background: accentOf(hero, skin) }} initial={{ width: 0 }} animate={{ width: `${seasonProgress(hero, app.done)}%` }} transition={{ duration: 1.2, ease: EASE }} />
        </div>
        <p className="mt-1.5 font-mono text-[11px] text-mist">
          {seasonProgress(hero, app.done)}% of Season {hero.n} read
        </p>
      </section>

      {/* Honest reminder */}
      {!app.readToday && (
        <div className="flex flex-col gap-4 border-l-4 border-gold bg-night2 p-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <p className="font-fraunces text-[22px] font-semibold leading-snug">
              {app.streak > 0 ? `Your ${app.streak}-day streak ends at midnight.` : "You have not opened your Bible today."}
            </p>
            <p className="mt-1 text-[15px] leading-relaxed text-mist">
              An episode takes about six minutes. That is less than one voice note.
            </p>
          </div>
          {next && (
            <button
              onClick={() => app.openReader({ bookId: next.ep.bookId, chapter: next.ep.chapter, episodeId: next.ep.id })}
              className="shrink-0 bg-parchment px-5 py-3 text-[13px] font-medium text-night hover:bg-gold"
            >
              Keep it alive
            </button>
          )}
        </div>
      )}

      {/* Seasons, laid out like a programme */}
      <Section title="Seasons" accent={accentOf(hero, skin)} note={`${seasons.length} in all`}>
        <div className="-mx-4 flex gap-5 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {seasons.map((s, i) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i, ease: EASE }}
              onClick={() => app.go("seasons")}
              className="group w-[168px] shrink-0 text-left sm:w-[196px]"
            >
              <div className="relative aspect-[2/3] overflow-hidden border border-line bg-night3">
                {s.poster ? (
                  <img src={s.poster} alt={s.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-night3">
                    <span className="font-fraunces text-[80px] font-semibold text-parchment/10">{s.n}</span>
                  </div>
                )}
                {/* The season's own colour, right across the top of its poster. */}
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accentOf(s, skin) }} />
                {s.status !== "live" && (
                  <span className="absolute left-0 top-0 bg-parchment px-2 py-1 font-mono text-[10px] text-night">
                    In production
                  </span>
                )}
              </div>
              <p className="mt-2 font-mono text-[11px]" style={{ color: accentOf(s, skin) }}>
                Season {s.n} · {s.episodes.length || "—"} episodes
              </p>
              <p className="font-fraunces text-[19px] font-semibold leading-tight">{s.title}</p>
              <p className="mt-1 line-clamp-2 text-[13px] leading-relaxed text-mist">{s.tagline}</p>
              {s.status === "live" && (
                <div className="mt-2 h-[3px] w-full bg-night3">
                  <div className="h-full" style={{ background: accentOf(s, skin), width: `${seasonProgress(s, app.done)}%` }} />
                </div>
              )}
            </motion.button>
          ))}
        </div>
      </Section>

      {/* Today */}
      <Section title="Today" note="One verse, one game, one question">
        <div className="grid gap-px bg-line md:grid-cols-2">
          {/* The verse of the day is the one solid colour block on Home: the
              red-letter accent, full bleed, no hairlines inside it. */}
          <button
            onClick={() => {
              const p = parseRef(votd.ref);
              if (p) app.openReader({ bookId: p.book.id, chapter: p.chapter, verse: p.verse });
            }}
            className="group bg-gold p-6 text-left transition-colors hover:bg-gold2"
          >
            <p className="font-mono text-[11px] text-night/85">Verse of the day</p>
            <p className="mt-3 font-fraunces text-[22px] leading-[1.5] text-night">“{votd.text}”</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="font-mono text-[11px] text-night/85">{votd.ref} · KJV</span>
              <a
                onClick={(e) => e.stopPropagation()}
                href={wa(`“${votd.text}” (${votd.ref})\n\nToday's verse.`)}
                target="_blank"
                rel="noreferrer"
                className="text-[13px] text-night underline decoration-night/50 underline-offset-4 hover:decoration-night"
              >
                Send to WhatsApp
              </a>
            </div>
          </button>

          <div className="bg-night2 p-6">
            <button onClick={() => app.go("play")} className="block w-full text-left">
              <p className="font-mono text-[11px] text-gold">Daily word</p>
              <p className="mt-3 font-fraunces text-[22px] font-semibold leading-snug">
                Guess today's five-letter Bible word
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-mist">
                A new one every day. Share your grid in your cell group and see who solves it first.
              </p>
              <span className="mt-4 inline-flex items-center gap-2 text-[13px] text-gold">
                Play now <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </button>

            <div className="mt-6 border-t border-line pt-5">
              <button onClick={() => app.go("read")} className="block w-full text-left">
                <p className="font-mono text-[11px] text-gold">Ask anything</p>
                <p className="mt-2 text-[15px] leading-relaxed text-mist">
                  Tap any verse and ask. Old words explain themselves. Every answer is kept in one list
                  you can take to your cell group.
                </p>
              </button>
            </div>
          </div>
        </div>
      </Section>

      {/* Premiere: only when a real date is scheduled */}
      {premiere && (
        <PremiereSection season={premiere.season} accent={accentOf(premiere.season, skin)} at={premiere.at} />
      )}

      {/* The Room */}
      <Section title="The Room" accent="var(--color-wa)" note="Opening soon">
        <button onClick={() => app.go("room")} className="block w-full border border-line bg-night2 p-6 text-left transition-colors hover:bg-night">
          {lastMsg ? (
            <>
              <p className="font-mono text-[11px] text-mist">You · {lastMsg.time}</p>
              <p className="mt-2 line-clamp-2 font-fraunces text-[19px] leading-relaxed">
                <TaggedText text={lastMsg.text} />
              </p>
            </>
          ) : (
            <p className="font-fraunces text-[19px] leading-relaxed text-mist">
              Live rooms are opening soon. Until then you can write here; what you post stays on this device.
            </p>
          )}
          <p className="mt-4 border-t border-line pt-3 font-mono text-[11px] text-gold">
            Type / to mention a book, a chapter or an episode
          </p>
        </button>
      </Section>

      {/* Pastor */}
      <Section title="For churches" accent="var(--color-sage)" note="Pastor Studio">
        <button
          onClick={() => app.go("studio")}
          className="flex w-full flex-col gap-4 border-l-4 border-gold bg-night2 p-6 text-left transition-colors hover:bg-night sm:flex-row sm:items-center"
        >
          <div className="flex-1">
            <p className="font-fraunces text-[24px] font-semibold leading-snug">
              Build Sunday's sermon in minutes
            </p>
            <p className="mt-1.5 max-w-2xl text-[15px] leading-relaxed text-mist">
              An outline, cross references, cell group questions and a Monday to Saturday reading plan,
              ready to publish to everyone in your church.
            </p>
          </div>
          <span className="shrink-0 border border-parchment px-5 py-3 text-[13px] text-parchment">
            Open Pastor Studio
          </span>
        </button>
      </Section>

      {/* My numbers */}
      <Section title="My progress" accent="var(--color-ember)">
        <div className="grid grid-cols-3 gap-px bg-line">
          {[
            { v: app.chaptersRead.length, l: `of ${TOTAL_CHAPTERS} chapters` },
            { v: app.done.length, l: "episodes finished" },
            { v: app.questions.length, l: "questions asked" },
          ].map((s) => (
            <button key={s.l} onClick={() => app.go("me")} className="bg-night2 p-5 text-left transition-colors hover:bg-night">
              <p className="font-mono text-[32px] leading-none tabular-nums text-gold">{s.v}</p>
              <p className="mt-2 font-mono text-[11px] text-mist">{s.l}</p>
            </button>
          ))}
        </div>
      </Section>

      {/* The lamp, at the very bottom: an invitation, never an interruption.
          "Not now" means never again (docs/03-FUNDING.md, principle 3). */}
      {!lampAsked && (
        <section className="border border-lamp/40 bg-night2 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-lamp/30 bg-lamp/10">
              <Lamp size={26} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] text-lamp">Keep the lamp lit</p>
              <p className="mt-1.5 font-fraunces text-[22px] font-semibold leading-snug text-parchment">
                Berean stays free. Gifts pay for the servers, the store fees and the time to write the next season.
              </p>
              <p className="mt-1.5 text-[15px] leading-relaxed text-mist">
                One person builds and looks after all of this. Nothing you give unlocks a feature — reading is free
                either way.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <button
                onClick={() => app.go("support")}
                className="border border-lamp px-5 py-3 text-[13px] text-lamp transition-colors hover:bg-lamp/10"
              >
                Support Berean
              </button>
              <button onClick={dismissLampAsk} className="px-3 py-3 text-[13px] text-mist hover:text-parchment">
                Not now
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
