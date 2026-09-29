import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { initLenis, startLenis, stopLenis } from "./lib/scroll";
import Cursor from "./components/Cursor";
import Preloader from "./components/Preloader";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Marquee from "./components/Marquee";
import About from "./components/About";
import Projects from "./components/Projects";
import Stack from "./components/Stack";
import Experience from "./components/Experience";
import Contact from "./components/Contact";
import Berean from "./berean/Berean";
import { BookOpen } from "lucide-react";

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  return (
    <motion.div
      className="fixed inset-x-0 top-0 z-[190] h-[2px] origin-left bg-lime"
      style={{ scaleX }}
    />
  );
}

function Portfolio({ onOpenBerean }: { onOpenBerean: () => void }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initLenis();
    stopLenis();
  }, []);

  const handleDone = useCallback(() => {
    setLoading(false);
    startLenis();
  }, []);

  return (
    <div className="relative min-h-screen bg-ink font-body text-bone">
      <Cursor />
      <AnimatePresence>
        {loading && <Preloader key="preloader" onDone={handleDone} />}
      </AnimatePresence>

      {!loading && (
        <>
          <ScrollProgress />
          <Navbar />
          <main>
            <Hero />
            <Marquee />
            <About />
            <Projects />
            <Stack />
            <Experience />
            <Contact />
          </main>

          {/* Berean app entry point */}
          <a
            href="#/"
            onClick={onOpenBerean}
            className="group fixed bottom-5 left-1/2 z-[150] flex -translate-x-1/2 items-center gap-2 rounded-full border border-lime/40 bg-ink/90 px-4 py-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-bone backdrop-blur-md transition-colors hover:border-lime hover:text-lime md:left-auto md:right-6 md:translate-x-0"
          >
            <BookOpen className="h-3.5 w-3.5 text-lime" />
            Berean — new prototype
          </a>
        </>
      )}

      <div className="noise" aria-hidden />
    </div>
  );
}

export default function App() {
  const read = () =>
    (typeof window !== "undefined" ? window.location.hash.replace(/^#/, "") : "") || "/";
  const [route, setRoute] = useState(read);

  useEffect(() => {
    const onHash = () => {
      setRoute(read());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // The Berean app is the main experience; the portfolio lives at #/portfolio
  if (route.startsWith("/portfolio")) {
    return <Portfolio onOpenBerean={() => undefined} />;
  }
  return <Berean />;
}
