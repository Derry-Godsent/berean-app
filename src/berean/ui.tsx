import { useInstall } from "../app/install";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { motion } from "framer-motion";

/* ------------------------------------------------------------------
   App state — reading streak, saved verses, notes, prayer wall
   ------------------------------------------------------------------ */

interface BereanState {
  mode: "night" | "day";
  setMode: (m: "night" | "day") => void;
  readToday: boolean;
  markRead: () => void;
  streak: number;
  saved: number[];
  toggleSave: (v: number) => void;
  note: string;
  setNote: (n: string) => void;
  prayers: { name: string; text: string; time: string; praying: number }[];
  addPrayer: (text: string) => void;
  memoryDone: boolean;
  setMemoryDone: (v: boolean) => void;
}

const Ctx = createContext<BereanState | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<"night" | "day">("night");
  const [readToday, setReadToday] = useState(false);
  const [streak, setStreak] = useState(5);
  const [saved, setSaved] = useState<number[]>([]);
  const [note, setNote] = useState("");
  const [memoryDone, setMemoryDone] = useState(false);
  const [prayers, setPrayers] = useState([
    { name: "Abena Owusu", text: "For my brother's job interview on Friday.", time: "2h", praying: 9 },
    { name: "Kwabena Mensah", text: "Grateful — my mother's surgery went well. Thank you all.", time: "5h", praying: 14 },
    { name: "Naa Adjeley", text: "Struggling to read consistently in the mornings. Praying for discipline.", time: "1d", praying: 6 },
  ]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("berean:v1");
      if (raw) {
        const p = JSON.parse(raw);
        setSaved(p.saved ?? []);
        setNote(p.note ?? "");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("berean:v1", JSON.stringify({ saved, note }));
    } catch {
      /* ignore */
    }
  }, [saved, note]);

  const markRead = useCallback(() => {
    setReadToday(true);
    setStreak((s) => (readToday ? s : s + 1));
  }, [readToday]);

  const toggleSave = useCallback((v: number) => {
    setSaved((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  }, []);

  const addPrayer = useCallback((text: string) => {
    setPrayers((p) => [{ name: "You", text, time: "now", praying: 0 }, ...p]);
  }, []);

  const value = useMemo(
    () => ({
      mode, setMode, readToday, markRead, streak, saved, toggleSave,
      note, setNote, prayers, addPrayer, memoryDone, setMemoryDone,
    }),
    [mode, readToday, markRead, streak, saved, toggleSave, note, prayers, addPrayer, memoryDone]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBerean() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useBerean must be used inside StoreProvider");
  return c;
}

/* ------------------------------------------------------------------
   Shared UI
   ------------------------------------------------------------------ */

export function Mark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {/* open book */}
      <path d="M12 6.6C10.3 5.2 7.9 4.6 4.5 4.6v11.1c3.4 0 5.8.6 7.5 2 1.7-1.4 4.1-2 7.5-2V4.6c-3.4 0-5.8.6-7.5 2Z" />
      <path d="M12 6.6v11.1" />
      {/* small cross above the spine */}
      <path d="M12 1.6v2.6M10.9 2.5h2.2" strokeWidth="1.3" />
    </svg>
  );
}

export function Card({
  children,
  className = "",
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const Tag = onClick ? "button" : "div";
  return (
    <Tag
      onClick={onClick}
      className={`w-full rounded-2xl border border-line/80 bg-night2/70 text-left backdrop-blur ${
        onClick ? "transition-colors duration-300 hover:border-gold/40" : ""
      } ${className}`}
    >
      {children}
    </Tag>
  );
}

export function Label({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`font-mono text-[10px] uppercase tracking-[0.28em] text-mist ${className}`}
    >
      {children}
    </div>
  );
}

/** Shown above screens that still run on made-up data, so nobody mistakes them for real people. */
export function SampleBanner({ what = "This screen" }: { what?: string }) {
  return (
    <div role="note" className="border border-dashed border-line bg-night2 px-3 py-2 font-mono text-[11px] leading-relaxed text-mist">
      Sample preview: {what} shows made-up names and numbers to demonstrate how it will work. It is not connected to real people yet.
    </div>
  );
}

export function Pill({
  children,
  tone = "line",
  className = "",
}: {
  children: ReactNode;
  tone?: "line" | "gold" | "sage" | "wa";
  className?: string;
}) {
  const tones = {
    line: "border-line text-mist",
    gold: "border-gold/40 text-gold",
    sage: "border-sage/40 text-sage",
    wa: "border-wa/40 text-wa",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function StreakRing({
  value,
  size = 96,
  label = "day streak",
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const r = size / 2 - 7;
  const c = 2 * Math.PI * r;
  const pct = Math.min(value / 30, 1);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="currentColor" strokeWidth="4" fill="none" className="text-line" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          strokeWidth="4"
          fill="none"
          strokeLinecap="round"
          className="text-gold"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - c * pct }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-fraunces text-3xl font-semibold leading-none text-parchment">
          {value}
        </span>
        <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.2em] text-mist">
          {label}
        </span>
      </div>
    </div>
  );
}

export function Meter({ pct, className = "" }: { pct: number; className?: string }) {
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-line ${className}`}>
      <motion.div
        className="h-full rounded-full bg-gold"
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
      />
    </div>
  );
}

export function Avatar({ initials, read }: { initials: string; read: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`relative flex h-11 w-11 items-center justify-center rounded-full border font-mono text-[11px] ${
          read
            ? "border-gold/60 bg-gold/15 text-gold"
            : "border-line bg-night3 text-mist"
        }`}
      >
        {initials}
        {!read && (
          <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-night bg-ember" />
        )}
      </div>
    </div>
  );
}

export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Invites people to put Berean on their home screen. Renders nothing when it can't help. */
export function InstallCard({ className = "" }: { className?: string }) {
  const s = useInstall();
  if (s.kind === "hidden") return null;
  return (
    <div className={`flex flex-col gap-3 border border-line bg-night2 p-4 sm:flex-row sm:items-center ${className}`}>
      <Mark className="h-7 w-7 shrink-0 text-gold" />
      <div className="min-w-0 flex-1">
        <p className="font-fraunces text-[18px] font-semibold leading-snug text-parchment">Keep Berean on your phone</p>
        <p className="mt-0.5 text-[14px] leading-relaxed text-mist">
          {s.kind === "ios"
            ? "Tap the Share button at the bottom of Safari, then choose “Add to Home Screen”. It opens like an app and works offline."
            : "Add it to your home screen. It opens like an app, works offline, and takes almost no space."}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {s.kind === "prompt" && (
          <button onClick={s.install} className="bg-parchment px-4 py-2.5 text-[13px] font-medium text-night hover:bg-gold">
            Install
          </button>
        )}
        <button onClick={s.dismiss} className="px-3 py-2.5 text-[13px] text-mist hover:text-parchment">
          Not now
        </button>
      </div>
    </div>
  );
}
