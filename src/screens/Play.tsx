import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Brain, Check, Delete, History, MessageCircle, Puzzle, RotateCcw, Timer, Trophy, X } from "lucide-react";
import { useApp, wa, dateKey } from "../app/store";
import { wordleWords, trivia, timelineEvents } from "../data/games";
import { verses, dayIndex, parseRef } from "../data/bible";
import { EASE } from "../berean/ui";
import { siteUrl } from "../app/site";

const shuffle = <T,>(a: T[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

/* ============================== WORDLE ============================== */
type Mark = "g" | "y" | "x";

function score(guess: string, answer: string): Mark[] {
  const res: Mark[] = Array(5).fill("x");
  const pool = answer.split("");
  guess.split("").forEach((c, i) => {
    if (answer[i] === c) {
      res[i] = "g";
      pool[i] = "_";
    }
  });
  guess.split("").forEach((c, i) => {
    if (res[i] === "g") return;
    const k = pool.indexOf(c);
    if (k > -1) {
      res[i] = "y";
      pool[k] = "_";
    }
  });
  return res;
}

function Wordle() {
  const { openReader } = useApp();
  const today = dayIndex();
  const target = wordleWords[today % wordleWords.length];
  const storeKey = `berean:wordle:${dateKey()}`;
  const [guesses, setGuesses] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storeKey) ?? "[]");
    } catch {
      return [];
    }
  });
  const [cur, setCur] = useState("");
  const [shake, setShake] = useState(false);

  const won = guesses.includes(target.w);
  const lost = !won && guesses.length >= 6;
  const over = won || lost;

  useEffect(() => {
    try {
      localStorage.setItem(storeKey, JSON.stringify(guesses));
    } catch {
      /* ignore */
    }
  }, [guesses, storeKey]);

  const press = useCallback(
    (k: string) => {
      if (over) return;
      if (k === "ENTER") {
        if (cur.length !== 5) {
          setShake(true);
          setTimeout(() => setShake(false), 400);
          return;
        }
        setGuesses((g) => [...g, cur]);
        setCur("");
      } else if (k === "DEL") setCur((c) => c.slice(0, -1));
      else if (/^[A-Z]$/.test(k) && cur.length < 5) setCur((c) => c + k);
    },
    [cur, over]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === "INPUT") return;
      if (e.key === "Enter") press("ENTER");
      else if (e.key === "Backspace") press("DEL");
      else if (/^[a-zA-Z]$/.test(e.key)) press(e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  const keyState = useMemo(() => {
    const m: Record<string, Mark> = {};
    guesses.forEach((g) =>
      score(g, target.w).forEach((s, i) => {
        const c = g[i];
        const prev = m[c];
        if (prev === "g") return;
        if (s === "g" || s === "y" || !prev) m[c] = s;
      })
    );
    return m;
  }, [guesses, target.w]);

  const grid = guesses.map((g) => score(g, target.w).map((s) => (s === "g" ? "🟩" : s === "y" ? "🟨" : "⬛")).join("")).join("\n");
  const cell = (m?: Mark) => (m === "g" ? "bg-sage border-sage text-night" : m === "y" ? "bg-gold border-gold text-night" : m === "x" ? "bg-line border-line text-mist" : "border-line");

  return (
    <div className="mx-auto max-w-md">
      <p className="text-center font-newsreader text-[15px] text-mist">
        Hint: <span className="text-parchment">{target.hint}</span>
      </p>
      <div className="mt-5 grid gap-1.5">
        {Array.from({ length: 6 }, (_, r) => {
          const g = guesses[r];
          const marks = g ? score(g, target.w) : undefined;
          const letters = g ?? (r === guesses.length ? cur : "");
          return (
            <motion.div key={r} animate={r === guesses.length && shake ? { x: [0, -8, 8, -6, 6, 0] } : {}} className="grid grid-cols-5 gap-1.5">
              {Array.from({ length: 5 }, (_, c) => (
                <motion.div
                  key={c}
                  initial={false}
                  animate={marks ? { rotateX: [90, 0] } : { scale: letters[c] ? [1.08, 1] : 1 }}
                  transition={{ delay: marks ? c * 0.08 : 0, duration: 0.3 }}
                  className={`flex aspect-square items-center justify-center rounded-lg border-2 font-fraunces text-2xl font-semibold ${marks ? cell(marks[c]) : letters[c] ? "border-mist/60" : "border-line"}`}
                >
                  {letters[c] ?? ""}
                </motion.div>
              ))}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {over && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 rounded-2xl border border-gold/30 bg-gold/[0.06] p-4 text-center">
            <p className="font-fraunces text-2xl font-semibold">{won ? `Solved in ${guesses.length}! 🎉` : `The word was ${target.w}`}</p>
            <p className="mt-1 font-newsreader text-sm text-mist">Read where it appears: {target.ref}</p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <a href={wa(`Berean Daily Word ${won ? guesses.length : "X"}/6 📖\n\n${grid}\n\nCan you beat me? ${siteUrl()}`)} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-wa px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-night">
                <MessageCircle className="h-3.5 w-3.5" /> Share grid
              </a>
              <button
                onClick={() => {
                  const p = parseRef(target.ref);
                  if (p) openReader({ bookId: p.book.id, chapter: p.chapter, verse: p.verse });
                }}
                className="flex items-center gap-2 rounded-full border border-gold/40 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-gold"
              >
                <BookOpen className="h-3.5 w-3.5" /> Read {target.ref}
              </button>
            </div>
            <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.18em] text-mist">New word at midnight</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 space-y-1.5">
        {["QWERTYUIOP", "ASDFGHJKL", "+ZXCVBNM-"].map((row) => (
          <div key={row} className="flex justify-center gap-1">
            {row.split("").map((k) => {
              const label = k === "+" ? "ENTER" : k === "-" ? "DEL" : k;
              const st = keyState[k];
              return (
                <button
                  key={k}
                  onClick={() => press(label)}
                  className={`flex h-12 items-center justify-center rounded-md font-mono text-sm font-medium transition-colors ${label.length > 1 ? "px-2.5 text-[10px]" : "w-8 sm:w-10"} ${
                    st === "g" ? "bg-sage text-night" : st === "y" ? "bg-gold text-night" : st === "x" ? "bg-night3 text-mist/40" : "bg-line/80 text-parchment hover:bg-line"
                  }`}
                >
                  {label === "DEL" ? <Delete className="h-4 w-4" /> : label}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================== TRIVIA ============================== */
function Quiz() {
  const [round, setRound] = useState(() => shuffle(trivia).slice(0, 7));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [points, setPoints] = useState(0);
  const [time, setTime] = useState(15);
  const q = round[i];
  const finished = i >= round.length;

  useEffect(() => {
    if (finished || picked !== null) return;
    if (time <= 0) {
      setPicked(-1);
      return;
    }
    const id = setTimeout(() => setTime((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [time, picked, finished]);

  const choose = (k: number) => {
    if (picked !== null) return;
    setPicked(k);
    if (k === q.answer) setPoints((p) => p + 100 + time * 10);
  };

  const next = () => {
    setI((x) => x + 1);
    setPicked(null);
    setTime(15);
  };

  const restart = () => {
    setRound(shuffle(trivia).slice(0, 7));
    setI(0);
    setPicked(null);
    setPoints(0);
    setTime(15);
  };

  if (finished)
    return (
      <div className="mx-auto max-w-md text-center">
        <Trophy className="mx-auto h-12 w-12 text-gold" />
        <p className="mt-3 font-fraunces text-5xl font-semibold">{points}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">Bible IQ points</p>
        <div className="mt-6 flex justify-center gap-2">
          <a href={wa(`I scored ${points} on Berean Bible IQ 🧠📖\n\nThink you know your Bible better? ${siteUrl()}`)} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full bg-wa px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-night">
            <MessageCircle className="h-3.5 w-3.5" /> Challenge friends
          </a>
          <button onClick={restart} className="flex items-center gap-2 rounded-full border border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em]">
            <RotateCcw className="h-3.5 w-3.5" /> Again
          </button>
        </div>
      </div>
    );

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
        <span>Question {i + 1}/{round.length}</span>
        <span className={`flex items-center gap-1.5 ${time <= 5 ? "text-ember" : ""}`}>
          <Timer className="h-3 w-3" /> {time}s
        </span>
        <span className="text-gold">{points} pts</span>
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
        <motion.div className="h-full bg-gold" animate={{ width: `${(time / 15) * 100}%` }} transition={{ duration: 0.9, ease: "linear" }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ ease: EASE }}>
          <p className="mt-6 font-fraunces text-2xl font-semibold leading-snug sm:text-3xl">{q.q}</p>
          <div className="mt-5 grid gap-2.5">
            {q.options.map((o, k) => {
              const right = picked !== null && k === q.answer;
              const wrong = picked === k && k !== q.answer;
              return (
                <button
                  key={o}
                  onClick={() => choose(k)}
                  className={`flex items-center justify-between rounded-2xl border px-5 py-4 text-left font-newsreader text-[17px] transition-colors ${
                    right ? "border-sage bg-sage/15 text-parchment" : wrong ? "border-ember bg-ember/15" : "border-line bg-night2/60 hover:border-gold/50"
                  }`}
                >
                  {o}
                  {right && <Check className="h-5 w-5 text-sage" />}
                  {wrong && <X className="h-5 w-5 text-ember" />}
                </button>
              );
            })}
          </div>
          {picked !== null && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 rounded-2xl border border-line bg-night2/60 p-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">{picked === -1 ? "Time's up" : picked === q.answer ? "Correct" : "Not quite"} · {q.ref}</p>
              <p className="mt-1 font-newsreader text-[15px] text-parchment">{q.fact}</p>
              <button onClick={next} className="mt-3 rounded-full bg-gold px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-night">
                Next →
              </button>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ============================== TIMELINE ============================== */
function Timeline() {
  const pick = () => {
    const idx = shuffle(timelineEvents.map((_, i) => i)).slice(0, 5).sort((a, b) => a - b);
    return idx.map((i) => timelineEvents[i]);
  };
  const [answer, setAnswer] = useState(pick);
  const [pool, setPool] = useState(() => shuffle(answer));
  const [order, setOrder] = useState<typeof answer>([]);
  const checked = order.length === answer.length;
  const correct = checked && order.every((e, i) => e.id === answer[i].id);

  const reset = () => {
    const a = pick();
    setAnswer(a);
    setPool(shuffle(a));
    setOrder([]);
  };

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-center font-newsreader text-[15px] text-mist">Tap the events from earliest to latest.</p>
      <div className="mt-5 space-y-2">
        {answer.map((_, i) => {
          const e = order[i];
          const ok = checked && e && e.id === answer[i].id;
          return (
            <div key={i} className={`flex items-center gap-3 rounded-2xl border px-4 py-3.5 ${!e ? "border-dashed border-line" : checked ? (ok ? "border-sage bg-sage/10" : "border-ember bg-ember/10") : "border-gold/40 bg-gold/[0.06]"}`}>
              <span className="font-mono text-xs text-gold">{i + 1}</span>
              <span className="flex-1 font-newsreader text-[16px]">{e ? e.label : "—"}</span>
              {checked && e && <span className="font-mono text-[10px] text-mist">{e.ref}</span>}
            </div>
          );
        })}
      </div>
      {!checked && (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {pool
            .filter((p) => !order.includes(p))
            .map((p) => (
              <motion.button layout key={p.id} onClick={() => setOrder((o) => [...o, p])} className="rounded-full border border-line bg-night2 px-4 py-2.5 font-newsreader text-[15px] hover:border-gold">
                {p.label}
              </motion.button>
            ))}
        </div>
      )}
      {checked && (
        <div className="mt-5 text-center">
          <p className="font-fraunces text-2xl font-semibold">{correct ? "Perfect order." : "Not quite. The correct order is above."}</p>
          {!correct && (
            <p className="mt-1 font-newsreader text-sm text-mist">Correct: {answer.map((a) => a.label).join(" → ")}</p>
          )}
          <button onClick={reset} className="mt-4 rounded-full bg-gold px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-night">
            New round
          </button>
        </div>
      )}
      {!checked && order.length > 0 && (
        <button onClick={() => setOrder([])} className="mx-auto mt-4 block font-mono text-[10px] uppercase tracking-[0.18em] text-mist hover:text-parchment">
          Clear
        </button>
      )}
    </div>
  );
}

/* ============================== VERSE BUILDER ============================== */
function chunk(text: string) {
  const words = text.split(" ");
  const out: string[] = [];
  for (let i = 0; i < words.length; i += 3) out.push(words.slice(i, i + 3).join(" "));
  return out;
}

function Builder() {
  const shortOnes = verses.filter((v) => v.text.split(" ").length <= 22);
  const [vi, setVi] = useState(() => dayIndex() % shortOnes.length);
  const v = shortOnes[vi];
  const parts = useMemo(() => chunk(v.text), [v.text]);
  const [pool, setPool] = useState(() => shuffle(parts.map((p, i) => ({ p, i }))));
  const [built, setBuilt] = useState<{ p: string; i: number }[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const done = built.length === parts.length;

  useEffect(() => {
    setPool(shuffle(parts.map((p, i) => ({ p, i }))));
    setBuilt([]);
  }, [parts]);

  const tap = (x: { p: string; i: number }) => {
    if (x.i === built.length) setBuilt((b) => [...b, x]);
    else {
      setWrong(x.i);
      setTimeout(() => setWrong(null), 400);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-gold">{v.ref}</p>
      <div className="mt-4 min-h-[120px] rounded-2xl border border-line bg-night2/60 p-5 font-newsreader text-xl leading-relaxed">
        {built.map((b) => (
          <motion.span key={b.i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            {b.p}{" "}
          </motion.span>
        ))}
        {!done && <span className="inline-block h-5 w-0.5 animate-pulse bg-gold align-middle" />}
      </div>
      {!done ? (
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {pool
            .filter((x) => !built.some((b) => b.i === x.i))
            .map((x) => (
              <motion.button
                layout
                key={x.i}
                animate={wrong === x.i ? { x: [0, -6, 6, -4, 0] } : {}}
                onClick={() => tap(x)}
                className={`rounded-xl border px-3.5 py-2 font-newsreader text-[16px] ${wrong === x.i ? "border-ember text-ember" : "border-line bg-night2 hover:border-gold"}`}
              >
                {x.p}
              </motion.button>
            ))}
        </div>
      ) : (
        <div className="mt-5 text-center">
          <p className="font-fraunces text-2xl font-semibold">Hidden in your heart ✨</p>
          <button onClick={() => setVi((x) => (x + 1) % shortOnes.length)} className="mt-4 rounded-full bg-gold px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-night">
            Next verse
          </button>
        </div>
      )}
    </div>
  );
}

/* ============================== HUB ============================== */
const GAMES = [
  { id: "word", name: "Daily Word", desc: "Guess the 5-letter Bible word", Icon: Puzzle },
  { id: "quiz", name: "Bible IQ", desc: "Timed trivia, share your score", Icon: Brain },
  { id: "time", name: "Timeline", desc: "Put history in order", Icon: History },
  { id: "build", name: "Verse Builder", desc: "Memorise by rebuilding", Icon: BookOpen },
] as const;

export default function Play() {
  const [g, setG] = useState<(typeof GAMES)[number]["id"]>("word");
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Play</p>
      <h1 className="mt-2 font-fraunces text-[clamp(2.2rem,6vw,3.4rem)] font-semibold leading-none">Learn it by playing it.</h1>
      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {GAMES.map(({ id, name, desc, Icon }) => (
          <button
            key={id}
            onClick={() => setG(id)}
            className={`rounded-2xl border p-4 text-left transition-colors ${g === id ? "border-gold bg-gold/10" : "border-line/80 bg-night2/60 hover:border-gold/40"}`}
          >
            <Icon className={`h-5 w-5 ${g === id ? "text-gold" : "text-mist"}`} />
            <p className="mt-2 font-fraunces text-lg font-semibold">{name}</p>
            <p className="font-newsreader text-sm text-mist">{desc}</p>
          </button>
        ))}
      </div>
      <div className="mt-8 rounded-3xl border border-line/80 bg-night2/40 p-5 sm:p-8">
        <AnimatePresence mode="wait">
          <motion.div key={g} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ ease: EASE }}>
            {g === "word" && <Wordle />}
            {g === "quiz" && <Quiz />}
            {g === "time" && <Timeline />}
            {g === "build" && <Builder />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
