import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUp, ArrowUpRight, Copy, Check } from "lucide-react";
import Magnetic from "./Magnetic";
import FadeIn from "./FadeIn";
import { email } from "../data/portfolio";
import { scrollToTop } from "../lib/scroll";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

const socials = [
  { label: "GitHub", href: "https://github.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "X / Twitter", href: "https://x.com" },
  { label: "Resume", href: "#" },
];

function useLocalTime() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "America/Los_Angeles",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return time;
}

export default function Contact() {
  const time = useLocalTime();
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <section id="contact" className="relative overflow-hidden px-6 pt-24 md:px-10 md:pt-36">
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-[-30%] left-1/2 h-[70vh] w-[90vw] -translate-x-1/2 rounded-full bg-lime/[0.05] blur-[140px]"
      />

      <FadeIn>
        <div className="flex items-center gap-4 font-mono text-xs tracking-[0.3em] text-lime">
          <span>05</span>
          <span className="h-px flex-1 bg-white/10" />
          <span className="uppercase text-muted">Let's talk</span>
        </div>
      </FadeIn>

      <div className="relative mt-14 text-center">
        <div className="overflow-hidden">
          <motion.h2
            className="font-display text-[clamp(3rem,11vw,10rem)] font-bold uppercase leading-[0.9] tracking-tight text-bone"
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: EASE }}
          >
            Have an idea?
          </motion.h2>
        </div>
        <div className="overflow-hidden">
          <motion.h2
            className="text-stroke-lime font-display text-[clamp(3rem,11vw,10rem)] font-bold uppercase leading-[0.9] tracking-tight"
            initial={{ y: "110%" }}
            whileInView={{ y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay: 0.12, ease: EASE }}
          >
            Let's build it
          </motion.h2>
        </div>

        <FadeIn delay={0.2}>
          <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-muted md:text-base">
            I'm currently open to senior engineering roles and select consulting
            projects. The inbox is always open — I'll get back within 24 hours.
          </p>
        </FadeIn>

        <FadeIn delay={0.3}>
          <div className="mt-12 flex flex-col items-center justify-center gap-5 sm:flex-row">
            <Magnetic strength={0.3}>
              <a
                href={`mailto:${email}`}
                className="group flex items-center gap-3 rounded-full bg-lime px-9 py-5 font-display text-base font-bold tracking-tight text-ink transition-transform duration-300 hover:scale-[1.03]"
              >
                {email}
                <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
              </a>
            </Magnetic>
            <Magnetic strength={0.3}>
              <button
                onClick={copyEmail}
                className="flex items-center gap-2 rounded-full border border-white/15 px-6 py-5 font-mono text-[11px] uppercase tracking-[0.25em] text-muted transition-colors duration-300 hover:border-lime hover:text-lime"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </button>
            </Magnetic>
          </div>
        </FadeIn>

        <FadeIn delay={0.4}>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noreferrer"
                className="group relative font-mono text-[11px] uppercase tracking-[0.25em] text-muted transition-colors duration-300 hover:text-bone"
              >
                {s.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-lime transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>
        </FadeIn>
      </div>

      <footer className="mt-24 border-t border-white/10 py-7 md:mt-32">
        <div className="flex flex-col items-center justify-between gap-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted md:flex-row">
          <span>© 2025 Julian Voss — All rights reserved</span>
          <span className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-lime" />
            San Francisco — {time} PT
          </span>
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-2 transition-colors duration-300 hover:text-lime"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-1" />
          </button>
        </div>
      </footer>
    </section>
  );
}
