import { marqueeItems } from "../data/portfolio";

export default function Marquee() {
  const row = [...marqueeItems, ...marqueeItems];
  return (
    <div className="mask-x overflow-hidden border-y border-white/10 bg-panel py-5">
      <div className="flex w-max animate-marquee items-center gap-10">
        {row.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-10 font-mono text-sm uppercase tracking-[0.3em] text-muted"
          >
            {item}
            <span className="inline-block h-1.5 w-1.5 rotate-45 bg-lime" />
          </span>
        ))}
      </div>
    </div>
  );
}
