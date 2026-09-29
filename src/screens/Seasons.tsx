import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Lock, MessageCircle, Play } from "lucide-react";
import { useApp, wa } from "../app/store";
import { seasonProgress, useCountdown } from "../app/helpers";
import { accentOf, seasons, type Season } from "../data/seasons";
import { useTheme } from "../app/theme";
import { EASE } from "../berean/ui";

function Detail({ s, onBack }: { s: Season; onBack: () => void }) {
  const app = useApp();
  const { skin } = useTheme();
  const accent = accentOf(s, skin);
  const at = s.premiereAt ? new Date(s.premiereAt) : null;
  const t = useCountdown(at);
  const pct = seasonProgress(s, app.done);
  const next = s.episodes.find((e) => !app.done.includes(e.id));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <section className="relative -mx-4 overflow-hidden sm:mx-0 sm:rounded-[28px]">
        {s.poster ? (
          <img src={s.poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-night via-night/70 to-night/20" />
        <div className="relative px-5 pb-8 pt-6 sm:px-10">
          <button onClick={onBack} className="mb-24 flex items-center gap-2 rounded-full border border-parchment/20 bg-night/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] backdrop-blur-md">
            <ArrowLeft className="h-3 w-3" /> All seasons
          </button>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em]" style={{ color: accent }}>Season {s.n} · {s.genre}</p>
          <h1 className="mt-2 font-fraunces text-[clamp(2.4rem,7vw,4.2rem)] font-semibold leading-none">{s.title}</h1>
          <p className="mt-3 max-w-xl font-fraunces text-lg italic text-parchment/80">{s.tagline}</p>

          {s.status === "live" && (
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {next && (
                <button onClick={() => app.openReader({ bookId: next.bookId, chapter: next.chapter, episodeId: next.id })} className="flex items-center gap-2 rounded-full bg-parchment px-6 py-3.5 font-fraunces font-semibold text-night">
                  <Play className="h-4 w-4 fill-night" /> {pct > 0 ? `Continue E${next.n}` : "Start Episode 1"}
                </button>
              )}
              <a href={wa(`I'm reading Season ${s.n} “${s.title}” on Berean — ${s.tagline}\n\nI'm ${pct}% through. Catch up with me? 👀`)} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-wa px-5 py-3.5 font-mono text-[10px] uppercase tracking-[0.18em] text-night">
                <MessageCircle className="h-4 w-4" /> Challenge a friend
              </a>
              <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>{pct}% complete</span>
            </div>
          )}

          {s.status === "soon" && at && at.getTime() > Date.now() && (
            <div className="mt-6 grid max-w-md grid-cols-4 gap-2">
              {[
                [t.d, "days"],
                [t.h, "hrs"],
                [t.m, "min"],
                [t.s, "sec"],
              ].map(([v, l]) => (
                <div key={l as string} className="rounded-xl border border-ember/40 bg-night/60 py-3 text-center backdrop-blur-md">
                  <p className="font-fraunces text-3xl font-semibold tabular-nums">{String(v).padStart(2, "0")}</p>
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">{l}</p>
                </div>
              ))}
            </div>
          )}

          {s.status === "soon" && <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.2em] text-parchment/70">In production · Not yet released</p>}
        </div>
      </section>

      {s.episodes.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 font-fraunces text-2xl font-semibold">Episodes</h2>
          <div className="space-y-3">
            {s.episodes.map((e, i) => {
              const isDone = app.done.includes(e.id);
              const locked = s.status !== "live";
              const isNext = next?.id === e.id;
              return (
                <motion.button
                  key={e.id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, ease: EASE }}
                  disabled={locked}
                  onClick={() => app.openReader({ bookId: e.bookId, chapter: e.chapter, episodeId: e.id })}
                  className={`group flex w-full items-start gap-4 rounded-2xl border p-4 text-left transition-colors sm:p-5 ${
                    isNext ? "bg-night3/60" : "border-line/80 bg-night2/60 hover:border-gold/30"
                  } ${locked ? "cursor-not-allowed opacity-60" : ""}`}
                  style={isNext ? { borderColor: accent } : undefined}
                >
                  <span className="w-8 shrink-0 pt-1 font-fraunces text-3xl font-semibold text-mist/60">{e.n}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-fraunces text-xl font-semibold">{e.title}</p>
                      {isNext && (
                        <span className="rounded border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider" style={{ borderColor: accent, color: accent }}>
                          Up next
                        </span>
                      )}
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
                      {e.book} {e.chapter} · {e.minutes} min
                    </p>
                    <p className="mt-2 font-newsreader text-[15px] leading-relaxed text-mist">{locked ? "Unlocks at the premiere." : e.synopsis}</p>
                  </div>
                  <span className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${isDone ? "border-sage/50 bg-sage/15 text-sage" : "border-line text-parchment group-hover:border-gold group-hover:bg-gold group-hover:text-night"}`}>
                    {locked ? <Lock className="h-4 w-4" /> : isDone ? <Check className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </span>
                </motion.button>
              );
            })}
          </div>
        </section>
      )}
    </motion.div>
  );
}

export default function Seasons() {
  const app = useApp();
  const { skin } = useTheme();
  const [open, setOpen] = useState<string | null>(null);
  const s = seasons.find((x) => x.id === open);

  return (
    <AnimatePresence mode="wait">
      {s ? (
        <Detail key={s.id} s={s} onBack={() => setOpen(null)} />
      ) : (
        <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Berean originals</p>
          <h1 className="mt-2 font-fraunces text-[clamp(2.2rem,6vw,3.6rem)] font-semibold leading-none">The Bible, in seasons.</h1>
          <p className="mt-3 max-w-xl font-newsreader text-[17px] text-mist">
            Every episode is a real chapter of Scripture, 4–10 minutes long, ending on a cliffhanger. Binge it. Talk about it. Wait for the next premiere with everyone else.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {seasons.map((x, i) => (
              <motion.button
                key={x.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, ease: EASE }}
                whileHover={{ y: -6 }}
                onClick={() => setOpen(x.id)}
                className="group relative aspect-[2/3] overflow-hidden rounded-3xl border border-line/80 text-left"
              >
                {x.poster ? (
                  <img src={x.poster} alt={x.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                ) : (
                  <div className={`absolute inset-0 bg-gradient-to-b ${x.gradient}`}>
                    <div className="absolute inset-0 flex items-center justify-center font-fraunces text-[120px] font-semibold text-parchment/[0.06]">{x.n}</div>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-night via-night/20 to-transparent" />
                {/* The season's own colour, right across the top of its poster. */}
                <span aria-hidden className="absolute inset-x-0 top-0 h-[3px]" style={{ background: accentOf(x, skin) }} />
                <div className="absolute left-4 top-4">
                  {x.status === "soon" && <span className="rounded border border-parchment/30 bg-night/60 px-2 py-1 font-mono text-[9px] uppercase tracking-wider">Coming soon</span>}
                  {x.status === "live" && seasonProgress(x, app.done) === 100 && <span className="rounded bg-sage px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-night">Completed</span>}
                </div>
                <div className="absolute inset-x-4 bottom-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em]" style={{ color: accentOf(x, skin) }}>
                    Season {x.n} · {x.episodes.length || "?"} episodes
                  </p>
                  <p className="font-fraunces text-2xl font-semibold leading-tight">{x.title}</p>
                  <p className="mt-1 line-clamp-2 font-newsreader text-sm text-parchment/70">{x.tagline}</p>
                  {x.status === "live" && (
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-parchment/20">
                      <div className="h-full" style={{ background: accentOf(x, skin), width: `${seasonProgress(x, app.done)}%` }} />
                    </div>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
