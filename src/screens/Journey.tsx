import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Globe2, History, MapPin, Sparkles } from "lucide-react";
import { useApp } from "../app/store";
import { eras, places, routes } from "../data/history";
import { parseRef } from "../data/bible";
import { EASE } from "../berean/ui";

const W = 1000;
const H = 450;
const proj = (lat: number, lon: number) => ({ x: ((lon - 10) / 40) * W, y: ((44 - lat) / 18) * H });

function RefChip({ r }: { r: string }) {
  const { openReader } = useApp();
  return (
    <button
      onClick={() => {
        const p = parseRef(r);
        if (p) openReader({ bookId: p.book.id, chapter: p.chapter, verse: p.verse });
      }}
      className="flex items-center gap-1.5 rounded-full border border-gold/40 bg-gold/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-gold hover:bg-gold/20"
    >
      <BookOpen className="h-3 w-3" /> {r}
    </button>
  );
}

function TimelineView() {
  const [open, setOpen] = useState<string>("return");
  return (
    <div className="relative">
      <div className="absolute bottom-0 left-[15px] top-0 w-px bg-line sm:left-[19px]" />
      <div className="space-y-3">
        {eras.map((e, i) => {
          const isOpen = open === e.id;
          return (
            <motion.div key={e.id} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.03, ease: EASE }} className="relative pl-10 sm:pl-12">
              <span className={`absolute left-[9px] top-5 h-3.5 w-3.5 rounded-full border-2 sm:left-[13px] ${isOpen ? "border-gold bg-gold ring-live" : "border-gold/50 bg-night"}`} />
              <button onClick={() => setOpen(isOpen ? "" : e.id)} className={`w-full rounded-2xl border p-4 text-left transition-colors sm:p-5 ${isOpen ? "border-gold/40 bg-night2" : "border-line/70 bg-night2/50 hover:border-gold/30"}`}>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-gold">{e.date}</p>
                <p className="mt-1 font-fraunces text-2xl font-semibold">{e.title}</p>
                <p className="font-newsreader text-sm italic text-mist">{e.people}</p>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ ease: EASE }} className="overflow-hidden">
                    <div className="grid gap-4 pt-3 md:grid-cols-2">
                      <div className="rounded-2xl border border-line/70 bg-night/50 p-4">
                        <p className="font-newsreader text-[16px] leading-relaxed">{e.summary}</p>
                        <p className="mt-4 font-mono text-[9px] uppercase tracking-[0.2em] text-mist">Read it</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {e.read.map((r) => (
                            <RefChip key={r} r={r} />
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl border border-sage/25 bg-sage/[0.06] p-4">
                        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-sage">
                          <Globe2 className="h-3.5 w-3.5" /> Meanwhile, in the world
                        </p>
                        <ul className="mt-3 space-y-2.5">
                          {e.world.map((w) => (
                            <li key={w} className="flex gap-2 font-newsreader text-[15px] leading-relaxed text-parchment/90">
                              <Sparkles className="mt-1 h-3 w-3 shrink-0 text-sage" /> {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
      <p className="mt-6 pl-10 font-mono text-[10px] uppercase tracking-[0.14em] text-mist sm:pl-12">Dates are approximate. Scholars differ, especially before 1000 BC.</p>
    </div>
  );
}

function MapView() {
  const [sel, setSel] = useState<string>("jerusalem");
  const [route, setRoute] = useState<string>("paul");
  const place = places.find((p) => p.id === sel)!;
  const r = routes.find((x) => x.id === route)!;
  const pts = r.stops.map((id) => places.find((p) => p.id === id)!).map((p) => proj(p.lat, p.lon));
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {routes.map((x) => (
          <button
            key={x.id}
            onClick={() => setRoute(x.id)}
            className={`flex items-center gap-2 rounded-full border px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.15em] ${route === x.id ? "border-parchment/60 text-parchment" : "border-line text-mist"}`}
          >
            <span className="h-2 w-2 rounded-full" style={{ background: x.color }} /> {x.name}
          </button>
        ))}
      </div>

      <div className="relative overflow-hidden border border-line bg-night3">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full">
          {/* graticule */}
          {Array.from({ length: 9 }, (_, i) => 10 + i * 5).map((lon) => (
            <line key={`lo${lon}`} x1={proj(0, lon).x} x2={proj(0, lon).x} y1={0} y2={H} stroke="#c6b99f" strokeWidth="1" strokeDasharray="2 6" />
          ))}
          {Array.from({ length: 10 }, (_, i) => 26 + i * 2).map((lat) => (
            <line key={`la${lat}`} y1={proj(lat, 0).y} y2={proj(lat, 0).y} x1={0} x2={W} stroke="#c6b99f" strokeWidth="1" strokeDasharray="2 6" />
          ))}
          {/* region labels */}
          {[
            { t: "MEDITERRANEAN SEA", lat: 34.2, lon: 20 },
            { t: "MESOPOTAMIA", lat: 34.6, lon: 42.6 },
            { t: "EGYPT", lat: 27.2, lon: 29.5 },
            { t: "ARABIAN DESERT", lat: 28.8, lon: 40 },
            { t: "ASIA MINOR", lat: 39.4, lon: 32 },
            { t: "PERSIA", lat: 30.2, lon: 48 },
          ].map((l) => {
            const p = proj(l.lat, l.lon);
            return (
              <text key={l.t} x={p.x} y={p.y} textAnchor="middle" fill="#6d6255" opacity="0.42" fontSize="13" letterSpacing="5" fontFamily="IBM Plex Mono, monospace">
                {l.t}
              </text>
            );
          })}
          {/* route */}
          <motion.path key={route} d={d} fill="none" stroke={r.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="1 0" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 2, ease: "easeInOut" }} style={{ filter: `drop-shadow(0 0 6px ${r.color})` }} />
          {/* places */}
          {places.map((p) => {
            const { x, y } = proj(p.lat, p.lon);
            const on = sel === p.id;
            const inRoute = r.stops.includes(p.id);
            return (
              <g key={p.id} onClick={() => setSel(p.id)} className="cursor-pointer">
                <circle cx={x} cy={y} r={on ? 16 : 10} fill={on ? "#9b2f22" : inRoute ? r.color : "#6d6255"} opacity={0.15} />
                <circle cx={x} cy={y} r={on ? 6 : 4} fill={on ? "#9b2f22" : inRoute ? r.color : "#6d6255"} />
                <text x={x + 9} y={y - 8} fill={on ? "#1c1714" : "#6d6255"} fontSize={on ? 15 : 12} fontFamily="Newsreader, Georgia, serif">
                  {p.name}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="absolute bottom-3 right-4 font-mono text-[9px] uppercase tracking-[0.18em] text-mist/60">Stylised · not to scale</p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={place.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-4 flex flex-col gap-4 rounded-2xl border border-gold/30 bg-night2 p-5 sm:flex-row sm:items-center">
          <MapPin className="h-6 w-6 shrink-0 text-gold" />
          <div className="flex-1">
            <p className="font-fraunces text-2xl font-semibold">{place.name}</p>
            <p className="font-newsreader text-[15px] text-mist">{place.note}</p>
          </div>
          <RefChip r={place.read} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function Journey() {
  const [tab, setTab] = useState<"time" | "map">("time");
  return (
    <div>
      <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-gold">Journey</p>
      <h1 className="mt-2 font-fraunces text-[clamp(2.2rem,6vw,3.4rem)] font-semibold leading-none">The Bible happened in real history.</h1>
      <p className="mt-3 max-w-2xl font-newsreader text-[17px] text-mist">
        See where each story fits, and what the rest of the world was doing at the same time. Pyramids, Olympics, Confucius, Caesar.
      </p>
      <div className="mt-6 flex gap-2">
        {[
          { id: "time" as const, label: "Timeline", Icon: History },
          { id: "map" as const, label: "World map", Icon: Globe2 },
        ].map(({ id, label, Icon }) => (
          <button key={id} onClick={() => setTab(id)} className={`flex items-center gap-2 rounded-full px-5 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em] ${tab === id ? "bg-gold text-night" : "border border-line text-mist"}`}>
            <Icon className="h-3.5 w-3.5" /> {label}
          </button>
        ))}
      </div>
      <div className="mt-8">{tab === "time" ? <TimelineView /> : <MapView />}</div>
    </div>
  );
}
