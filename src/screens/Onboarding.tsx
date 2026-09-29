import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, Copy, MessageCircle, Sparkles } from "lucide-react";
import { useProfile, GOALS } from "../app/profile";
import { useApp, wa } from "../app/store";
import { Mark, EASE } from "../berean/ui";

function Field({
  label,
  value,
  onChange,
  placeholder,
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="block">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-mist">{label}</span>
      <input
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-line bg-night/70 px-5 py-4 font-newsreader text-xl text-parchment placeholder:text-mist/50 focus:border-gold/60 focus:outline-none"
      />
    </label>
  );
}

export default function Onboarding({ onDone }: { onDone: () => void }) {
  const { complete, profile } = useProfile();
  const { openReader } = useApp();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [church, setChurch] = useState("");
  const [goal, setGoal] = useState<string>("");
  const [copied, setCopied] = useState(false);

  const canNext = step === 0 ? name.trim().length > 0 : step === 1 ? true : goal !== "";

  const next = (e?: FormEvent) => {
    e?.preventDefault();
    if (!canNext) return;
    if (step === 2) complete({ name, city, church, goal });
    setStep((s) => s + 1);
  };

  return (
    <motion.div
      className="fixed inset-0 z-[120] overflow-y-auto bg-night"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="pointer-events-none absolute inset-0">
        <img src="images/s1-beginning.jpg" alt="" className="h-full w-full object-cover opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-b from-night/70 via-night/95 to-night" />
      </div>

      <div className="relative mx-auto flex min-h-svh max-w-xl flex-col px-6 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Mark className="h-6 w-6 text-gold" />
            <span className="font-fraunces text-xl font-semibold">Berean</span>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={`h-1 rounded-full transition-all duration-500 ${i <= step ? "w-8 bg-gold" : "w-3 bg-line"}`} />
            ))}
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center py-10">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease: EASE }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Let's set you up</p>
                <h1 className="mt-3 font-fraunces text-[clamp(2.2rem,8vw,3.4rem)] font-semibold leading-[1.05]">
                  First, what should we call you?
                </h1>
                <p className="mt-3 font-newsreader text-lg text-mist">
                  This is how your cell group and pastor will see you.
                </p>
                <form onSubmit={next} className="mt-8">
                  <Field label="Your name" value={name} onChange={setName} placeholder="e.g. Kwame" autoFocus />
                  <button type="submit" disabled={!canNext} className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold px-6 py-4 font-fraunces text-lg font-semibold text-night disabled:opacity-40">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease: EASE }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Where you worship</p>
                <h1 className="mt-3 font-fraunces text-[clamp(2.2rem,8vw,3.4rem)] font-semibold leading-[1.05]">
                  Faith grows in community.
                </h1>
                <p className="mt-3 font-newsreader text-lg text-mist">
                  Optional, but it unlocks cell-group streaks and your pastor's reading plans. You can change this anytime.
                </p>
                <form onSubmit={next} className="mt-8 space-y-5">
                  <Field label="City" value={city} onChange={setCity} placeholder="e.g. Accra" autoFocus />
                  <Field label="Church or cell group" value={church} onChange={setChurch} placeholder="e.g. Cornerstone Chapel" />
                  <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gold px-6 py-4 font-fraunces text-lg font-semibold text-night">
                    Continue <ArrowRight className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={() => setStep(2)} className="w-full py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mist hover:text-parchment">
                    Skip for now
                  </button>
                </form>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.45, ease: EASE }}>
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">One last thing</p>
                <h1 className="mt-3 font-fraunces text-[clamp(2.2rem,8vw,3.4rem)] font-semibold leading-[1.05]">
                  What brings you here, {name || "friend"}?
                </h1>
                <div className="mt-8 space-y-3">
                  {GOALS.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => setGoal(g.id)}
                      className={`flex w-full items-center gap-3 rounded-2xl border px-5 py-4 text-left transition-colors ${
                        goal === g.id ? "border-gold bg-gold/10" : "border-line bg-night/50 hover:border-gold/50"
                      }`}
                    >
                      <span className="text-2xl">{g.emoji}</span>
                      <span className="flex-1 font-newsreader text-lg">{g.label}</span>
                      {goal === g.id && <Check className="h-5 w-5 text-gold" />}
                    </button>
                  ))}
                </div>
                <button onClick={() => next()} disabled={!canNext} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-gold px-6 py-4 font-fraunces text-lg font-semibold text-night disabled:opacity-40">
                  Finish setup <Sparkles className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gold">
                  <Check className="h-8 w-8 text-night" />
                </div>
                <h1 className="mt-6 text-center font-fraunces text-[clamp(2.2rem,8vw,3.2rem)] font-semibold leading-[1.05]">
                  Welcome, {profile?.name || name}.
                </h1>
                <p className="mt-3 text-center font-newsreader text-lg text-mist">
                  Your account lives on this device. Your invite code brings your cell group in with you.
                </p>

                <div className="mt-8 rounded-2xl border border-gold/40 bg-gold/[0.08] p-5">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-gold">Your invite code</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <p className="font-fraunces text-3xl font-semibold tracking-wider">{profile?.code ?? "BRN-XXXX"}</p>
                    <button
                      onClick={() => {
                        navigator.clipboard?.writeText(profile?.code ?? "").catch(() => undefined);
                        setCopied(true);
                        setTimeout(() => setCopied(false), 1500);
                      }}
                      className="flex items-center gap-1.5 rounded-full border border-gold/50 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.15em] text-gold"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />} {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2.5">
                  <a
                    href={wa(`Join me on Berean 📖 — the Bible in seasons, with games, instant answers and group streaks.\n\nMy invite code: ${profile?.code}\n\nOpen the app and paste it in Profile → Join a cell group.`)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 rounded-2xl bg-wa px-6 py-4 font-fraunces text-lg font-semibold text-night"
                  >
                    <MessageCircle className="h-4 w-4" /> Invite my cell group
                  </a>
                  <button
                    onClick={() => {
                      onDone();
                      openReader({ bookId: "JHN", chapter: 1, episodeId: "s4e1" });
                    }}
                    className="flex items-center justify-center gap-2 rounded-2xl border border-line px-6 py-4 font-fraunces text-lg font-semibold text-parchment hover:border-gold/50"
                  >
                    Start reading: Season 4, Episode 1
                  </button>
                  <button onClick={onDone} className="w-full py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-mist hover:text-parchment">
                    I'll explore first
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {step > 0 && step < 3 && (
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} className="flex items-center gap-2 self-start font-mono text-[10px] uppercase tracking-[0.2em] text-mist hover:text-parchment">
            <ArrowLeft className="h-3 w-3" /> Back
          </button>
        )}
      </div>
    </motion.div>
  );
}
