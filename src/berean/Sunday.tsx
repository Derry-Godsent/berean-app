import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, Quote, Share2, Users } from "lucide-react";
import { sermon, passages } from "../data/berean";
import { Card, EASE, Label, Meter, Pill, SampleBanner } from "./ui";

export default function Sunday() {
  const [open, setOpen] = useState<string | null>(sermon.mainKey);
  const pct = Math.round((sermon.readThisWeek / sermon.congregation) * 100);

  return (
    <div className="flex flex-col gap-5">
      <SampleBanner what="This Sunday view" />
      <Card className="overflow-hidden p-6">
        <Label>/ Sunday → Monday</Label>
        <h2 className="mt-3 font-fraunces text-[28px] font-semibold leading-tight text-parchment">
          “{sermon.title}”
        </h2>
        <p className="mt-2 font-newsreader text-base italic text-mist">
          {sermon.preacher} · {sermon.church} · {sermon.date}
        </p>

        <div className="mt-5 rounded-xl border border-gold/25 bg-gold/[0.06] p-4">
          <div className="flex items-start gap-3">
            <Quote className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                Main text: {sermon.mainRef}
              </p>
              <p className="mt-1.5 font-newsreader text-[15px] leading-relaxed text-parchment">
                Every scripture the pastor mentioned this morning is already linked.
                Nobody has to ask “which chapter was that again?”
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <div className="mb-1.5 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em]">
            <span className="flex items-center gap-1.5 text-parchment">
              <Users className="h-3 w-3 text-gold" /> Read this week
            </span>
            <span className="text-gold">
              {sermon.readThisWeek}/{sermon.congregation} · {pct}%
            </span>
          </div>
          <Meter pct={pct} />
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-line/70 pt-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `*${sermon.title}* — ${sermon.preacher}, ${sermon.date}\n\nMain text: ${sermon.mainRef}\n\nHere are all the scriptures he mentioned, in order, so you can read them yourself this week:\n\n${sermon.scriptures
                .map((s, i) => `${i + 1}. ${s.ref}`)
                .join("\n")}\n\nJoin ${sermon.congregation} of us on Berean 📖`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-wa px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-night"
          >
            <Share2 className="h-3.5 w-3.5" /> Send thread to my cell group
          </a>
          <Pill tone="gold">
            <Share2 className="h-3 w-3" /> The pastor just became your marketer
          </Pill>
        </div>
      </Card>

      {/* Scriptures mentioned — the real hook */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <Label>/ Every scripture mentioned</Label>
          <span className="font-mono text-[10px] text-mist">
            {sermon.scriptures.length} passages
          </span>
        </div>

        <div className="flex flex-col gap-2.5">
          {sermon.scriptures.map((s, i) => {
            const isOpen = open === s.ref;
            const passage = s.key ? passages[s.key] : null;
            return (
              <Card key={s.ref} onClick={() => setOpen(isOpen ? null : s.ref)}>
                <div className="flex items-start gap-3.5 p-4">
                  <span className="mt-0.5 font-mono text-[11px] text-gold">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-fraunces text-lg font-semibold text-parchment">
                        {s.ref}
                      </span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-mist transition-transform duration-300 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                    <p className="mt-1 font-newsreader text-sm leading-relaxed text-mist">
                      {s.note}
                    </p>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="overflow-hidden"
                    >
                      <div className="mx-4 mb-4 rounded-xl border border-line/70 bg-night/60 p-4">
                        {passage ? (
                          <>
                            <p className="scripture text-parchment">
                              {passage.verses.map((v) => (
                                <span key={v.n}>
                                  <sup className="mr-1.5 font-mono text-[10px] text-gold/70">
                                    {v.n}
                                  </sup>
                                  {v.t}{" "}
                                </span>
                              ))}
                            </p>
                            <button className="mt-4 flex items-center gap-2 rounded-full border border-gold/40 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                              <BookOpen className="h-3.5 w-3.5" /> Continue in{" "}
                              {passage.book} {passage.chapter}
                            </button>
                            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                              KJV · Public domain
                            </p>
                          </>
                        ) : (
                          <div className="flex items-center justify-between gap-3">
                            <p className="font-newsreader text-sm text-mist">
                              Full chapter available in the reader.
                            </p>
                            <button className="flex shrink-0 items-center gap-2 rounded-full border border-gold/40 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                              <BookOpen className="h-3.5 w-3.5" /> Open chapter
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Week rhythm */}
      <Card className="p-6">
        <Label>/ The week, kept together</Label>
        <h3 className="mt-2 font-fraunces text-xl font-semibold text-parchment">
          Sunday service is the start, not the whole thing
        </h3>
        <div className="mt-5 flex flex-col gap-3">
          {[
            { d: "Sunday", t: "Hear it", x: "Sermon published → all scriptures linked automatically." },
            { d: "Monday", t: "Read it", x: "The main text opens in your plan. 6 minutes." },
            { d: "Wednesday", t: "Live it", x: "A single verse + one question, pushed to WhatsApp." },
            { d: "Thursday", t: "Discuss it", x: "Your cell group meets with the study guide already prepared." },
          ].map((r) => (
            <div
              key={r.d}
              className="flex gap-4 border-l border-line pl-4 transition-colors hover:border-gold"
            >
              <div className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">
                {r.d}
              </div>
              <div>
                <p className="font-fraunces text-base font-semibold text-parchment">
                  {r.t}
                </p>
                <p className="font-newsreader text-sm text-mist">{r.x}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
