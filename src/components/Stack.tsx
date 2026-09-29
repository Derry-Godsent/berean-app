import { Cloud, Code2, Server, Wrench } from "lucide-react";
import SectionHeading from "./SectionHeading";
import FadeIn from "./FadeIn";
import { stack } from "../data/portfolio";

const icons = [Code2, Server, Cloud, Wrench];

export default function Stack() {
  return (
    <section id="stack" className="px-6 py-24 md:px-10 md:py-36">
      <SectionHeading index="03" title="Tech stack" note="Tools of choice" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stack.map((group, gi) => {
          const Icon = icons[gi % icons.length];
          return (
            <FadeIn key={group.title} delay={gi * 0.08}>
              <div
                className="group flex h-full flex-col rounded-xl border border-white/10 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-lime/50 hover:bg-panel"
                data-hover
              >
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-lime" />
                  <span className="font-mono text-[10px] text-muted">
                    0{gi + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-mono text-[11px] uppercase tracking-[0.3em] text-bone">
                  {group.title}
                </h3>
                <ul className="mt-5 flex flex-col">
                  {group.items.map((item, i) => (
                    <li
                      key={item}
                      className="flex items-baseline gap-3 border-t border-white/8 py-2.5 text-sm text-muted transition-colors duration-200 hover:text-bone"
                    >
                      <span className="font-mono text-[9px] text-lime/60">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          );
        })}
      </div>
    </section>
  );
}
