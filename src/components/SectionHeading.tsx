import { motion } from "framer-motion";

const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

interface SectionHeadingProps {
  index: string;
  title: string;
  note?: string;
}

export default function SectionHeading({ index, title, note }: SectionHeadingProps) {
  return (
    <div className="mb-14 md:mb-20">
      <motion.div
        className="flex items-center gap-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <span className="font-mono text-xs tracking-[0.3em] text-lime">{index}</span>
        <span className="h-px flex-1 bg-white/10" />
        {note && (
          <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
            {note}
          </span>
        )}
      </motion.div>
      <div className="mt-6 overflow-hidden">
        <motion.h2
          className="font-display text-[clamp(2.6rem,7vw,5.5rem)] font-bold uppercase leading-[0.95] tracking-tight text-bone"
          initial={{ y: "110%" }}
          whileInView={{ y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.9, delay: 0.08, ease: EASE }}
        >
          {title}
        </motion.h2>
      </div>
    </div>
  );
}
