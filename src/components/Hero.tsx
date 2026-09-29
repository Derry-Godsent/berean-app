import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, MapPin } from "lucide-react";
import { scrollToSection } from "../lib/scroll";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function Line({ children, delay }: { children: React.ReactNode; delay: number }) {
  return (
    <div className="overflow-hidden">
      <motion.div
        initial={{ y: "112%" }}
        animate={{ y: 0 }}
        transition={{ duration: 1.1, delay, ease: EASE }}
      >
        {children}
      </motion.div>
    </div>
  );
}

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, 220]);
  const opacity = useTransform(scrollYProgress, [0, 0.85], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-svh flex-col justify-end overflow-hidden px-6 pb-8 pt-28 md:px-10"
    >
      {/* faint grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(236,238,232,0.04) 1px, transparent 1px)",
          backgroundSize: "clamp(60px, 8vw, 120px) 100%",
        }}
      />
      {/* lime glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-[-20%] h-[60vh] w-[60vh] rounded-full bg-lime/[0.07] blur-[120px]"
      />

      <motion.div style={{ y, opacity }} className="relative">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted md:mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.9 }}
          >
            Portfolio — Vol. 04
          </motion.span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="hidden items-center gap-2 md:flex"
          >
            <MapPin className="h-3 w-3 text-lime" />
            San Francisco, CA
          </motion.span>
        </div>

        <h1 className="font-display font-bold uppercase leading-[0.84] tracking-[-0.03em]">
          <Line delay={0.15}>
            <span className="block text-[clamp(4.2rem,15vw,13.5rem)] text-bone">
              Julian
            </span>
          </Line>
          <Line delay={0.28}>
            <span className="flex items-center gap-4 text-[clamp(4.2rem,15vw,13.5rem)]">
              <span className="text-stroke">Voss</span>
              <span className="mt-2 inline-block h-[0.14em] w-[0.5em] bg-lime" />
            </span>
          </Line>
        </h1>

        <div className="mt-10 flex flex-col justify-between gap-8 md:mt-14 md:flex-row md:items-end">
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.75, ease: EASE }}
            className="max-w-md text-base leading-relaxed text-muted md:text-lg"
          >
            Software engineer crafting{" "}
            <span className="text-bone">resilient systems</span> and{" "}
            <span className="text-bone">sharp interfaces</span> — turning complex
            problems into fast, elegant products.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.95, ease: EASE }}
            onClick={() => scrollToSection("#work")}
            className="group relative flex h-28 w-28 shrink-0 items-center justify-center self-start rounded-full border border-white/15 transition-colors duration-300 hover:border-lime md:self-end"
            aria-label="Scroll to work"
          >
            <span className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-white/10 group-hover:border-lime/40" />
            <motion.span
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="h-5 w-5 text-bone transition-colors group-hover:text-lime" />
            </motion.span>
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.2 }}
        className="relative mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted md:text-[11px]"
      >
        <span>Senior Software Engineer</span>
        <span className="hidden md:inline">Currently @ Nova Systems</span>
        <span className="text-lime">7+ yrs / 48 projects</span>
      </motion.div>
    </section>
  );
}
