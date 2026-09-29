import { useEffect, useRef, useState } from "react";
import { animate, useInView } from "framer-motion";
import { Plus } from "lucide-react";
import SectionHeading from "./SectionHeading";
import FadeIn from "./FadeIn";
import { stats } from "../data/portfolio";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

function Stat({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, value, {
      duration: 1.8,
      ease: EASE,
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value]);

  return (
    <div ref={ref} className="border-l border-white/10 pl-5">
      <div className="font-display text-4xl font-bold tracking-tight text-bone md:text-5xl">
        {display}
        <span className="text-lime">{suffix}</span>
      </div>
      <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
        {label}
      </div>
    </div>
  );
}

const services = [
  "Frontend Architecture",
  "Design Systems",
  "API & Backend",
  "Performance",
  "DevOps & Infra",
  "Technical Leadership",
];

export default function About() {
  return (
    <section id="about" className="px-6 py-24 md:px-10 md:py-36">
      <SectionHeading index="01" title="About me" note="Who I am" />

      <div className="grid gap-12 md:grid-cols-12 md:gap-8">
        <FadeIn className="md:col-span-5">
          <div className="group relative overflow-hidden rounded-xl" data-hover>
            <img
              src="images/portrait.jpg"
              alt="Portrait of Julian Voss"
              className="aspect-[4/5] w-full object-cover grayscale transition-all duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
            />
            <div className="absolute bottom-4 left-4 rounded-full border border-white/20 bg-ink/60 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-bone backdrop-blur-md">
              Julian Voss — SF, CA
            </div>
            <div className="absolute right-4 top-4 h-2 w-2 animate-pulse-dot rounded-full bg-lime" />
          </div>
        </FadeIn>

        <div className="md:col-span-7 md:pl-6">
          <FadeIn delay={0.1}>
            <p className="font-display text-2xl font-medium leading-snug tracking-tight text-bone md:text-4xl">
              I build software that feels{" "}
              <span className="text-lime">inevitable</span> — fast, dependable, and
              quietly beautiful.
            </p>
          </FadeIn>
          <FadeIn delay={0.18}>
            <p className="mt-6 max-w-xl leading-relaxed text-muted">
              For the past 7 years I've moved up and down the stack: from GPU-accelerated
              data visualizations to distributed systems handling billions of events. I
              care about the details users never see — the cache hit, the dropped frame,
              the p99 latency — because those details are exactly what they feel.
            </p>
            <p className="mt-4 max-w-xl leading-relaxed text-muted">
              When I'm not shipping, I'm maintaining open-source tools, mentoring junior
              engineers, or chasing trails in the Marin Headlands.
            </p>
          </FadeIn>

          <FadeIn delay={0.26}>
            <div className="mt-10">
              <div className="mb-4 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
                / What I do
              </div>
              <div className="flex flex-wrap gap-2.5">
                {services.map((s) => (
                  <span
                    key={s}
                    className="flex items-center gap-1.5 rounded-full border border-white/12 px-4 py-2 text-xs text-bone/80 transition-colors duration-300 hover:border-lime/60 hover:text-lime"
                    data-hover
                  >
                    <Plus className="h-3 w-3 text-lime" />
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      <FadeIn delay={0.1} className="mt-16 md:mt-24">
        <div className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {stats.map((s) => (
            <Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
