import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

export default function Preloader({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCount((c) => {
        const next = c + Math.floor(Math.random() * 9) + 4;
        if (next >= 100) {
          window.clearInterval(id);
          window.setTimeout(onDone, 500);
          return 100;
        }
        return next;
      });
    }, 80);
    return () => window.clearInterval(id);
  }, [onDone]);

  return (
    <motion.div
      className="fixed inset-0 z-[300] flex flex-col justify-between bg-ink px-6 py-8 md:px-10"
      exit={{ y: "-100%" }}
      transition={{ duration: 0.9, ease: EASE }}
    >
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
        <span>Julian Voss</span>
        <span>Portfolio © 2025</span>
      </div>

      <div className="flex items-end justify-between gap-6">
        <div className="mb-4 flex flex-col gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-lime" />
            Initializing
          </span>
          <span className="text-bone/40">Compiling interface…</span>
        </div>
        <div className="font-display text-[clamp(5rem,20vw,16rem)] font-bold leading-none tracking-tighter text-bone">
          {count}
          <span className="text-lime">%</span>
        </div>
      </div>

      <div className="h-px w-full bg-white/10">
        <motion.div
          className="h-px origin-left bg-lime"
          style={{ scaleX: count / 100 }}
        />
      </div>
    </motion.div>
  );
}
