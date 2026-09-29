import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Clapperboard, Eye, Hash, Info, Send, ShieldAlert } from "lucide-react";
import { useApp } from "../app/store";
import { TaggedText } from "../app/tags";
import { channels, type Msg } from "../data/community";
import { books } from "../data/bible";
import { allEpisodes, episodeById } from "../data/seasons";
import Group from "../berean/Group";
import { EASE } from "../berean/ui";

function Message({ m, channel }: { m: Msg; channel: string }) {
  const { done, react } = useApp();
  const [reveal, setReveal] = useState(false);
  const locked = m.spoiler && !done.includes(m.spoiler) && !reveal;
  const ep = m.spoiler ? episodeById(m.spoiler) : undefined;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ ease: EASE }} className={`flex gap-3 ${m.mine ? "flex-row-reverse" : ""}`}>
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-medium text-night" style={{ background: m.color }}>
        {m.user[0]}
      </span>
      <div className={`min-w-0 max-w-[85%] ${m.mine ? "items-end text-right" : ""} flex flex-col`}>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-mist">
          {m.mine ? "You" : m.user} {m.pastor && <span className="ml-1 rounded bg-gold px-1 text-[8px] text-night">Pastor</span>}{!m.mine && ` · ${m.city} ${m.flag}`} · {m.time}
        </p>
        <div className={`relative mt-1 rounded-2xl px-4 py-3 text-left font-newsreader text-[16px] leading-relaxed ${m.mine ? "rounded-tr-md bg-gold/15 text-parchment" : "rounded-tl-md border border-line/80 bg-night2/80"}`}>
          <div className={locked ? "select-none blur-md" : ""}>
            <TaggedText text={m.text} />
          </div>
          {locked && (
            <button onClick={() => setReveal(true)} className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-2xl bg-night/50 px-3 text-center">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-ember">
                <ShieldAlert className="h-3.5 w-3.5" /> Spoiler · S{ep?.id.match(/s(\d+)/)?.[1]}E{ep?.n}
              </span>
              <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-[0.15em] text-mist">
                <Eye className="h-3 w-3" /> Tap to reveal anyway
              </span>
            </button>
          )}
        </div>
        <div className={`mt-1.5 flex gap-1.5 ${m.mine ? "justify-end" : ""}`}>
          {([
            ["pray", "🙏"],
            ["fire", "🔥"],
            ["heart", "❤️"],
          ] as const).map(([k, e]) => (
            <button key={k} onClick={() => react(channel, m.id, k)} className="flex items-center gap-1 rounded-full border border-line/80 px-2 py-0.5 font-mono text-[10px] text-mist transition-colors hover:border-gold/50 hover:text-parchment">
              {e} {m.reactions[k] > 0 && m.reactions[k]}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default function Room() {
  const app = useApp();
  const { roomChannel: ch, setRoomChannel, roomDraft, setRoomDraft } = app;
  const [text, setText] = useState(roomDraft);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (roomDraft) {
      setText(roomDraft);
      setRoomDraft("");
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [roomDraft, setRoomDraft]);

  const list = app.messages[ch] ?? [];

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [list.length]);

  // slash autocomplete
  const slash = text.match(/\/([1-3]?\s?[A-Za-z]*\s?[A-Za-z]*)$/);
  const q = slash ? slash[1].toLowerCase().trim() : null;
  const suggestions = useMemo(() => {
    if (q === null) return [];
    const bs = books.filter((b) => b.name.toLowerCase().startsWith(q)).slice(0, 5).map((b) => ({ label: b.name, insert: `/${b.name} `, kind: "book" as const, sub: `${b.chapters} chapters` }));
    const es = allEpisodes
      .filter((e) => `s${e.season.n}e${e.n}`.startsWith(q.replace(/\s/g, "")) || (q.length > 1 && e.title.toLowerCase().includes(q)))
      .slice(0, 4)
      .map((e) => ({ label: `S${e.season.n}E${e.n} · ${e.title}`, insert: `/S${e.season.n}E${e.n} `, kind: "ep" as const, sub: `${e.book} ${e.chapter}` }));
    return q === "" ? [...bs.slice(0, 3), ...es.slice(0, 3)] : [...bs, ...es].slice(0, 6);
  }, [q]);

  const pick = (insert: string) => {
    setText((t) => t.replace(/\/([1-3]?\s?[A-Za-z]*\s?[A-Za-z]*)$/, insert));
    inputRef.current?.focus();
  };

  const send = (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    app.postMessage(ch, text.trim());
    setText("");
  };

  const current = channels.find((c) => c.id === ch) ?? channels[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
      {/* Channels */}
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">The Room</p>
        <h1 className="mt-2 font-fraunces text-3xl font-semibold leading-none lg:text-4xl">Read together.</h1>
        <div className="-mx-4 mt-5 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-col lg:px-0 [&::-webkit-scrollbar]:hidden">
          {channels.map((c) => (
            <button
              key={c.id}
              onClick={() => setRoomChannel(c.id)}
              className={`shrink-0 rounded-2xl border px-4 py-3 text-left transition-colors lg:w-full ${ch === c.id ? "border-gold/50 bg-gold/10" : "border-line/80 bg-night2/50 hover:border-gold/30"}`}
            >
              <p className="font-fraunces text-[16px] font-semibold text-parchment">{c.name}</p>
              <p className="hidden font-mono text-[9px] uppercase tracking-[0.12em] text-mist lg:block">{c.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Stream */}
      {ch === "cell" ? (
        <div className="mx-auto w-full max-w-[560px]">
          <Group />
        </div>
      ) : (
        <div className="flex min-h-[70svh] flex-col rounded-3xl border border-line/80 bg-night2/30">
          <div className="flex items-center justify-between border-b border-line/70 px-5 py-4">
            <div>
              <p className="flex items-center gap-1.5 font-fraunces text-lg font-semibold">
                <Hash className="h-4 w-4 text-gold" /> {current.name}
              </p>
              <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-mist">{current.desc}</p>
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-4 py-5 sm:px-5">
            <div className="flex items-start gap-2 border-l-2 border-gold bg-night2 p-3 text-[13px] leading-relaxed text-mist">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <p>Live rooms are opening soon. For now this is a private notebook: what you write here stays on this device, and nobody else can see it.</p>
            </div>
            {list.length === 0 && (
              <p className="py-10 text-center font-newsreader text-[17px] text-mist">
                Nothing here yet. Write a first thought about today's reading.
              </p>
            )}
            {list.map((m) => (
              <Message key={m.id} m={m} channel={ch} />
            ))}
            <div ref={endRef} />
          </div>

          <div className="relative border-t border-line/70 p-3 sm:p-4">
            <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} className="absolute inset-x-3 bottom-full mb-2 overflow-hidden rounded-2xl border border-gold/30 bg-night2 shadow-2xl sm:inset-x-4">
                  <p className="border-b border-line px-4 py-2 font-mono text-[9px] uppercase tracking-[0.2em] text-gold">Tag a book, chapter or episode</p>
                  {suggestions.map((s) => (
                    <button key={s.insert} type="button" onClick={() => pick(s.insert)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gold/10">
                      {s.kind === "book" ? <BookOpen className="h-4 w-4 text-gold" /> : <Clapperboard className="h-4 w-4 text-ember" />}
                      <span className="flex-1 font-newsreader text-[15px]">{s.label}</span>
                      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-mist">{s.sub}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
            <form onSubmit={send} className="flex gap-2">
              <input
                ref={inputRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write a note… type / to tag John 3:16 or S2E4"
                className="min-w-0 flex-1 rounded-full border border-line bg-night px-4 py-3 font-newsreader text-[16px] text-parchment placeholder:text-mist/60 focus:border-gold/50 focus:outline-none"
              />
              <button type="submit" className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold text-night" aria-label="Send">
                <Send className="h-4 w-4" />
              </button>
            </form>
            <p className="mt-2 px-2 font-mono text-[9px] uppercase tracking-[0.15em] text-mist/70">
              Tip: <span className="text-gold">/Psalm 23</span> · <span className="text-gold">/John 3:16</span> · <span className="text-ember">/S2E4</span> become tappable links
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
