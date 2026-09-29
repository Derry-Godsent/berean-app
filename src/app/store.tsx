import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { seedMessages, type Msg } from "../data/community";
import { episodeById } from "../data/seasons";

export type Screen = "home" | "seasons" | "read" | "play" | "journey" | "room" | "studio" | "me";

export interface ReaderLoc {
  bookId: string;
  chapter: number;
  verse?: number;
  episodeId?: string;
}

export interface Question {
  id: string;
  q: string;
  a: string;
  ref: string;
  at: number;
}

interface Persisted {
  done: string[];
  chaptersRead: string[];
  readDates: string[];
  highlights: Record<string, string>;
  questions: Question[];
  messages: Record<string, Msg[]>;
  translation: "kjv" | "web";
  fontScale: number;
  paper: boolean;
  remind: boolean;
  mirrorSeen: string;
  name: string;
}

interface AppState extends Persisted {
  screen: Screen;
  reader: ReaderLoc;
  roomChannel: string;
  go: (s: Screen) => void;
  openReader: (loc: ReaderLoc) => void;
  openRoom: (channel: string, draft?: string) => void;
  roomDraft: string;
  setRoomDraft: (d: string) => void;
  setRoomChannel: (c: string) => void;
  setTranslation: (t: "kjv" | "web") => void;
  setFontScale: (n: number) => void;
  setPaper: (b: boolean) => void;
  setRemind: (b: boolean) => void;
  dismissMirror: () => void;
  markChapter: (bookId: string, chapter: number) => void;
  completeEpisode: (id: string) => void;
  toggleHighlight: (ref: string, color: string) => void;
  addQuestion: (q: Omit<Question, "id" | "at">) => void;
  removeQuestion: (id: string) => void;
  postMessage: (channel: string, text: string) => Msg;
  react: (channel: string, id: string, kind: "pray" | "fire" | "heart") => void;
  resetDemo: () => void;
  resetNew: () => void;
  streak: number;
  readToday: boolean;
  daysSinceRead: number | null;
  today: string;
}

const KEY = "berean:app:v2";

export function dateKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return dateKey(d);
}

function demoState(): Persisted {
  const done = ["s1e1", "s1e2", "s1e3", "s1e4", "s1e5", "s1e6", "s2e1", "s2e2", "s2e3"];
  const chaptersRead = done
    .map((id) => episodeById(id))
    .filter(Boolean)
    .map((e) => `${e!.bookId}:${e!.chapter}`);
  return {
    done,
    chaptersRead: [...new Set([...chaptersRead, "PSA:1", "PSA:23", "JHN:3", "PHP:4"])],
    readDates: [1, 2, 3, 4, 5, 6].map(daysAgo),
    highlights: { "Matthew 6:21": "gold", "Proverbs 3:5": "sage" },
    questions: [
      {
        id: "demo-q1",
        q: "What does “mammon” mean?",
        a: "An Aramaic word for wealth or money — Jesus pictures it as a rival master.",
        ref: "Matthew 6:24",
        at: Date.now() - 86400000,
      },
    ],
    messages: seedMessages,
    translation: "kjv",
    fontScale: 1,
    paper: false,
    remind: false,
    mirrorSeen: "",
    name: "Friend",
  };
}

function freshState(): Persisted {
  return {
    ...demoState(),
    done: [],
    chaptersRead: [],
    readDates: [],
    highlights: {},
    questions: [],
    remind: false,
    mirrorSeen: "",
  };
}

