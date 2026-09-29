import { ArrowUpRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import FadeIn from "./FadeIn";
import { experience } from "../data/portfolio";

export default function Experience() {
  return (
    <section id="experience" className="px-6 py-24 md:px-10 md:py-36">
      <SectionHeading index="04" title="Experience" note="The journey" />

      <div className="border-b border-white/10">
        {experience.map((e, i) => (
          <FadeIn key={e.role} delay={i * 0.05}>
            <div
              className="group grid gap-4 border-t border-white/10 px-2 py-8 transition-colors duration-300 hover:bg-white/[0.03] md:grid-cols-12 md:items-baseline md:gap-6 md:px-4 md:py-10"
              data-hover
            >
              <div className="flex items-center gap-3 font-mono text-[11px] tracking-[0.2em] text-muted md:col-span-3">
                {e.current && (
                  <span className="inline-block h-1.5 w-1.5 animate-pulse-dot rounded-full bg-lime" />
                )}
                {e.period}
              </div>
              <div className="md:col-span-4">
                <h3 className="font-display text-2xl font-bold tracking-tight text-bone transition-colors duration-300 group-hover:text-lime md:text-3xl">
                  {e.role}
                </h3>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
                  {e.company} — {e.type}
                </p>
              </div>
              <p className="max-w-md text-sm leading-relaxed text-muted md:col-span-4">
                {e.description}
              </p>
              <div className="hidden justify-end md:col-span-1 md:flex">
                <ArrowUpRight className="h-5 w-5 text-lime opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
              </div>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
