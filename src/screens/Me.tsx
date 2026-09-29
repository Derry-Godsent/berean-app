import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Check,
  Download,
  Flame,
  HardDrive,
  Highlighter,
  MessageCircle,
  RotateCcw,
  Sparkles,
  Trash2,
  UserPlus,
  Users,
  WifiOff,
  X,
} from "lucide-react";
import { useApp, wa } from "../app/store";
import { useProfile, GOALS } from "../app/profile";
import { SkinSwitch } from "../app/theme";
import {
  cancelDownload,
  clearLibrary,
  downloadBooks,
  libraryStats,
  type DownloadProgress,
  type LibraryStats,
} from "../app/library";
import { ask, askEndpoint, setAskEndpoint } from "../app/ask";
import { books, TOTAL_CHAPTERS, parseRef, bookById } from "../data/bible";
import { seasons } from "../data/seasons";
import { seasonProgress } from "../app/helpers";
import { StreakRing, EASE } from "../berean/ui";

const fmtBytes = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`);

/* ------------------------------- Offline ------------------------------- */

function OfflineTab() {
  const [stats, setStats] = useState<LibraryStats | null>(null);
  const [progress, setProgress] = useState<DownloadProgress | null>(null);
  const [busy, setBusy] = useState(false);
  const [pickBook, setPickBook] = useState("MRK");
  const alive = useRef(true);

  const refresh = () => {
    libraryStats("kjv").then((s) => alive.current && setStats(s));
  };

  useEffect(() => {
    alive.current = true;
    refresh();
    return () => {
      alive.current = false;
    };
  }, []);

  const run = async (targets: { bookId: string; chapters: number; name: string }[]) => {
    if (busy) return;
    setBusy(true);
    setProgress(null);
    await downloadBooks("kjv", targets, (p) => alive.current && setProgress(p));
    if (alive.current) {
      setBusy(false);
      refresh();
    }
  };

  const sets = [
    { label: "The Gospels", ids: ["MAT", "MRK", "LUK", "JHN"], note: "≈ 89 chapters · start here" },
    { label: "Psalms & Proverbs", ids: ["PSA", "PRO"], note: "≈ 181 chapters · devotional reading" },
    { label: "New Testament", ids: books.filter((b) => b.testament === "NT").map((b) => b.id), note: "260 chapters · about 5 minutes" },
    { label: "Old Testament", ids: books.filter((b) => b.testament === "OT").map((b) => b.id), note: "929 chapters · about 20 minutes" },
  ];

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-line/80 bg-night2/60 p-6">
        <div className="flex items-start gap-3">
          <WifiOff className="mt-1 h-5 w-5 text-gold" />
          <div>
            <p className="font-fraunces text-xl font-semibold">Read with no data</p>
            <p className="mt-1 font-newsreader text-[15px] text-mist">
              Save Scripture to your device once and it opens instantly. On the trotro, with no
              network, forever. A saved chapter uses about 12 KB.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {[
            { v: stats?.chapters ?? 0, l: "chapters saved" },
            { v: stats?.books.length ?? 0, l: "books started" },
            { v: fmtBytes(stats?.bytes ?? 0), l: "of device storage" },
          ].map((x) => (
            <div key={x.l} className="rounded-2xl border border-line/70 bg-night/50 p-3.5">
              <p className="font-fraunces text-2xl font-semibold text-gold">{x.v}</p>
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-mist">{x.l}</p>
            </div>
          ))}
        </div>

        {progress && (
          <div className="mt-5 rounded-2xl border border-gold/30 bg-gold/[0.06] p-4">
            <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.15em]">
              <span className="text-parchment">{progress.current}</span>
              <span className="text-gold">
                {progress.done}/{progress.total}
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
              <div className="h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${(progress.done / Math.max(1, progress.total)) * 100}%` }} />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-mist">
                {progress.ok} saved · {progress.failed} failed
              </p>
              {busy && (
                <button onClick={() => cancelDownload()} className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ember">
                  <X className="h-3 w-3" /> Stop
                </button>
              )}
            </div>
          </div>
        )}

        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {sets.map((s) => (
            <button
              key={s.label}
              disabled={busy}
              onClick={() =>
                run(
                  s.ids.map((id) => {
                    const b = bookById(id)!;
                    return { bookId: b.id, chapters: b.chapters, name: b.name };
                  })
                )
              }
              className="flex items-center gap-3 rounded-2xl border border-line/80 bg-night/50 p-4 text-left transition-colors hover:border-gold/50 disabled:opacity-50"
            >
              <Download className="h-4 w-4 shrink-0 text-gold" />
              <div>
                <p className="font-newsreader text-[16px]">{s.label}</p>
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-mist">{s.note}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <select
            value={pickBook}
            onChange={(e) => setPickBook(e.target.value)}
            className="rounded-full border border-line bg-night px-4 py-2.5 font-newsreader text-[15px] focus:border-gold/50 focus:outline-none"
          >
            {books.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          <button
            disabled={busy}
            onClick={() => {
              const b = bookById(pickBook)!;
              run([{ bookId: b.id, chapters: b.chapters, name: b.name }]);
            }}
            className="flex items-center gap-2 rounded-full border border-gold/50 px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-gold disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" /> Save this book
          </button>
          {(stats?.chapters ?? 0) > 0 && (
            <button
              disabled={busy}
              onClick={async () => {
                await clearLibrary("kjv");
                refresh();
              }}
              className="flex items-center gap-2 rounded-full border border-line px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-mist hover:border-ember/50 hover:text-ember"
            >
              <Trash2 className="h-3.5 w-3.5" /> Clear all
            </button>
          )}
        </div>

        <p className="mt-4 font-mono text-[9px] uppercase leading-relaxed tracking-[0.15em] text-mist">
          Downloads run politely in the background at about one chapter per second. King James
          Version · public domain.
        </p>
      </div>

      {stats && stats.books.length > 0 && (
        <div className="rounded-3xl border border-line/80 bg-night2/60 p-6">
          <p className="flex items-center gap-2 font-fraunces text-xl font-semibold">
            <HardDrive className="h-4 w-4 text-gold" /> Saved on this device
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {stats.books.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-xl border border-line/70 px-4 py-3">
                <span className="flex-1 font-newsreader text-[16px]">{b.name}</span>
                <span className="font-mono text-[10px] text-mist">
                  {b.saved}/{b.chapters}
                </span>
                <div className="h-1 w-16 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-gold" style={{ width: `${(b.saved / b.chapters) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------- Profile ------------------------------- */

function ProfileTab() {
  const { profile, save, joinGroup, leaveGroup, resetProfile } = useProfile();
  const [code, setCode] = useState("");
  const [endpoint, setEndpoint] = useState(askEndpoint() ?? "");
  const [test, setTest] = useState<{ ok: boolean; msg: string } | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const goalLabel = GOALS.find((g) => g.id === profile?.goal)?.label ?? "—";

  const runTest = async () => {
    setTest({ ok: false, msg: "Testing…" });
    try {
      const a = await ask("Reply with exactly: connection ok", {});
      setTest({ ok: true, msg: a.text.slice(0, 90) });
    } catch {
      setTest({ ok: false, msg: "Could not reach that endpoint." });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 border border-line bg-night2 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-fraunces text-xl font-semibold">Appearance</p>
          <p className="mt-1 text-[15px] text-mist">
            Choose the skin that is most comfortable for reading. Your choice is saved on this device.
          </p>
        </div>
        <SkinSwitch />
      </div>

      <div className="rounded-3xl border border-line/80 bg-night2/60 p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Your account</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {[
            { k: "name" as const, label: "Name", v: profile?.name ?? "" },
            { k: "city" as const, label: "City", v: profile?.city ?? "" },
            { k: "church" as const, label: "Church / cell group", v: profile?.church ?? "" },
          ].map((f) => (
            <label key={f.k} className="block">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">{f.label}</span>
              <input
                defaultValue={f.v}
                onChange={(e) => {
                  save({ [f.k]: e.target.value });
                  setSavedFlash(true);
                  setTimeout(() => setSavedFlash(false), 1200);
                }}
                className="mt-1.5 w-full rounded-xl border border-line bg-night px-4 py-3 font-newsreader text-[16px] focus:border-gold/50 focus:outline-none"
              />
            </label>
          ))}
          <label className="block">
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">Goal</span>
            <select
              value={profile?.goal ?? ""}
              onChange={(e) => save({ goal: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-line bg-night px-4 py-3 font-newsreader text-[16px] focus:border-gold/50 focus:outline-none"
            >
              {GOALS.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.emoji} {g.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.15em] text-mist">
          {savedFlash ? "✓ Saved to this device" : `Goal: ${goalLabel}`}
        </p>
      </div>

      <div className="rounded-3xl border border-gold/30 bg-gold/[0.06] p-6">
        <p className="flex items-center gap-2 font-fraunces text-xl font-semibold">
          <Users className="h-4 w-4 text-gold" /> Your cell group
        </p>
        {profile?.groupCode ? (
          <div className="mt-3">
            <p className="font-newsreader text-[16px]">
              You're in <span className="font-mono text-gold">{profile.groupCode}</span>.
            </p>
            <button onClick={leaveGroup} className="mt-3 rounded-full border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-mist hover:border-ember/50 hover:text-ember">
              Leave group
            </button>
          </div>
        ) : (
          <>
            <p className="mt-1 font-newsreader text-[15px] text-mist">
              Enter the code a friend shared to keep streaks together.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="BRN-XXXX"
                className="w-40 rounded-full border border-line bg-night px-4 py-2.5 font-mono text-[13px] uppercase tracking-wider focus:border-gold/50 focus:outline-none"
              />
              <button
                onClick={() => code.trim() && joinGroup(code)}
                className="rounded-full bg-gold px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-night"
              >
                Join
              </button>
            </div>
          </>
        )}

        <div className="mt-5 border-t border-gold/20 pt-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold">Your invite code</p>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <p className="font-fraunces text-3xl font-semibold tracking-wider">{profile?.code ?? "—"}</p>
            <a
              href={wa(`Join me on Berean 📖\n\nMy invite code: ${profile?.code}\n\nThe Bible in seasons — read, play and keep streaks together.`)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-wa px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-night"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Share on WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-line/80 bg-night2/60 p-6">
        <p className="flex items-center gap-2 font-fraunces text-xl font-semibold">
          <Sparkles className="h-4 w-4 text-gold" /> Instant answers service
        </p>
        <p className="mt-1 font-newsreader text-[15px] text-mist">
          Ask works out of the box with its built-in study engine. For full AI answers, deploy the
          included <span className="font-mono text-parchment">worker/ask.js</span> (free on
          Cloudflare Workers) and paste its URL here.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <input
            value={endpoint}
            onChange={(e) => setEndpoint(e.target.value)}
            placeholder="https://your-worker.workers.dev/ask"
            className="min-w-[240px] flex-1 rounded-full border border-line bg-night px-4 py-2.5 font-mono text-[12px] focus:border-gold/50 focus:outline-none"
          />
          <button
            onClick={() => {
              setAskEndpoint(endpoint);
              setTest(null);
            }}
            className="rounded-full border border-gold/50 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-gold"
          >
            Save
          </button>
          <button onClick={runTest} className="rounded-full bg-gold px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.15em] text-night">
            Test connection
          </button>
        </div>
        {test && (
          <p className={`mt-2 font-mono text-[11px] ${test.ok ? "text-sage" : "text-ember"}`}>
            {test.ok ? "✓ Connected: " : "✗ "}
            {test.msg}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-line/60 p-4">
        <p className="flex-1 font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
          Everything is stored on this device
        </p>
        <button onClick={resetProfile} className="flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] hover:border-ember/50 hover:text-ember">
          <RotateCcw className="h-3 w-3" /> Redo onboarding
        </button>
      </div>
    </div>
  );
}

/* ------------------------------- Progress ------------------------------- */

function ProgressTab() {
  const app = useApp();
  const ot = books.filter((b) => b.testament === "OT");
  const nt = books.filter((b) => b.testament === "NT");
  const count = (list: typeof books) => app.chaptersRead.filter((k) => list.some((b) => k.startsWith(b.id + ":"))).length;
  const otTotal = ot.reduce((s, b) => s + b.chapters, 0);
  const ntTotal = nt.reduce((s, b) => s + b.chapters, 0);
  const pct = ((app.chaptersRead.length / TOTAL_CHAPTERS) * 100).toFixed(1);

  const digest = [
    `📖 My Bible questions (${app.questions.length})`,
    "",
    ...app.questions.slice(0, 12).map((q, i) => `${i + 1}. ${q.q} — (${q.ref})`),
    "",
    "Can we talk about these at cell group? 🙏",
  ].join("\n");

  const open = (ref: string) => {
    const p = parseRef(ref);
    if (p) app.openReader({ bookId: p.book.id, chapter: p.chapter, verse: p.verse });
  };

  return (
    <div className="space-y-5">
      <section className="flex flex-col items-start gap-6 rounded-3xl border border-line/80 bg-night2/60 p-6 sm:flex-row sm:items-center">
        <StreakRing value={app.streak} size={120} />
        <div className="flex-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">My journey</p>
          <h2 className="mt-1 font-fraunces text-4xl font-semibold">
            {app.streak > 0 ? `${app.streak} days rooted.` : "Day one starts now."}
          </h2>
          <p className="mt-1 flex items-center gap-2 font-newsreader text-[16px] text-mist">
            <Flame className={`h-4 w-4 ${app.readToday ? "fill-ember text-ember" : "text-mist"}`} />
            {app.readToday ? "You have read today. Streak safe." : "Read anything today to keep your streak."}
          </p>
        </div>
        <a
          href={wa(`I've read ${app.chaptersRead.length} chapters of the Bible and I'm on a ${app.streak}-day streak on Berean 🔥📖\n\nRead with me — we can keep each other accountable.`)}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-2 rounded-full bg-wa px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-night"
        >
          <MessageCircle className="h-4 w-4" /> Share my progress
        </a>
      </section>

      <section className="rounded-3xl border border-line/80 bg-night2/60 p-6">
        <div className="flex items-end justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">Whole Bible</p>
            <p className="font-fraunces text-4xl font-semibold text-gold">{pct}%</p>
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
            {app.chaptersRead.length} / {TOTAL_CHAPTERS} chapters
          </p>
        </div>
        <div className="mt-5 space-y-4">
          {[
            { l: "Old Testament", n: count(ot), t: otTotal },
            { l: "New Testament", n: count(nt), t: ntTotal },
          ].map((x) => (
            <div key={x.l}>
              <div className="mb-1.5 flex justify-between font-mono text-[10px] uppercase tracking-[0.15em]">
                <span>{x.l}</span>
                <span className="text-gold">
                  {x.n}/{x.t}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-line">
                <motion.div
                  className="h-full rounded-full bg-gold"
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.max(1, (x.n / x.t) * 100)}%` }}
                  transition={{ duration: 1, ease: EASE }}
                />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-11 gap-1 sm:grid-cols-[repeat(22,minmax(0,1fr))]">
          {books.map((b) => {
            const n = app.chaptersRead.filter((k) => k.startsWith(b.id + ":")).length;
            const o = n === 0 ? 0 : Math.min(1, 0.25 + n / b.chapters);
            return (
              <button
                key={b.id}
                onClick={() => app.openReader({ bookId: b.id, chapter: 1 })}
                title={`${b.name}: ${n}/${b.chapters}`}
                className="aspect-square rounded-[4px] border border-line/60"
                style={{ background: n ? `rgba(223,178,86,${o})` : "transparent" }}
              />
            );
          })}
        </div>
        <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.15em] text-mist">
          Each square is a book · Genesis → Revelation · tap to open
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {seasons
          .filter((s) => s.status === "live")
          .map((s) => (
            <button
              key={s.id}
              onClick={() => app.go("seasons")}
              className="flex items-center gap-3 rounded-2xl border border-line/80 bg-night2/60 p-3 text-left hover:border-gold/40"
            >
              {s.poster && <img src={s.poster} alt="" className="h-16 w-12 rounded-lg object-cover" />}
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-gold">Season {s.n}</p>
                <p className="truncate font-fraunces text-base font-semibold">{s.title}</p>
                <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full bg-gold" style={{ width: `${seasonProgress(s, app.done)}%` }} />
                </div>
              </div>
            </button>
          ))}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-3xl border border-line/80 bg-night2/60 p-6">
          <div className="flex items-center justify-between">
            <p className="flex items-center gap-2 font-fraunces text-xl font-semibold">
              <Sparkles className="h-4 w-4 text-gold" /> My questions
            </p>
            {app.questions.length > 0 && (
              <a
                href={wa(digest)}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-wa/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-wa"
              >
                <MessageCircle className="h-3 w-3" /> Send to group
              </a>
            )}
          </div>
          <p className="mt-1 font-newsreader text-sm text-mist">
            Everything you asked while reading, collected so you can take it to your cell group or pastor.
          </p>
          <div className="mt-4 space-y-2.5">
            {app.questions.length === 0 && (
              <p className="rounded-xl border border-dashed border-line p-4 text-center font-newsreader text-mist">
                Tap any verse and press Ask. Your questions land here.
              </p>
            )}
            {app.questions.map((q) => (
              <div key={q.id} className="rounded-2xl border border-line/70 bg-night/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-newsreader text-[16px] text-parchment">{q.q}</p>
                  <button onClick={() => app.removeQuestion(q.id)} className="rounded-full p-1 text-mist/50 hover:text-ember" aria-label="Delete question">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <p className="mt-1 line-clamp-2 font-newsreader text-sm text-mist">{q.a}</p>
                <button onClick={() => open(q.ref)} className="mt-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gold">
                  {q.ref} →
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-line/80 bg-night2/60 p-6">
          <p className="flex items-center gap-2 font-fraunces text-xl font-semibold">
            <Highlighter className="h-4 w-4 text-gold" /> Highlights
          </p>
          <div className="mt-4 space-y-2">
            {Object.keys(app.highlights).length === 0 && (
              <p className="rounded-xl border border-dashed border-line p-4 text-center font-newsreader text-mist">
                Tap a verse and choose a colour.
              </p>
            )}
            {Object.entries(app.highlights).map(([ref, c]) => (
              <button key={ref} onClick={() => open(ref)} className="flex w-full items-center gap-3 rounded-xl border border-line/70 px-4 py-3 text-left hover:border-gold/40">
                <span className={`h-3 w-3 rounded-full ${c === "gold" ? "bg-gold" : c === "sage" ? "bg-sage" : "bg-ember"}`} />
                <span className="flex-1 font-newsreader text-[16px]">{ref}</span>
                <BookOpen className="h-4 w-4 text-mist" />
              </button>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-gold/30 bg-gold/[0.06] p-5">
            <UserPlus className="h-5 w-5 text-gold" />
            <p className="mt-2 font-fraunces text-lg font-semibold">Reading is easier together</p>
            <p className="font-newsreader text-sm text-mist">Invite 3 friends and start a group streak.</p>
            <a
              href={wa("Join me on Berean 📖 — the Bible in seasons, with games, instant answers and a group streak. Let's keep each other accountable.")}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 rounded-full bg-wa px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] text-night"
            >
              <MessageCircle className="h-3.5 w-3.5" /> Invite on WhatsApp
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ------------------------------- Screen ------------------------------- */

const TABS = [
  { id: "progress", label: "Progress" },
  { id: "profile", label: "Profile" },
  { id: "offline", label: "Offline library" },
] as const;

export default function Me() {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("progress");
  const app = useApp();

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${
              tab === t.id ? "bg-gold text-night" : "border border-line text-mist hover:text-parchment"
            }`}
          >
            {t.label}
          </button>
        ))}
        <span className="ml-auto flex items-center gap-2 rounded-full border border-line/70 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
          <Check className="h-3 w-3 text-sage" /> Signed in on this device
        </span>
      </div>

      <div className="mt-6">
        {tab === "progress" && <ProgressTab />}
        {tab === "profile" && <ProfileTab />}
        {tab === "offline" && <OfflineTab />}
      </div>

      <section className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line/60 p-4">
        <p className="flex-1 font-mono text-[10px] uppercase tracking-[0.15em] text-mist">
          Prototype controls · progress, questions and saved Scripture stay on this device
        </p>
        <button
          onClick={app.resetNew}
          className="flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] hover:border-gold/50"
        >
          <RotateCcw className="h-3 w-3" /> Start as a new user
        </button>
        <button
          onClick={app.resetDemo}
          className="flex items-center gap-2 rounded-full border border-line px-4 py-2 font-mono text-[10px] uppercase tracking-[0.15em] hover:border-gold/50"
        >
          <RotateCcw className="h-3 w-3" /> Load demo profile
        </button>
      </section>
    </div>
  );
}
