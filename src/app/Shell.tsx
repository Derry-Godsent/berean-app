import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Clapperboard,
  Flame,
  Gamepad2,
  Globe2,
  Home,
  Lightbulb,
  Mic2,
  MessagesSquare,
  User,
  X,
} from "lucide-react";
import { useApp, type Screen } from "./store";
import { useProfile } from "./profile";
import { SkinSwitch, useTheme } from "./theme";
import { nextEpisode, useCountdown, verseOfDay } from "./helpers";
import Onboarding from "../screens/Onboarding";
import { nextPremiere } from "../data/seasons";
import { parseRef } from "../data/bible";
import { Mark, EASE } from "../berean/ui";
import { Lamp } from "../berean/Lamp";

/** The one nav entry that carries the lamp (see docs/03-FUNDING.md). */
const LAMP_SCREEN: Screen = "support";

const NAV: { id: Screen; label: string; Icon: typeof Home; mobile?: boolean }[] = [
  { id: "home", label: "Home", Icon: Home, mobile: true },
  { id: "seasons", label: "Seasons", Icon: Clapperboard, mobile: true },
  { id: "read", label: "Bible", Icon: BookOpen, mobile: true },
  { id: "play", label: "Play", Icon: Gamepad2, mobile: true },
  { id: "room", label: "Room", Icon: MessagesSquare, mobile: true },
  { id: "journey", label: "Journey", Icon: Globe2 },
  { id: "studio", label: "Pastor Studio", Icon: Mic2 },
  { id: "me", label: "My Journey", Icon: User },
  { id: "support", label: "Support Berean", Icon: Lightbulb },
];

