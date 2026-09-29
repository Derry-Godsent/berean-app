import { useEffect, useState } from "react";
import { seasons, type Episode, type Season } from "../data/seasons";
import { verses, dayIndex } from "../data/bible";

export function nextEpisode(done: string[]): { ep: Episode; season: Season } | null {
  for (const s of seasons) {
    if (s.status !== "live") continue;
    for (const e of s.episodes) if (!done.includes(e.id)) return { ep: e, season: s };
  }
  return null;
}

export function seasonProgress(s: Season, done: string[]) {
  if (!s.episodes.length) return 0;
  return Math.round((s.episodes.filter((e) => done.includes(e.id)).length / s.episodes.length) * 100);
}

export function verseOfDay() {
  return verses[dayIndex() % verses.length];
}

export function useCountdown(target: Date | null) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = target ? Math.max(0, target.getTime() - now) : 0;
  return {
    d: Math.floor(diff / 86400000),
    h: Math.floor((diff / 3600000) % 24),
    m: Math.floor((diff / 60000) % 60),
    s: Math.floor((diff / 1000) % 60),
    done: diff === 0,
  };
}
