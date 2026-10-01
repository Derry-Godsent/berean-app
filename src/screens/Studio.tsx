import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, BookOpen, Check, Copy, MessageCircle, Mic2, Quote, Save, Sparkles, Trash2, Wand2 } from "lucide-react";
import { useApp, wa } from "../app/store";
import { useProfile } from "../app/profile";
import { books, bookById, parseRef, topics } from "../data/bible";
import { newSermonId, saveSermon, useSermons, type Sermon } from "../app/sermons";
import Sunday from "../berean/Sunday";
import Church from "../berean/Church";
import { EASE } from "../berean/ui";

const savedWhen = (t: number) =>
  new Date(t).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

const kit: Record<string, { hook: string; apply: string[]; ask: string }> = {
  peace: { hook: "What kept you awake at 2am this month?", apply: ["Write down your top three worries and pray over each by name.", "Replace one scrolling session with reading Philippians 4."], ask: "What worry do you need to hand over this week?" },
  money: { hook: "If someone read your bank statement, what would they say you worship?", apply: ["Set aside a first-fruits gift before any other spending this month.", "Name one get-rich-quick temptation and walk away from it."], ask: "Is money serving you, or are you serving money?" },
  faith: { hook: "When was the last time you trusted God with something you couldn't control?", apply: ["Take one step of obedience you've been postponing.", "Pray Mark 9:24 honestly every morning."], ask: "Where is God asking you to trust Him before you see the outcome?" },
  prayer: { hook: "If your prayers were recorded this week, what would they sound like?", apply: ["Pray the Lord's Prayer slowly, one line per day.", "Keep a list of requests and record the answers."], ask: "What stops you from praying more?" },
  forgiveness: { hook: "Who is the one name you'd rather not hear today?", apply: ["Confess one specific sin to God and receive 1 John 1:9.", "Take one step toward someone you need to forgive."], ask: "What makes forgiving so hard, and what does the cross change?" },
  purpose: { hook: "If you disappeared tomorrow, what would be left undone?", apply: ["Write one sentence describing what God made you for.", "Serve someone this week in a way only you can."], ask: "Where do your gifts meet the world's needs?" },
  love: { hook: "Who in your life is hardest to love, and why?", apply: ["Read 1 Corinthians 13 replacing “charity” with your name.", "Do one unseen act of love this week."], ask: "What does God's love for you change about how you treat others?" },
  courage: { hook: "What would you do this week if you weren't afraid?", apply: ["Memorise Joshua 1:9.", "Do the one thing fear has been keeping you from."], ask: "What fear is God asking you to face with Him?" },
  temptation: { hook: "What do you reach for when you're tired, lonely or bored?", apply: ["Identify your “way of escape” before temptation arrives (1 Cor 10:13).", "Tell one trusted person about your struggle."], ask: "What guardrails do you need this week?" },
  suffering: { hook: "Where did you look for God during your hardest season?", apply: ["Write a lament to God. Honest, like the Psalms.", "Reach out to someone who is suffering right now."], ask: "How has God met you in pain before?" },
};

const audiences = ["Whole congregation", "Youth & students", "Workers & business people", "New believers"];

