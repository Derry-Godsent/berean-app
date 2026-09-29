import { ArrowUpRight } from "lucide-react";
import SectionHeading from "./SectionHeading";
import FadeIn from "./FadeIn";
import { projects, miniProjects, type Project } from "../data/portfolio";

function FeaturedProject({ project, flip }: { project: Project; flip: boolean }) {
  return (
    <FadeIn>
      <article className="group grid items-center gap-8 md:grid-cols-12">
        <a
          href={project.link}
          target="_blank"
          rel="noreferrer"
          className={`relative block overflow-hidden rounded-xl md:col-span-7 ${
            flip ? "md:order-2" : ""
          }`}
          data-hover
        >
          <div className="relative overflow-hidden">
            <img
              src={project.image}
              alt={project.title}
              loading="lazy"
              className="aspect-[16/10] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent opacity-60 transition-opacity duration-500 group-hover:opacity-30" />
          </div>
          <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-ink/60 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.25em] text-bone backdrop-blur-md">
            {project.year}
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-lime text-ink">
              <ArrowUpRight className="h-7 w-7" />
            </span>
          </div>
        </a>

        <div className={`md:col-span-5 ${flip ? "md:order-1 md:pr-6" : "md:pl-6"}`}>
          <div className="flex items-center gap-3 font-mono text-xs text-lime">
            <span>{project.index}</span>
            <span className="h-px w-8 bg-lime/50" />
            <span className="uppercase tracking-[0.25em] text-muted">
              {project.role}
            </span>
          </div>
          <h3 className="mt-4 font-display text-3xl font-bold uppercase tracking-tight text-bone md:text-5xl">
            {project.title}
          </h3>
          <p className="mt-1 font-mono text-xs uppercase tracking-[0.2em] text-muted">
            {project.tagline}
          </p>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted md:text-base">
            {project.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {project.tags.map((t) => (
              <span
                key={t}
                className="rounded-full border border-white/12 px-3 py-1 font-mono text-[11px] text-bone/70"
              >
                {t}
              </span>
            ))}
          </div>
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            className="group/link mt-7 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-bone"
          >
            <span className="border-b border-lime/60 pb-0.5 transition-colors group-hover/link:text-lime">
              View case study
            </span>
            <ArrowUpRight className="h-3.5 w-3.5 text-lime transition-transform duration-300 group-hover/link:translate-x-1 group-hover/link:-translate-y-1" />
          </a>
        </div>
      </article>
    </FadeIn>
  );
}

export default function Projects() {
  return (
    <section id="work" className="px-6 py-24 md:px-10 md:py-36">
      <SectionHeading index="02" title="Selected work" note="2022 — 2024" />

      <div className="flex flex-col gap-24 md:gap-32">
        {projects.map((p, i) => (
          <FeaturedProject key={p.id} project={p} flip={i % 2 === 1} />
        ))}
      </div>

      <FadeIn className="mt-24 md:mt-32">
        <div className="mb-8 flex items-center gap-4">
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
            Other noteworthy experiments
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {miniProjects.map((m) => (
            <a
              key={m.title}
              href={m.link}
              target="_blank"
              rel="noreferrer"
              className="group rounded-xl border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-lime/50 hover:bg-panel"
              data-hover
            >
              <div className="flex items-start justify-between">
                <h4 className="font-display text-xl font-bold tracking-tight text-bone">
                  {m.title}
                </h4>
                <ArrowUpRight className="h-4 w-4 text-muted transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-lime" />
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted">{m.description}</p>
              <div className="mt-5 flex gap-2">
                {m.tags.map((t) => (
                  <span
                    key={t}
                    className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </FadeIn>
    </section>
  );
}
