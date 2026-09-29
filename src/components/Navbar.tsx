import { useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { scrollToSection, scrollToTop } from "../lib/scroll";

const EASE: [number, number, number, number] = [0.76, 0, 0.24, 1];

const links = [
  { label: "About", href: "#about", num: "01" },
  { label: "Work", href: "#work", num: "02" },
  { label: "Stack", href: "#stack", num: "03" },
  { label: "Experience", href: "#experience", num: "04" },
  { label: "Contact", href: "#contact", num: "05" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 60));

  const go = (href: string) => {
    setOpen(false);
    // wait for the menu to close before scrolling on mobile
    window.setTimeout(() => scrollToSection(href), open ? 350 : 0);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
        className={`fixed inset-x-0 top-0 z-[120] transition-colors duration-500 ${
          scrolled
            ? "border-b border-white/10 bg-ink/80 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <nav className="flex items-center justify-between px-6 py-4 md:px-10">
          <button
            onClick={scrollToTop}
            className="group flex items-baseline gap-1 font-display text-lg font-bold tracking-tight text-bone"
            aria-label="Back to top"
          >
            JV
            <span className="text-[10px] text-lime transition-transform duration-300 group-hover:rotate-90">
              ®
            </span>
          </button>

          <ul className="hidden items-center gap-8 lg:flex">
            {links.map((l) => (
              <li key={l.href}>
                <button
                  onClick={() => go(l.href)}
                  className="group relative font-mono text-[11px] uppercase tracking-[0.25em] text-muted transition-colors duration-300 hover:text-bone"
                >
                  <span className="mr-1 text-[9px] text-lime/70">{l.num}</span>
                  {l.label}
                  <span className="absolute -bottom-1 left-0 h-px w-0 bg-lime transition-all duration-300 group-hover:w-full" />
                </button>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-5">
            <button
              onClick={() => go("#contact")}
              className="group hidden items-center gap-2 rounded-full border border-white/15 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-bone transition-colors duration-300 hover:border-lime hover:text-lime sm:flex"
            >
              <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-lime" />
              Open to work
              <ArrowUpRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <button
              onClick={() => setOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-bone transition-colors hover:border-lime hover:text-lime lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[180] flex flex-col bg-ink px-6 py-6"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                Navigation
              </span>
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-bone transition-colors hover:border-lime hover:text-lime"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex flex-1 flex-col justify-center gap-2">
              {links.map((l, i) => (
                <div key={l.href} className="overflow-hidden">
                  <motion.button
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "110%" }}
                    transition={{ duration: 0.55, delay: 0.06 * i, ease: EASE }}
                    onClick={() => go(l.href)}
                    className="group flex items-baseline gap-4 text-left"
                  >
                    <span className="font-mono text-xs text-lime">{l.num}</span>
                    <span className="font-display text-5xl font-bold uppercase tracking-tight text-bone transition-colors group-hover:text-lime sm:text-6xl">
                      {l.label}
                    </span>
                  </motion.button>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
              <span>San Francisco, CA</span>
              <span>© 2025</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