function Builder() {
  const app = useApp();
  const { profile } = useProfile();
  const { sermons, remove } = useSermons();
  const [title, setTitle] = useState("Peace For Anxious Days");
  const [topicId, setTopicId] = useState("peace");
  const [bookId, setBookId] = useState("PHP");
  const [chapter, setChapter] = useState(4);
  const [aud, setAud] = useState(audiences[0]);
  const [built, setBuilt] = useState(false);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<Sermon | null>(null);

  const topic = topics.find((t) => t.id === topicId)!;
  const k = kit[topicId];
  const book = bookById(bookId)!;
  const main = `${book.name} ${chapter}`;

  const outline = useMemo(() => {
    const refs = topic.refs.filter((r) => !r.startsWith(book.name + " " + chapter));
    return {
      big: topic.summary.split(". ")[0] + ".",
      points: [
        { h: `See it in the text`, d: `Walk through ${main} slowly. What does it say about God? What does it ask of us?`, refs: [main] },
        { h: `Hear it across Scripture`, d: `Show that this is not one verse but a thread through the whole Bible.`, refs: refs.slice(0, 3) },
        { h: `Live it this week`, d: k.apply[0], refs: refs.slice(3, 5) },
      ],
      plan: [main, ...refs].slice(0, 6),
    };
  }, [topic, book.name, chapter, main, k.apply]);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const asText = () =>
    [
      `*${title}*`,
      `Main text: ${main} · Theme: ${topic.name} · For: ${aud}`,
      ``,
      `BIG IDEA: ${outline.big}`,
      `OPENING: ${k.hook}`,
      ``,
      ...outline.points.map((p, i) => `${i + 1}. ${p.h}. ${p.d}${p.refs.length ? ` (${p.refs.join("; ")})` : ""}`),
      ``,
      `APPLY: ${k.apply.join(" / ")}`,
      `CELL GROUP: ${k.ask} · What stood out in ${main}? · What will you do differently this week?`,
      ``,
      `READING PLAN: ${outline.plan.map((r, i) => `${days[i] ?? ""} ${r}`).join(" · ")}`,
    ].join("\n");

  const build = () => {
    // The outline is assembled from the topic table and the real references in
    // data/bible.ts. There is no AI call and no fake "thinking" pause.
    setBuilt(true);
    setSaved(null);
    setCopied(false);
  };

  /** Save the outline to this device so Sunday → Monday can work from it. */
  const persist = () => {
    const now = Date.now();
    const existing = saved ?? sermons.find((s) => s.title === title.trim() && s.mainRef === main);
    const record: Sermon = {
      id: existing?.id ?? newSermonId(),
      title: title.trim() || "Untitled outline",
      topicId,
      topicName: topic.name,
      audience: aud,
      mainRef: main,
      bookId,
      book: book.name,
      chapter,
      big: outline.big,
      hook: k.hook,
      points: outline.points,
      apply: k.apply,
      ask: k.ask,
      plan: outline.plan,
      preacher: profile?.name ?? "",
      church: profile?.church ?? "",
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    saveSermon(record);
    setSaved(record);
  };

  const RefBtn = ({ r }: { r: string }) => (
    <button
      onClick={() => {
        const p = parseRef(r);
        if (p) app.openReader({ bookId: p.book.id, chapter: p.chapter, verse: p.verse });
      }}
      className="rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] text-gold hover:bg-gold/20"
    >
      {r}
    </button>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      <div className="h-fit space-y-4 rounded-3xl border border-line/80 bg-night2/60 p-5 lg:sticky lg:top-24">
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">Sermon title</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-night px-3.5 py-3 font-newsreader text-[16px] focus:border-gold/50 focus:outline-none" />
        </label>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">Theme</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {topics.map((t) => (
              <button key={t.id} onClick={() => setTopicId(t.id)} className={`rounded-full px-3 py-1.5 font-newsreader text-sm ${topicId === t.id ? "bg-gold text-night" : "border border-line text-mist hover:text-parchment"}`}>
                {t.name}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-[1fr_90px] gap-2">
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">Main book</span>
            <select value={bookId} onChange={(e) => { setBookId(e.target.value); setChapter(1); }} className="mt-1.5 w-full rounded-xl border border-line bg-night px-3 py-3 font-newsreader text-[16px] focus:border-gold/50 focus:outline-none">
              {books.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">Chapter</span>
            <select value={chapter} onChange={(e) => setChapter(Number(e.target.value))} className="mt-1.5 w-full rounded-xl border border-line bg-night px-3 py-3 font-newsreader text-[16px] focus:border-gold/50 focus:outline-none">
              {Array.from({ length: book.chapters }, (_, i) => i + 1).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">Audience</span>
          <select value={aud} onChange={(e) => setAud(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-night px-3 py-3 font-newsreader text-[16px] focus:border-gold/50 focus:outline-none">
            {audiences.map((a) => (
              <option key={a}>{a}</option>
            ))}
          </select>
        </label>
        <button onClick={build} className="flex w-full items-center justify-center gap-2 rounded-xl bg-gold px-5 py-4 font-fraunces text-lg font-semibold text-night">
          <Wand2 className="h-5 w-5" /> Build my outline
        </button>
        <p className="font-mono text-[9px] uppercase leading-relaxed tracking-[0.15em] text-mist">
          A starting scaffold, not a finished sermon. Every reference is real; the message is yours. Pray, study, and make it personal.
        </p>
      </div>

      <div>
        {!built && (
          <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-line p-8 text-center">
            <Mic2 className="h-10 w-10 text-gold" />
            <p className="mt-4 font-fraunces text-2xl font-semibold">Saturday night, 11pm, no outline?</p>
            <p className="mt-2 max-w-md font-newsreader text-[16px] text-mist">
              Pick a theme and a passage. Get a structured outline, cross-references, an opening hook, applications, cell-group questions and a week-long reading plan for your members.
            </p>
          </div>
        )}
        <AnimatePresence>
          {built && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} className="space-y-4">
              <div className="border border-gold/40 bg-night2 p-6">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">{topic.name} · {aud}</p>
                <h2 className="mt-1 font-fraunces text-3xl font-semibold">{title}</h2>
                <p className="mt-1 flex items-center gap-2 font-newsreader text-[15px] text-mist">Main text: <RefBtn r={main} /></p>
                <div className="mt-5 rounded-2xl border border-line/70 bg-night/50 p-4">
                  <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">Big idea</p>
                  <p className="mt-1 font-fraunces text-xl italic">{outline.big}</p>
                </div>
                <div className="mt-3 flex gap-3 rounded-2xl border border-line/70 bg-night/50 p-4">
                  <Quote className="h-4 w-4 shrink-0 text-gold" />
                  <div>
                    <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">Opening hook</p>
                    <p className="mt-1 font-newsreader text-[16px]">{k.hook}</p>
                  </div>
                </div>
              </div>

              {outline.points.map((p, i) => (
                <div key={p.h} className="flex gap-4 rounded-2xl border border-line/80 bg-night2/60 p-5">
                  <span className="font-fraunces text-4xl font-semibold text-gold/70">{i + 1}</span>
                  <div>
                    <p className="font-fraunces text-xl font-semibold">{p.h}</p>
                    <p className="mt-1 font-newsreader text-[16px] text-mist">{p.d}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {p.refs.map((r) => (
                        <RefBtn key={r} r={r} />
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-sage/30 bg-sage/[0.06] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sage">Apply this week</p>
                  <ul className="mt-2 space-y-2">
                    {k.apply.map((a) => (
                      <li key={a} className="flex gap-2 font-newsreader text-[15px]"><Check className="mt-1 h-3.5 w-3.5 shrink-0 text-sage" /> {a}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl border border-line/80 bg-night2/60 p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Cell group questions</p>
                  <ol className="mt-2 list-decimal space-y-1.5 pl-4 font-newsreader text-[15px]">
                    <li>{k.ask}</li>
                    <li>What stood out to you in {main}?</li>
                    <li>What will you do differently this week?</li>
                  </ol>
                </div>
              </div>

              <div className="rounded-2xl border border-line/80 bg-night2/60 p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Monday–Saturday reading plan for members</p>
                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {outline.plan.map((r, i) => (
                    <div key={r + i} className="flex items-center gap-2 rounded-xl border border-line/70 px-3 py-2">
                      <span className="w-8 font-mono text-[10px] uppercase text-mist">{days[i]}</span>
                      <RefBtn r={r} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={persist}
                  className={`flex items-center gap-2 rounded-full px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] ${saved ? "bg-sage text-night" : "bg-gold text-night"}`}
                >
                  {saved ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                  {saved ? "Saved on this device" : "Save outline"}
                </button>
                <a href={wa(asText())} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-wa px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-night">
                  <MessageCircle className="h-4 w-4" /> Send outline
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(asText()).catch(() => undefined);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="flex items-center gap-2 rounded-full border border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em]"
                >
                  {copied ? <Check className="h-4 w-4 text-sage" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy"}
                </button>
              </div>
              <p className="font-newsreader text-[13px] leading-relaxed text-mist">
                Nothing is sent from here by itself. Publishing to your congregation — and seeing who read it — needs
                accounts, which are the next milestone (<span className="text-parchment">docs/03-FUNDING.md</span> step 2).
                Until then the outline saves on this device and leaves it only when you send it.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The pastor's own outlines, as saved on this device. */}
        {sermons.length > 0 && (
          <div className="mt-6 rounded-2xl border border-line/80 bg-night2/60 p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
              Saved on this device · {sermons.length}
            </p>
            <div className="mt-3 flex flex-col divide-y divide-line/60">
              {sermons.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-fraunces text-[17px] font-semibold text-parchment">{s.title}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
                      {s.mainRef} · {s.topicName} · saved {savedWhen(s.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(s.id)}
                    aria-label={`Delete ${s.title}`}
                    className="rounded-full border border-line p-2 text-mist transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function Studio() {
  const [tab, setTab] = useState<"build" | "sunday" | "church">("build");
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Pastor Studio</p>
      <h1 className="mt-2 font-fraunces text-[clamp(2.2rem,6vw,3.4rem)] font-semibold leading-none">From study desk to Monday morning.</h1>
      <div className="mt-6 flex flex-wrap gap-2">
        {[
          { id: "build" as const, label: "Sermon builder", Icon: Sparkles },
          { id: "sunday" as const, label: "Sunday → Monday", Icon: BookOpen },
          { id: "church" as const, label: "Church insights", Icon: BarChart3 },
        ].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] ${tab === id ? "bg-gold text-night" : "border border-line text-mist hover:text-parchment"}`}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>
      <div className="mt-8">
        {tab === "build" && <Builder />}
        {tab === "sunday" && (
          <div className="mx-auto max-w-[620px]">
            <Sunday onBuild={() => setTab("build")} />
          </div>
        )}
        {tab === "church" && <div className="mx-auto max-w-[760px]"><Church /></div>}
      </div>
    </div>
  );
}
