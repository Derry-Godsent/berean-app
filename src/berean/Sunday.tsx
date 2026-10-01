import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, ChevronDown, Quote, Share2, Sparkles } from "lucide-react";
import { useApp } from "../app/store";
import { useProfile } from "../app/profile";
import { bookById, parseRef } from "../data/bible";
import { bundledFallback } from "../app/library";
import { sermonRefs, useSermons } from "../app/sermons";
import { siteUrl } from "../app/site";
import { Card, EASE, Label } from "./ui";

const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const savedWhen = (t: number) =>
  new Date(t).toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" });

/**
 * Sunday → Monday.
 *
 * This view is built from the outline the pastor actually saved, and from the
 * real KJV text bundled in the app (`src/data/berean.ts`). Where a reference has
 * no bundled text, the card says so and opens the reader, which fetches the
 * chapter — it never shows invented verses. There are no congregation numbers
 * here: nothing in the app can see other people's devices yet.
 */
export default function Sunday({ onBuild }: { onBuild: () => void }) {
  const app = useApp();
  const { profile } = useProfile();
  const { sermons } = useSermons();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const sermon = useMemo(
    () => sermons.find((s) => s.id === (activeId ?? sermons[0]?.id)) ?? null,
    [sermons, activeId]
  );

  const refs = useMemo(() => (sermon ? sermonRefs(sermon) : []), [sermon]);

  const preachedBy = sermon?.preacher || profile?.name || "";
  const church = sermon?.church || profile?.church || "";

  // Real: how much this device has read in the last seven days.
  const readThisWeek = useMemo(() => {
    const since = Date.now() - 7 * 86400000;
    return app.readDates.filter((d) => {
      const t = new Date(`${d}T12:00:00`).getTime();
      return Number.isFinite(t) && t >= since;
    }).length;
  }, [app.readDates]);

  if (!sermon) {
    return (
      <div className="flex flex-col gap-5">
        <Card className="p-8 text-center">
          <Sparkles className="mx-auto h-8 w-8 text-gold" />
          <h2 className="mt-4 font-fraunces text-2xl font-semibold text-parchment">No outline saved yet</h2>
          <p className="mx-auto mt-2 max-w-md font-newsreader text-[16px] leading-relaxed text-mist">
            This view turns the sermon you preached into the week that follows: every scripture you mentioned, linked
            and readable, and a Monday–Saturday plan for your members. Build an outline first and save it.
          </p>
          <button
            onClick={onBuild}
            className="mt-5 rounded-full bg-gold px-6 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-night"
          >
            Open the sermon builder
          </button>
        </Card>

        <Card className="p-6">
          <Label>/ What this view will do, once accounts exist</Label>
          <div className="mt-5 flex flex-col gap-3">
            {[
              { d: "Sunday", t: "Hear it", x: "Sermon published → every scripture linked automatically." },
              { d: "Monday", t: "Read it", x: "The main text opens in your members' plan. Six minutes." },
              { d: "Wednesday", t: "Live it", x: "One verse and one question, sent to the congregation." },
              { d: "Thursday", t: "Discuss it", x: "Cell groups meet with the study guide already prepared." },
            ].map((r) => (
              <div key={r.d} className="flex gap-4 border-l border-line pl-4">
                <div className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">{r.d}</div>
                <div>
                  <p className="font-fraunces text-base font-semibold text-parchment">{r.t}</p>
                  <p className="font-newsreader text-sm text-mist">{r.x}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-5 border-t border-line/60 pt-4 font-newsreader text-sm italic text-mist">
            Today, only the first step is real: your outline is yours, with every reference linked to the actual text.
            Publishing and member numbers arrive with accounts (milestone 2).
          </p>
        </Card>
      </div>
    );
  }

  const shareText = [
    `*${sermon.title}*${preachedBy ? ` — ${preachedBy}` : ""}${church ? `, ${church}` : ""}`,
    `Main text: ${sermon.mainRef}`,
    "",
    "Every scripture mentioned, so you can read them yourself this week:",
    ...refs.map((r, i) => `${i + 1}. ${r}`),
    "",
    `Read along on Berean: ${siteUrl()}`,
  ].join("\n");

  return (
    <div className="flex flex-col gap-5">
      {sermons.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {sermons.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveId(s.id);
                setOpen(null);
              }}
              className={`rounded-full px-3 py-1.5 font-newsreader text-sm ${
                s.id === sermon.id ? "bg-gold text-night" : "border border-line text-mist hover:text-parchment"
              }`}
            >
              {s.title}
            </button>
          ))}
        </div>
      )}

      <Card className="overflow-hidden p-6">
        <Label>/ Sunday → Monday</Label>
        <h2 className="mt-3 font-fraunces text-[28px] font-semibold leading-tight text-parchment">
          “{sermon.title}”
        </h2>
        <p className="mt-2 font-newsreader text-base italic text-mist">
          {[preachedBy, church, savedWhen(sermon.updatedAt)].filter(Boolean).join(" · ")}
        </p>

        <div className="mt-5 rounded-xl border border-gold/25 bg-gold/[0.06] p-4">
          <div className="flex items-start gap-3">
            <Quote className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">
                Main text: {sermon.mainRef}
              </p>
              <p className="mt-1.5 font-newsreader text-[15px] leading-relaxed text-parchment">
                Your outline for this passage is saved on this device, with the big idea, the hook and the applications
                your cell groups will discuss.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-line/70 bg-night/50 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">Your reading this week</p>
            <p className="mt-1 font-fraunces text-2xl font-semibold text-parchment">
              {readThisWeek} {readThisWeek === 1 ? "day" : "days"}
            </p>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
              counted on this device · {app.streak}-day streak
            </p>
          </div>
          <div className="rounded-xl border border-line/70 bg-night/50 p-4">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">The points you will preach</p>
            <ol className="mt-1.5 space-y-1 font-newsreader text-[15px] text-parchment">
              {sermon.points.map((p) => (
                <li key={p.h}>· {p.h}</li>
              ))}
            </ol>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-line/70 pt-4">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-full bg-wa px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-night"
          >
            <Share2 className="h-3.5 w-3.5" /> Send the thread to my cell group
          </a>
        </div>
      </Card>

      {/* Every scripture mentioned — real references, real text where bundled */}
      <div>
        <div className="mb-3 flex items-center justify-between px-1">
          <Label>/ Every scripture mentioned</Label>
          <span className="font-mono text-[10px] text-mist">{refs.length} passages</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {refs.map((ref, i) => {
            const isOpen = open === ref;
            const parsed = parseRef(ref);
            const bundled = parsed ? bundledFallback("kjv", parsed.book.id, parsed.chapter) : undefined;
            return (
              <Card key={ref} onClick={() => setOpen(isOpen ? null : ref)}>
                <div className="flex items-start gap-3.5 p-4">
                  <span className="mt-0.5 font-mono text-[11px] text-gold">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-fraunces text-lg font-semibold text-parchment">{ref}</span>
                      <ChevronDown
                        className={`h-4 w-4 shrink-0 text-mist transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      />
                    </div>
                    <p className="mt-1 font-newsreader text-sm leading-relaxed text-mist">
                      {bundled
                        ? `KJV · ${bundled.length} verses bundled in the app, so it opens offline.`
                        : "Opens in the reader, which loads the chapter in KJV and keeps it offline after that."}
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
                        {bundled && (
                          <>
                            <p className="scripture text-parchment">
                              {bundled.map((v) => (
                                <span key={v.n}>
                                  <sup className="mr-1.5 font-mono text-[10px] text-gold/70">{v.n}</sup>
                                  {v.t}{" "}
                                </span>
                              ))}
                            </p>
                            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                              KJV · Public domain
                            </p>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (parsed) {
                              app.openReader({ bookId: parsed.book.id, chapter: parsed.chapter, verse: parsed.verse });
                            }
                          }}
                          className={`${bundled ? "mt-4" : ""} flex items-center gap-2 rounded-full border border-gold/40 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-gold`}
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          {parsed ? `Continue in ${parsed.book.name} ${parsed.chapter}` : "Open in the reader"}
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Monday to Saturday, from the plan in the outline */}
      <Card className="p-6">
        <Label>/ Monday to Saturday, from your outline</Label>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {sermon.plan.map((r, i) => {
            const parsed = parseRef(r);
            return (
              <button
                key={`${r}-${i}`}
                onClick={() => {
                  if (parsed) app.openReader({ bookId: parsed.book.id, chapter: parsed.chapter });
                }}
                className="flex items-center gap-2 rounded-xl border border-line/70 px-3 py-2 text-left transition-colors hover:border-gold/40"
              >
                <span className="w-8 font-mono text-[10px] uppercase text-mist">{dayNames[i] ?? ""}</span>
                <span className="font-newsreader text-[15px] text-parchment">{r}</span>
              </button>
            );
          })}
        </div>
        <p className="mt-5 border-t border-line/60 pt-4 font-newsreader text-sm italic text-mist">
          Each reading opens in the reader with the real text. A member's streak and progress show only on their own
          device until accounts exist — {bookById(sermon.bookId)?.name ?? sermon.book} {sermon.chapter} is where the week
          starts.
        </p>
      </Card>

      <Card className="p-6">
        <Label>/ The week, kept together</Label>
        <h3 className="mt-2 font-fraunces text-xl font-semibold text-parchment">
          Sunday service is the start, not the whole thing
        </h3>
        <div className="mt-5 flex flex-col gap-3">
          {[
            { d: "Sunday", t: "Hear it", x: "The sermon is preached and its scriptures are in one thread." },
            { d: "Monday", t: "Read it", x: "The main text opens in the plan. Six minutes." },
            { d: "Wednesday", t: "Live it", x: "One verse and one question, shared with the congregation." },
            { d: "Thursday", t: "Discuss it", x: "Cell groups meet with the study guide already prepared." },
          ].map((r) => (
            <div key={r.d} className="flex gap-4 border-l border-line pl-4">
              <div className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-gold">{r.d}</div>
              <div>
                <p className="font-fraunces text-base font-semibold text-parchment">{r.t}</p>
                <p className="font-newsreader text-sm text-mist">{r.x}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-5 border-t border-line/60 pt-4 font-newsreader text-sm italic text-mist">
          The Sunday half is real today. The rest — publishing, reminders and member progress — needs accounts
          (milestone 2), and nothing here pretends otherwise.
        </p>
      </Card>
    </div>
  );
}