function Mirror({ paused }: { paused: boolean }) {
  const app = useApp();
  const [open, setOpen] = useState(false);
  const next = nextEpisode(app.done);
  const votd = verseOfDay();

  useEffect(() => {
    if (paused) return;
    if (!app.readToday && app.mirrorSeen !== app.today) {
      const id = window.setTimeout(() => setOpen(true), 1400);
      return () => window.clearTimeout(id);
    }
  }, [paused, app.readToday, app.mirrorSeen, app.today]);

  const close = () => {
    setOpen(false);
    app.dismissMirror();
  };

  const last =
    app.daysSinceRead === null
      ? "You haven't opened Scripture here yet"
      : app.daysSinceRead === 0
        ? "Today"
        : app.daysSinceRead === 1
          ? "Yesterday"
          : `${app.daysSinceRead} days ago`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/75 p-4 backdrop-blur-md sm:items-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gold/30 bg-night2"
          >

            <button onClick={close} className="absolute right-4 top-4 rounded-full p-1.5 text-mist hover:text-parchment" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
            <div className="relative p-6">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">An honest moment</p>
              <h2 className="mt-3 font-fraunces text-[30px] font-semibold leading-tight text-parchment">
                Before you scroll…
              </h2>
              <p className="mt-3 font-newsreader text-[16px] leading-relaxed text-mist">
                The average person spends over 3 hours a day on their phone. Could God have{" "}
                <span className="text-parchment">7 minutes</span> of yours?
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-line bg-night/60 p-3.5">
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist">Last time in the Word</p>
                  <p className="mt-1 font-fraunces text-lg font-semibold text-parchment">{last}</p>
                </div>
                <div className={`rounded-2xl border p-3.5 ${app.streak > 0 ? "border-ember/40 bg-ember/10" : "border-line bg-night/60"}`}>
                  <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist">Streak</p>
                  <p className="mt-1 flex items-center gap-1.5 font-fraunces text-lg font-semibold text-parchment">
                    <Flame className="h-4 w-4 text-ember" /> {app.streak} {app.streak === 1 ? "day" : "days"}
                  </p>
                  {app.streak > 0 && <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-ember">Ends at midnight</p>}
                </div>
              </div>

              <blockquote className="mt-5 border-l-2 border-gold/50 pl-4 font-newsreader text-[15px] italic text-parchment/90">
                “Thy word is a lamp unto my feet, and a light unto my path.”
                <cite className="mt-1 block font-mono text-[9px] not-italic uppercase tracking-[0.2em] text-gold">Psalm 119:105</cite>
              </blockquote>

              <div className="mt-6 flex flex-col gap-2">
                {next && (
                  <button
                    onClick={() => {
                      close();
                      app.openReader({ bookId: next.ep.bookId, chapter: next.ep.chapter, episodeId: next.ep.id });
                    }}
                    className="rounded-xl bg-gold px-5 py-3.5 font-fraunces text-base font-semibold text-night"
                  >
                    ▶ Give God {next.ep.minutes} minutes — S{next.season.n} E{next.ep.n}
                  </button>
                )}
                <button
                  onClick={() => {
                    close();
                    const p = parseRef(votd.ref);
                    if (p) app.openReader({ bookId: p.book.id, chapter: p.chapter, verse: p.verse });
                  }}
                  className="rounded-xl border border-line px-5 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-parchment hover:border-gold/50"
                >
                  I only have 1 minute — show me one verse
                </button>
                <button onClick={close} className="py-2 font-mono text-[10px] uppercase tracking-[0.18em] text-mist/70 hover:text-mist">
                  Not now
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PremiereMini() {
  const premiere = nextPremiere();
  const t = useCountdown(premiere?.at ?? null);
  const { go } = useApp();
  if (!premiere) return null;
  return (
    <button onClick={() => go("seasons")} className="w-full border border-ember/40 bg-night2 p-4 text-left transition-colors hover:border-ember">
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-ember">Season {premiere.season.n} premiere</p>
      <p className="mt-1 font-fraunces text-lg font-semibold text-parchment">{premiere.season.title}</p>
      <p className="mt-2 font-mono text-sm tabular-nums text-parchment">
        {t.d}d {String(t.h).padStart(2, "0")}:{String(t.m).padStart(2, "0")}:{String(t.s).padStart(2, "0")}
      </p>
    </button>
  );
}

export default function Shell({ children }: { children: ReactNode }) {
  const app = useApp();
  const { profile } = useProfile();
  const { skin } = useTheme();
  const [intro, setIntro] = useState(() => !profile);

  return (
    <div className={`berean-app theme-${skin} min-h-svh bg-night text-parchment`}>

      {/* Sidebar (desktop) */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line/70 bg-night/90 px-4 py-5 backdrop-blur-xl lg:flex">
        <button onClick={() => app.go("home")} className="mb-8 flex items-center gap-2.5 px-2">
          <Mark className="h-6 w-6 text-gold" />
          <span className="font-fraunces text-xl font-semibold tracking-tight">Berean</span>
        </button>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ id, label, Icon }) => {
            const on = app.screen === id;
            const lamp = id === LAMP_SCREEN;
            return (
              <button
                key={id}
                onClick={() => app.go(id)}
                className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  lamp
                    ? on
                      ? "bg-lamp/12 text-lamp"
                      : "text-lamp hover:bg-lamp/10"
                    : on
                      ? "bg-gold/12 text-gold"
                      : "text-mist hover:bg-white/[0.03] hover:text-parchment"
                }`}
              >
                {/* The lamp keeps glowing in the menu: the only item that is lit. */}
                {lamp ? <Lamp size={16} glow={2.6} /> : <Icon className="h-4 w-4" />}
                <span className="font-newsreader text-[16px]">{label}</span>
              </button>
            );
          })}
        </nav>
        <div className="mt-auto space-y-3">
          <PremiereMini />
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line/60 bg-night/80 backdrop-blur-xl lg:pl-64">
        <div className="mx-auto flex h-[60px] max-w-6xl items-center gap-3 px-4 sm:px-6">
          <button onClick={() => app.go("home")} className="flex items-center gap-2 lg:hidden">
            <Mark className="h-5 w-5 text-gold" />
            <span className="font-fraunces text-lg font-semibold">Berean</span>
          </button>
          <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-mist lg:block">
            {NAV.find((n) => n.id === app.screen)?.label}
          </p>
          <div className="ml-auto flex items-center gap-1.5">
            <SkinSwitch compact />
            <button
              onClick={() => app.go("me")}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px] ${
                app.readToday ? "border-ember/50 bg-ember/10 text-ember" : "border-line text-mist"
              }`}
              title={app.readToday ? "Streak kept today" : "Read today to keep your streak"}
            >
              <Flame className={`h-3.5 w-3.5 ${app.readToday ? "fill-ember" : ""}`} /> {app.streak}
            </button>
            <button onClick={() => app.go("journey")} className={`rounded-full p-2 lg:hidden ${app.screen === "journey" ? "text-gold" : "text-mist"}`} aria-label="Journey">
              <Globe2 className="h-4 w-4" />
            </button>
            <button onClick={() => app.go("studio")} className={`rounded-full p-2 lg:hidden ${app.screen === "studio" ? "text-gold" : "text-mist"}`} aria-label="Pastor Studio">
              <Mic2 className="h-4 w-4" />
            </button>
            {/* The lamp, always lit, on the smallest screens where there is no sidebar. */}
            <button
              onClick={() => app.go("support")}
              className={`rounded-full p-2 lg:hidden ${app.screen === "support" ? "bg-lamp/12" : ""}`}
              aria-label="Support Berean — keep the lamp lit"
              title="Keep the lamp lit"
            >
              <Lamp size={18} glow={2.2} />
            </button>
            <button onClick={() => app.go("me")} className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 bg-gold/10 font-mono text-[10px] text-gold" aria-label="My journey">
              ME
            </button>
          </div>
        </div>
      </header>

      <main className="relative lg:pl-64">
        <AnimatePresence mode="wait">
          <motion.div
            key={app.screen}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="mx-auto max-w-6xl px-4 pb-32 pt-5 sm:px-6 lg:pb-16"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom nav (mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line/70 bg-night/95 px-2 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-lg justify-between">
          {NAV.filter((n) => n.mobile).map(({ id, label, Icon }) => {
            const on = app.screen === id;
            return (
              <button key={id} onClick={() => app.go(id)} className={`relative flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 ${on ? "text-gold" : "text-mist"}`}>
                {on && <motion.span layoutId="navdot" className="absolute -top-2 h-0.5 w-8 rounded-full bg-gold" />}
                <Icon className="h-5 w-5" />
                <span className="font-mono text-[9px] uppercase tracking-[0.1em]">{label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      <Mirror paused={intro} />
      {intro && <Onboarding onDone={() => setIntro(false)} />}
    </div>
  );
}
