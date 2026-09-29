import { findBook, tagNames } from "../data/bible";
import { episodeById } from "../data/seasons";
import { useApp } from "./store";

export type Seg =
  | { type: "text"; v: string }
  | { type: "ref"; label: string; bookId: string; chapter: number; verse?: number }
  | { type: "ep"; label: string; epId: string };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const TAG_RE = new RegExp(
  `\\/(?:(S\\d+\\s?E\\d+)|(${tagNames.map(esc).join("|")})(?![a-z])(?:\\s+(\\d+)(?::(\\d+)(?:-(\\d+))?)?)?)`,
  "gi"
);

export function parseTags(text: string): Seg[] {
  const out: Seg[] = [];
  let last = 0;
  for (const m of text.matchAll(TAG_RE)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push({ type: "text", v: text.slice(last, idx) });
    if (m[1]) {
      const code = m[1].replace(/\s/g, "").toUpperCase();
      out.push({ type: "ep", label: code, epId: code.toLowerCase() });
    } else {
      const book = findBook(m[2]);
      if (book) {
        const chapter = m[3] ? Number(m[3]) : 1;
        const verse = m[4] ? Number(m[4]) : undefined;
        const label = `${book.name}${m[3] ? ` ${m[3]}` : ""}${m[4] ? `:${m[4]}` : ""}${m[5] ? `-${m[5]}` : ""}`;
        out.push({ type: "ref", label, bookId: book.id, chapter, verse });
      } else {
        out.push({ type: "text", v: m[0] });
      }
    }
    last = idx + m[0].length;
  }
  if (last < text.length) out.push({ type: "text", v: text.slice(last) });
  return out;
}

/** Collects episode ids referenced in a text (used for spoiler checks). */
export function episodesIn(text: string): string[] {
  return parseTags(text)
    .filter((s): s is Extract<Seg, { type: "ep" }> => s.type === "ep")
    .map((s) => s.epId);
}

export function TaggedText({ text }: { text: string }) {
  const { openReader, go } = useApp();
  return (
    <>
      {parseTags(text).map((s, i) => {
        if (s.type === "text") return <span key={i}>{s.v}</span>;
        if (s.type === "ep") {
          const ep = episodeById(s.epId);
          return (
            <button
              key={i}
              onClick={() => (ep ? openReader({ bookId: ep.bookId, chapter: ep.chapter, episodeId: ep.id }) : go("seasons"))}
              className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-ember/40 bg-ember/10 px-1.5 py-0.5 align-baseline font-mono text-[11px] text-ember transition-colors hover:bg-ember/20"
              title={ep ? `${ep.title} — ${ep.book} ${ep.chapter}` : s.label}
            >
              ▶ {s.label}
            </button>
          );
        }
        return (
          <button
            key={i}
            onClick={() => openReader({ bookId: s.bookId, chapter: s.chapter, verse: s.verse })}
            className="mx-0.5 inline-flex items-center gap-1 rounded-md border border-gold/40 bg-gold/10 px-1.5 py-0.5 align-baseline font-mono text-[11px] text-gold transition-colors hover:bg-gold/20"
          >
            /{s.label}
          </button>
        );
      })}
    </>
  );
}
