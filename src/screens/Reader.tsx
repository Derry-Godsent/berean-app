import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Info,
  Loader2,
  MessageCircle,
  MessagesSquare,
  Minus,
  Moon,
  Play,
  Plus,
  Send,
  Share2,
  Sparkles,
  Sun,
  WifiOff,
  X,
} from "lucide-react";
import { useApp, wa } from "../app/store";
import { fetchChapter, type ChapterVerse } from "../app/bibleApi";
import { ask, suggestionsFor, type Answer } from "../app/ask";
import { books, bookById, glossary, glossaryRegex, parseRef } from "../data/bible";
import { episodeById, seasons } from "../data/seasons";
import { EASE } from "../berean/ui";

const QUIET = new Set(["thee", "thou", "thy", "thine", "ye", "unto", "hath", "doth", "lo"]);
const HL: Record<string, string> = {
  gold: "bg-gold/15 text-parchment",
  sage: "bg-sage/15 text-parchment",
  ember: "bg-ember/15 text-parchment",
};
const HL_PAPER: Record<string, string> = {
  gold: "bg-[#f1d58c]/70",
  sage: "bg-[#bcd8c3]/80",
  ember: "bg-[#f3c1ad]/80",
};

/* ---------------------------------------------------------------- */

function BookPicker({ onPick, onClose }: { onPick: (id: string, ch: number) => void; onClose: () => void }) {
  const [tab, setTab] = useState<"OT" | "NT">("NT");
  const [book, setBook] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const b = book ? bookById(book) : null;
  const list = books.filter((x) => x.testament === tab && x.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ duration: 0.35, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85svh] w-full max-w-2xl overflow-hidden rounded-t-3xl border border-line bg-night2 sm:rounded-3xl"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          {b ? (
            <button onClick={() => setBook(null)} className="flex items-center gap-2 font-fraunces text-lg font-semibold text-parchment">
              <ChevronLeft className="h-4 w-4 text-gold" /> {b.name}
            </button>
          ) : (
            <p className="font-fraunces text-lg font-semibold text-parchment">Choose a book</p>
          )}
          <button onClick={onClose} className="rounded-full border border-line p-2 text-mist hover:text-parchment" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[70svh] overflow-y-auto p-5">
          {!b ? (
            <>
              <div className="mb-4 flex gap-2">
                {(["OT", "NT"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={`rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] ${
                      tab === t ? "bg-gold text-night" : "border border-line text-mist"
                    }`}
                  >
                    {t === "OT" ? "Old Testament · 39" : "New Testament · 27"}
                  </button>
                ))}
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search…"
                  className="ml-auto w-28 rounded-full border border-line bg-night px-3 text-sm text-parchment placeholder:text-mist/60 focus:border-gold/50 focus:outline-none sm:w-40"
                />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {list.map((x) => (
                  <button
                    key={x.id}
                    onClick={() => (x.chapters === 1 ? onPick(x.id, 1) : setBook(x.id))}
                    className="rounded-xl border border-line/80 px-3 py-2.5 text-left transition-colors hover:border-gold/50 hover:bg-gold/5"
                  >
                    <p className="font-newsreader text-[15px] text-parchment">{x.name}</p>
                    <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-mist">
                      {x.genre} · {x.chapters}
                    </p>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <p className="mb-4 font-newsreader text-sm italic text-mist">{b.about}</p>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
                {Array.from({ length: b.chapters }, (_, i) => i + 1).map((c) => (
                  <button
                    key={c}
                    onClick={() => onPick(b.id, c)}
                    className="aspect-square rounded-lg border border-line/80 font-mono text-xs text-parchment transition-colors hover:border-gold hover:bg-gold hover:text-night"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */

interface Turn {
  q: string;
  a?: Answer;
  shown?: string;
}

function AskSheet({
  onClose,
  bookId,
  chapter,
  verse,
  verseText,
  suggestions,
  seed,
}: {
  onClose: () => void;
  bookId: string;
  chapter: number;
  verse?: number;
  verseText?: string;
  suggestions: string[];
  seed?: string;
}) {
  const { addQuestion, openReader, openRoom, go } = useApp();
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const book = bookById(bookId)!;
  const ref = `${book.name} ${chapter}${verse ? `:${verse}` : ""}`;
  const seeded = useRef(false);

  const submit = async (question: string) => {
    if (!question.trim() || busy) return;
    setInput("");
    setBusy(true);
    const idx = turns.length;
    setTurns((t) => [...t, { q: question }]);
    const answer = await ask(question, { bookId, chapter, verse, verseText });
    await new Promise((r) => setTimeout(r, 350));
    setTurns((t) => t.map((x, i) => (i === idx ? { ...x, a: answer, shown: "" } : x)));
    // typewriter
    const words = answer.text.split(/(\s+)/);
    let acc = "";
    for (let i = 0; i < words.length; i++) {
      acc += words[i];
      if (i % 3 === 0 || i === words.length - 1) {
        const snapshot = acc;
        setTurns((t) => t.map((x, j) => (j === idx ? { ...x, shown: snapshot } : x)));
        await new Promise((r) => setTimeout(r, 16));
      }
    }
    addQuestion({ q: question, a: answer.text, ref });
    setBusy(false);
  };

  useEffect(() => {
    if (seed && !seeded.current) {
      seeded.current = true;
      submit(seed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [turns]);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit(input);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[70] flex justify-end bg-black/50 backdrop-blur-[2px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.aside
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.4, ease: EASE }}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-md flex-col border-l border-line bg-night2"
      >
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div>
            <p className="flex items-center gap-2 font-fraunces text-lg font-semibold text-parchment">
              <Sparkles className="h-4 w-4 text-gold" /> Ask about {ref}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist">
              Instant answers · saved to your questions
            </p>
          </div>
          <button onClick={onClose} className="rounded-full border border-line p-2 text-mist hover:text-parchment" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        {verseText && (
          <div className="mx-5 mt-4 rounded-xl border border-gold/25 bg-gold/[0.06] p-3.5">
            <p className="font-newsreader text-[15px] italic leading-relaxed text-parchment">“{verseText}”</p>
          </div>
        )}

        <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {turns.length === 0 && (
            <div>
              <p className="mb-3 font-newsreader text-[15px] text-mist">
                Curious about something? Ask anything: a word, a person, why it matters.
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="rounded-full border border-line px-3 py-1.5 text-left font-newsreader text-sm text-parchment transition-colors hover:border-gold/50 hover:text-gold"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {turns.map((t, i) => (
            <div key={i} className="space-y-2.5">
              <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-gold px-4 py-2.5 font-newsreader text-[15px] text-night">
                {t.q}
              </div>
              <div className="max-w-[92%] rounded-2xl rounded-bl-md border border-line bg-night/70 px-4 py-3">
                {!t.a ? (
                  <span className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-gold" /> Searching the scriptures…
                  </span>
                ) : (
                  <>
                    <p className="whitespace-pre-line font-newsreader text-[15px] leading-relaxed text-parchment">{t.shown}</p>
                    {t.shown === t.a.text && (
                      <>
                        {t.a.refs.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {t.a.refs.map((r) => {
                              const p = parseRef(r);
                              return (
                                <button
                                  key={r}
                                  onClick={() => p && (onClose(), openReader({ bookId: p.book.id, chapter: p.chapter, verse: p.verse }))}
                                  className="rounded-md border border-gold/40 bg-gold/10 px-2 py-0.5 font-mono text-[10px] text-gold hover:bg-gold/20"
                                >
                                  {r}
                                </button>
                              );
                            })}
                          </div>
                        )}
                        {t.a.kind === "unsure" && (
                          <button
                            onClick={() => {
                              onClose();
                              openRoom("questions", `/${ref} ${t.q}`);
                            }}
                            className="mt-3 flex items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-gold"
                          >
                            <MessagesSquare className="h-3 w-3" /> Ask the Room
                          </button>
                        )}
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-line p-4">
          <form onSubmit={onSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this passage…"
              className="min-w-0 flex-1 rounded-full border border-line bg-night px-4 py-3 font-newsreader text-[15px] text-parchment placeholder:text-mist/60 focus:border-gold/50 focus:outline-none"
            />
            <button type="submit" disabled={busy} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-night disabled:opacity-50" aria-label="Ask">
              <Send className="h-4 w-4" />
            </button>
          </form>
          <button onClick={() => (onClose(), go("me"))} className="mt-3 w-full text-center font-mono text-[9px] uppercase tracking-[0.18em] text-mist hover:text-gold">
            Study aid, not Scripture · Compare with your Bible · View all my questions →
          </button>
        </div>
      </motion.aside>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- */

export default function Reader() {
  const app = useApp();
  const { reader, translation, fontScale, paper, highlights, openReader, markChapter, completeEpisode, done, chaptersRead } = app;
  const book = bookById(reader.bookId) ?? books[0];
  const episode = reader.episodeId ? episodeById(reader.episodeId) : undefined;
  const season = episode ? seasons.find((s) => s.episodes.some((e) => e.id === episode.id)) : undefined;

  const [verses, setVerses] = useState<ChapterVerse[]>([]);
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const [source, setSource] = useState<string>("");
  const [selected, setSelected] = useState<number | null>(null);
  const [picker, setPicker] = useState(false);
  const [askOpen, setAskOpen] = useState<{ seed?: string } | null>(null);
  const [gloss, setGloss] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [copied, setCopied] = useState(false);
  const [intro, setIntro] = useState(false);

  useEffect(() => {
    let alive = true;
    setStatus("loading");
    setSelected(null);
    fetchChapter(translation, book.id, reader.chapter)
      .then((r) => {
        if (!alive) return;
        setVerses(r.verses);
        setSource(r.partial ? "Offline excerpt" : r.source === "live" ? "Live" : "Saved offline");
        setStatus("ok");
        if (reader.verse) {
          setSelected(reader.verse);
          setTimeout(() => document.getElementById(`v-${reader.verse}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 250);
        }
      })
      .catch(() => alive && setStatus("error"));
    return () => {
      alive = false;
    };
  }, [translation, book.id, reader.chapter, reader.verse]);

  const suggestions = useMemo(() => suggestionsFor(book.id, verses.map((v) => v.t)), [book.id, verses]);
  const selVerse = verses.find((v) => v.n === selected);
  const selRef = selected ? `${book.name} ${reader.chapter}:${selected}` : "";
  const isRead = chaptersRead.includes(`${book.id}:${reader.chapter}`);
  const epDone = episode ? done.includes(episode.id) : false;

  const go = (delta: number) => {
    let idx = books.findIndex((b) => b.id === book.id);
    let ch = reader.chapter + delta;
    if (ch < 1) {
      idx = Math.max(0, idx - 1);
      ch = books[idx].chapters;
    } else if (ch > books[idx].chapters) {
      idx = Math.min(books.length - 1, idx + 1);
      ch = 1;
    }
    openReader({ bookId: books[idx].id, chapter: ch });
  };

  const finish = () => {
    if (episode) {
      completeEpisode(episode.id);
      setFinished(true);
    } else markChapter(book.id, reader.chapter);
  };

  const nextEp = useMemo(() => {
    if (!season || !episode) return undefined;
    const i = season.episodes.findIndex((e) => e.id === episode.id);
    if (season.episodes[i + 1]) return season.episodes[i + 1];
    const next = seasons.find((s) => s.n === season.n + 1 && s.status === "live");
    return next?.episodes[0];
  }, [season, episode]);

  const renderText = (t: string) =>
    t.split(glossaryRegex).map((part, i) => {
      const key = part.toLowerCase();
      if (i % 2 === 1 && glossary[key] && !QUIET.has(key)) {
        return (
          <span
            key={i}
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              setGloss(key);
            }}
            className={`cursor-help underline decoration-dotted underline-offset-4 ${paper ? "decoration-[#9a7c32]" : "decoration-gold/60"}`}
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });

  const txt = paper ? "text-[#1f252d]" : "text-parchment";
  const sub = paper ? "text-[#7a6f58]" : "text-mist";

  return (
    <div className={`-mx-4 -mt-2 min-h-[80svh] rounded-none px-4 pb-40 pt-2 transition-colors duration-500 sm:mx-0 sm:rounded-3xl sm:px-8 ${paper ? "paper-tex" : ""}`}>
      {/* Toolbar */}
      <div className={`sticky top-[60px] z-20 -mx-4 mb-6 flex items-center gap-2 border-b px-4 py-3 backdrop-blur-xl sm:-mx-8 sm:px-8 ${paper ? "border-[#ddd2b9] bg-[#f4efe4]/90" : "border-line bg-night/85"}`}>
        <button onClick={() => go(-1)} className={`rounded-full p-2 ${sub} hover:text-gold`} aria-label="Previous chapter">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button onClick={() => setPicker(true)} className={`flex items-center gap-1.5 rounded-full border px-4 py-2 font-fraunces text-base font-semibold ${paper ? "border-[#d4c9b0] text-[#1f252d]" : "border-line text-parchment"} hover:border-gold/60`}>
          {book.name} {reader.chapter} <ChevronDown className="h-3.5 w-3.5 text-gold" />
        </button>
        <button onClick={() => go(1)} className={`rounded-full p-2 ${sub} hover:text-gold`} aria-label="Next chapter">
          <ChevronRight className="h-4 w-4" />
        </button>

        <div className="ml-auto flex items-center gap-1.5">
          <div className={`hidden rounded-full border p-0.5 sm:flex ${paper ? "border-[#d4c9b0]" : "border-line"}`}>
            {(["kjv", "web"] as const).map((t) => (
              <button
                key={t}
                onClick={() => app.setTranslation(t)}
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] uppercase ${translation === t ? "bg-gold text-night" : sub}`}
                title={t === "kjv" ? "King James Version" : "World English Bible (modern)"}
              >
                {t}
              </button>
            ))}
          </div>
          <button onClick={() => app.setFontScale(fontScale - 0.08)} className={`rounded-full p-2 ${sub} hover:text-gold`} aria-label="Smaller text">
            <Minus className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => app.setFontScale(fontScale + 0.08)} className={`rounded-full p-2 ${sub} hover:text-gold`} aria-label="Larger text">
            <Plus className="h-3.5 w-3.5" />
          </button>
          <button onClick={() => app.setPaper(!paper)} className={`rounded-full p-2 ${sub} hover:text-gold`} aria-label="Toggle paper mode">
            {paper ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Episode banner */}
        {episode && season && (
          <div className={`mb-6 overflow-hidden border ${paper ? "border-[#d4c9b0] bg-white/40" : "border-ember/40 bg-night2"}`}>
            <div className="p-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">
                ▶ Season {season.n} · Episode {episode.n} · {episode.minutes} min
              </p>
              <h2 className={`mt-1.5 font-fraunces text-2xl font-semibold ${txt}`}>{episode.title}</h2>
              <p className={`mt-2 font-newsreader text-[15px] leading-relaxed ${sub}`}>
                <span className="font-semibold text-ember">In this episode: </span>
                {episode.synopsis}
              </p>
            </div>
          </div>
        )}

        {/* Chapter heading */}
        <div className="mb-6 text-center">
          <p className={`font-mono text-[10px] uppercase tracking-[0.3em] ${sub}`}>
            {book.genre} · {translation.toUpperCase()}
          </p>
          <h1 className={`mt-2 font-fraunces text-[44px] font-semibold leading-none ${txt}`}>
            {book.name} <span className="text-gold">{reader.chapter}</span>
          </h1>
          <button onClick={() => setIntro(!intro)} className={`mx-auto mt-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] ${sub} hover:text-gold`}>
            <Info className="h-3 w-3" /> About {book.name}
          </button>
          <AnimatePresence>
            {intro && (
              <motion.p
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`mx-auto mt-3 max-w-md overflow-hidden font-newsreader text-[15px] italic ${sub}`}
              >
                {book.about} Written by: {book.author}.
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* Text */}
        {status === "loading" && (
          <div className="space-y-3 py-6">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className={`h-4 animate-pulse rounded ${paper ? "bg-[#e5dcc8]" : "bg-line/70"}`} style={{ width: `${70 + ((i * 37) % 30)}%` }} />
            ))}
          </div>
        )}

        {status === "error" && (
          <div className="rounded-2xl border border-ember/40 bg-ember/10 p-6 text-center">
            <WifiOff className="mx-auto h-6 w-6 text-ember" />
            <p className={`mt-3 font-newsreader ${txt}`}>This chapter isn't saved on your device yet and you appear to be offline.</p>
            <p className={`mt-1 font-mono text-[10px] uppercase tracking-[0.15em] ${sub}`}>Try Psalm 1, James 1 or Philippians 4. Those are bundled offline.</p>
          </div>
        )}

        {status === "ok" && (
          <>
            <p className={`scripture ${txt}`} style={{ fontSize: `calc(1.1875rem * ${fontScale})` }}>
              {verses.map((v) => {
                const ref = `${book.name} ${reader.chapter}:${v.n}`;
                const hl = highlights[ref];
                const sel = selected === v.n;
                return (
                  <span
                    key={v.n}
                    id={`v-${v.n}`}
                    onClick={() => setSelected(sel ? null : v.n)}
                    className={`cursor-pointer rounded-sm px-0.5 transition-colors duration-200 ${
                      hl ? (paper ? HL_PAPER[hl] : HL[hl]) : ""
                    } ${sel ? (paper ? "outline outline-2 outline-[#9a7c32]/60" : "outline outline-2 outline-gold/60") : ""}`}
                  >
                    <sup className={`mr-1 font-mono text-[0.55em] ${paper ? "text-[#9a7c32]" : "text-gold/70"}`}>{v.n}</sup>
                    {renderText(v.t)}{" "}
                  </span>
                );
              })}
            </p>
            <p className={`mt-6 text-center font-mono text-[9px] uppercase tracking-[0.2em] ${sub}`}>
              {translation === "kjv" ? "King James Version" : "World English Bible"} · Public domain · {source}
              {" · "}Tap a verse to ask, highlight or discuss · Dotted words explain themselves
            </p>

            {/* Finish */}
            <div className="mt-10 flex flex-col items-center gap-4">
              {episode ? (
                <button
                  onClick={finish}
                  className={`flex items-center gap-2.5 rounded-full px-7 py-4 font-fraunces text-lg font-semibold transition-transform hover:scale-[1.02] ${
                    epDone ? "border border-sage/50 bg-sage/10 text-sage" : "bg-gold text-night"
                  }`}
                >
                  {epDone ? <Check className="h-5 w-5" /> : <Sparkles className="h-5 w-5" />}
                  {epDone ? "Episode complete · watch again" : `Finish Episode ${episode.n}`}
                </button>
              ) : (
                <button
                  onClick={finish}
                  className={`flex items-center gap-2.5 rounded-full px-7 py-4 font-fraunces text-lg font-semibold ${
                    isRead ? "border border-sage/50 bg-sage/10 text-sage" : "bg-gold text-night"
                  }`}
                >
                  {isRead ? <Check className="h-5 w-5" /> : <BookOpen className="h-5 w-5" />}
                  {isRead ? "Chapter read" : "Mark chapter as read"}
                </button>
              )}
              <button onClick={() => setAskOpen({})} className={`flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] ${sub} hover:text-gold`}>
                <Sparkles className="h-3.5 w-3.5" /> Ask a question about {book.name} {reader.chapter}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Floating Ask button */}
      {status === "ok" && !selected && (
        <button
          onClick={() => setAskOpen({})}
          className="fixed bottom-24 right-5 z-30 flex items-center gap-2 rounded-full bg-gold px-5 py-3.5 font-fraunces text-base font-semibold text-night shadow-[0_6px_18px_-6px_rgba(28,23,20,0.45)] lg:bottom-8"
        >
          <Sparkles className="h-4 w-4" /> Ask
        </button>
      )}

      {/* Verse action bar */}
      <AnimatePresence>
        {selVerse && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-x-0 bottom-[84px] z-40 flex justify-center px-3 lg:bottom-6"
          >
            <div className="w-full max-w-xl rounded-2xl border border-line bg-night2/95 p-3 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between px-1 pb-2">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">{selRef}</span>
                <div className="flex items-center gap-1.5">
                  {Object.keys(HL).map((c) => (
                    <button
                      key={c}
                      onClick={() => app.toggleHighlight(selRef, c)}
                      className={`h-6 w-6 rounded-full border-2 ${highlights[selRef] === c ? "border-parchment" : "border-transparent"} ${
                        c === "gold" ? "bg-gold" : c === "sage" ? "bg-sage" : "bg-ember"
                      }`}
                      aria-label={`Highlight ${c}`}
                    />
                  ))}
                  <button onClick={() => setSelected(null)} className="ml-1 rounded-full p-1 text-mist hover:text-parchment" aria-label="Close">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button onClick={() => setAskOpen({})} className="flex flex-col items-center gap-1 rounded-xl bg-gold px-2 py-2.5 text-night">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em]">Ask</span>
                </button>
                <button onClick={() => app.openRoom("room", `/${selRef} `)} className="flex flex-col items-center gap-1 rounded-xl border border-line px-2 py-2.5 text-parchment hover:border-gold/50">
                  <MessagesSquare className="h-4 w-4" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em]">Discuss</span>
                </button>
                <a
                  href={wa(`“${selVerse.t}” — ${selRef} (${translation.toUpperCase()})\n\nReading this on Berean today 📖`)}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col items-center gap-1 rounded-xl border border-wa/40 px-2 py-2.5 text-wa hover:bg-wa/10"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em]">WhatsApp</span>
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(`“${selVerse.t}” — ${selRef}`).catch(() => undefined);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1400);
                  }}
                  className="flex flex-col items-center gap-1 rounded-xl border border-line px-2 py-2.5 text-parchment hover:border-gold/50"
                >
                  {copied ? <Check className="h-4 w-4 text-sage" /> : <Copy className="h-4 w-4" />}
                  <span className="font-mono text-[9px] uppercase tracking-[0.12em]">{copied ? "Copied" : "Copy"}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Glossary popover */}
      <AnimatePresence>
        {gloss && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            className="fixed inset-x-0 bottom-[84px] z-50 flex justify-center px-3 lg:bottom-6"
          >
            <div className="w-full max-w-md rounded-2xl border border-gold/40 bg-night2 p-4 shadow-2xl">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">Word helper</p>
                  <p className="mt-1 font-fraunces text-xl font-semibold capitalize text-parchment">{gloss}</p>
                </div>
                <button onClick={() => setGloss(null)} className="rounded-full p-1 text-mist hover:text-parchment" aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="mt-2 font-newsreader text-[15px] leading-relaxed text-parchment">{glossary[gloss]}</p>
              <button
                onClick={() => {
                  const w = gloss;
                  setGloss(null);
                  setAskOpen({ seed: `What does “${w}” mean?` });
                }}
                className="mt-3 font-mono text-[10px] uppercase tracking-[0.15em] text-gold"
              >
                Save to my questions →
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {picker && (
          <BookPicker
            onClose={() => setPicker(false)}
            onPick={(id, ch) => {
              setPicker(false);
              openReader({ bookId: id, chapter: ch });
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {askOpen && (
          <AskSheet
            onClose={() => setAskOpen(null)}
            bookId={book.id}
            chapter={reader.chapter}
            verse={selected ?? undefined}
            verseText={selVerse?.t}
            suggestions={suggestions}
            seed={askOpen.seed}
          />
        )}
      </AnimatePresence>

      {/* Episode finished — "next time on" */}
      <AnimatePresence>
        {finished && episode && season && (
          <motion.div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 p-5 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE }}
              className="w-full max-w-md overflow-hidden rounded-3xl border border-gold/30 bg-night2"
            >
              <div className="relative h-40 overflow-hidden">
                {season.poster && <img src={season.poster} alt="" className="h-full w-full object-cover opacity-60" />}
                <div className="absolute inset-0 bg-gradient-to-t from-night2 to-transparent" />
                <div className="absolute bottom-4 left-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Episode complete</p>
                  <p className="font-fraunces text-2xl font-semibold text-parchment">S{season.n} · E{episode.n} · {episode.title}</p>
                </div>
              </div>
              <div className="p-5">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">Next time on Berean…</p>
                <p className="mt-1.5 font-fraunces text-xl italic text-parchment">“{episode.nextTime}”</p>
                <div className="mt-5 flex flex-col gap-2">
                  {nextEp && (
                    <button
                      onClick={() => {
                        setFinished(false);
                        openReader({ bookId: nextEp.bookId, chapter: nextEp.chapter, episodeId: nextEp.id });
                      }}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gold px-5 py-3.5 font-fraunces text-base font-semibold text-night"
                    >
                      <Play className="h-4 w-4 fill-night" /> Play next episode
                    </button>
                  )}
                  <a
                    href={wa(`I just finished S${season.n}E${episode.n} “${episode.title}” on Berean 🔥\n\nNo spoilers… but ${episode.book} ${episode.chapter} is WILD. Where are you in Season ${season.n}? 👀`)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-xl bg-wa px-5 py-3.5 font-fraunces text-base font-semibold text-night"
                  >
                    <MessageCircle className="h-4 w-4" /> Tell my WhatsApp group
                  </a>
                  <button
                    onClick={() => {
                      setFinished(false);
                      app.openRoom(season.id === "s2" ? "s2" : "room", `Just finished /S${season.n}E${episode.n} — `);
                    }}
                    className="rounded-xl border border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-mist hover:text-parchment"
                  >
                    Talk about it in the Room
                  </button>
                  <button onClick={() => setFinished(false)} className="py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-mist/70 hover:text-mist">
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