function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...demoState(), ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return demoState();
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [p, setP] = useState<Persisted>(load);
  const [screen, setScreen] = useState<Screen>("home");
  const [reader, setReader] = useState<ReaderLoc>({ bookId: "LUK", chapter: 16, episodeId: "s2e4" });
  const [roomChannel, setRoomChannel] = useState<string>("room");
  const [roomDraft, setRoomDraft] = useState("");

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch {
      /* storage full or unavailable */
    }
  }, [p]);

  const today = dateKey();
  const readToday = p.readDates.includes(today);

  const streak = useMemo(() => {
    const set = new Set(p.readDates);
    let n = 0;
    let i = set.has(today) ? 0 : 1;
    while (set.has(daysAgo(i))) {
      n++;
      i++;
    }
    return n;
  }, [p.readDates, today]);

  const daysSinceRead = useMemo(() => {
    if (!p.readDates.length) return null;
    for (let i = 0; i < 400; i++) if (p.readDates.includes(daysAgo(i))) return i;
    return null;
  }, [p.readDates]);

  const patch = useCallback((u: Partial<Persisted> | ((s: Persisted) => Partial<Persisted>)) => {
    setP((s) => ({ ...s, ...(typeof u === "function" ? u(s) : u) }));
  }, []);

  const go = useCallback((s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const openReader = useCallback((loc: ReaderLoc) => {
    setReader(loc);
    setScreen("read");
    window.scrollTo({ top: 0 });
  }, []);

  const openRoom = useCallback((channel: string, draft = "") => {
    setRoomChannel(channel);
    setRoomDraft(draft);
    setScreen("room");
    window.scrollTo({ top: 0 });
  }, []);

  const markChapter = useCallback(
    (bookId: string, chapter: number) =>
      patch((s) => ({
        chaptersRead: s.chaptersRead.includes(`${bookId}:${chapter}`)
          ? s.chaptersRead
          : [...s.chaptersRead, `${bookId}:${chapter}`],
        readDates: s.readDates.includes(dateKey()) ? s.readDates : [...s.readDates, dateKey()],
      })),
    [patch]
  );

  const completeEpisode = useCallback(
    (id: string) => {
      const e = episodeById(id);
      patch((s) => ({
        done: s.done.includes(id) ? s.done : [...s.done, id],
        chaptersRead:
          e && !s.chaptersRead.includes(`${e.bookId}:${e.chapter}`)
            ? [...s.chaptersRead, `${e.bookId}:${e.chapter}`]
            : s.chaptersRead,
        readDates: s.readDates.includes(dateKey()) ? s.readDates : [...s.readDates, dateKey()],
      }));
    },
    [patch]
  );

  const toggleHighlight = useCallback(
    (ref: string, color: string) =>
      patch((s) => {
        const h = { ...s.highlights };
        if (h[ref] === color) delete h[ref];
        else h[ref] = color;
        return { highlights: h };
      }),
    [patch]
  );

  const addQuestion = useCallback(
    (q: Omit<Question, "id" | "at">) =>
      patch((s) => ({
        questions: [{ ...q, id: Math.random().toString(36).slice(2), at: Date.now() }, ...s.questions],
      })),
    [patch]
  );

  const removeQuestion = useCallback(
    (id: string) => patch((s) => ({ questions: s.questions.filter((q) => q.id !== id) })),
    [patch]
  );

  const postMessage = useCallback(
    (channel: string, text: string): Msg => {
      const now = new Date();
      const msg: Msg = {
        id: Math.random().toString(36).slice(2),
        user: "You",
        city: "Here",
        flag: "✨",
        color: "#f4efe4",
        text,
        time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        reactions: { pray: 0, fire: 0, heart: 0 },
        mine: true,
      };
      patch((s) => ({ messages: { ...s.messages, [channel]: [...(s.messages[channel] ?? []), msg] } }));
      return msg;
    },
    [patch]
  );

  const react = useCallback(
    (channel: string, id: string, kind: "pray" | "fire" | "heart") =>
      patch((s) => ({
        messages: {
          ...s.messages,
          [channel]: (s.messages[channel] ?? []).map((m) =>
            m.id === id ? { ...m, reactions: { ...m.reactions, [kind]: m.reactions[kind] + 1 } } : m
          ),
        },
      })),
    [patch]
  );

  const value: AppState = {
    ...p,
    screen,
    reader,
    roomChannel,
    roomDraft,
    setRoomDraft,
    setRoomChannel,
    go,
    openReader,
    openRoom,
    setTranslation: (t) => patch({ translation: t }),
    setFontScale: (n) => patch({ fontScale: Math.min(1.4, Math.max(0.85, n)) }),
    setPaper: (b) => patch({ paper: b }),
    setRemind: (b) => patch({ remind: b }),
    dismissMirror: () => patch({ mirrorSeen: dateKey() }),
    markChapter,
    completeEpisode,
    toggleHighlight,
    addQuestion,
    removeQuestion,
    postMessage,
    react,
    resetDemo: () => setP(demoState()),
    resetNew: () => setP(freshState()),
    streak,
    readToday,
    daysSinceRead,
    today,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useApp must be used inside AppProvider");
  return c;
}

export const wa = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;
