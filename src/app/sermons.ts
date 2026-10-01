import { useCallback, useEffect, useState } from "react";

/**
 * The pastor's own sermon outlines, saved on this device.
 *
 * There is no account system yet, so nothing here is shared, broadcast or
 * counted. It exists so that Sunday → Monday can work from a real outline the
 * pastor actually wrote — not from an invented sermon at an invented church.
 * When accounts arrive (docs/06-ROADMAP.md, phase 1) this is what they sync.
 */
export interface SermonPoint {
  h: string;
  d: string;
  refs: string[];
}

export interface Sermon {
  id: string;
  title: string;
  topicId: string;
  topicName: string;
  audience: string;
  /** e.g. "Philippians 4" — the passage the sermon is preached from. */
  mainRef: string;
  bookId: string;
  book: string;
  chapter: number;
  big: string;
  hook: string;
  points: SermonPoint[];
  apply: string[];
  ask: string;
  /** Monday–Saturday readings, in order. */
  plan: string[];
  /** Who is preaching, taken from the profile when the outline was saved. */
  preacher: string;
  church: string;
  createdAt: number;
  updatedAt: number;
}

const KEY = "berean:sermons:v1";
const EVENT = "berean:sermons";

export const newSermonId = () => `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

function read(): Sermon[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Sermon[]) : [];
  } catch {
    return [];
  }
}

function write(list: Sermon[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* The outline still lives in memory for this visit. */
  }
  // Lets the Sunday view notice a save without either screen owning the state.
  try {
    window.dispatchEvent(new Event(EVENT));
  } catch {
    /* ignore */
  }
}

/** Newest first. */
export function listSermons(): Sermon[] {
  return read().sort((a, b) => b.updatedAt - a.updatedAt);
}

export function saveSermon(sermon: Sermon): Sermon[] {
  const others = read().filter((s) => s.id !== sermon.id);
  const next = [sermon, ...others];
  write(next);
  return next.sort((a, b) => b.updatedAt - a.updatedAt);
}

export function deleteSermon(id: string): Sermon[] {
  const next = read().filter((s) => s.id !== id);
  write(next);
  return next.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Every reference this sermon mentions, in the order it mentions them,
 * without duplicates. Main text first, then the points, then the week's plan.
 */
export function sermonRefs(s: Sermon): string[] {
  const all = [s.mainRef, ...s.points.flatMap((p) => p.refs), ...s.plan];
  return all.filter((r, i) => !!r && all.indexOf(r) === i);
}

/** Live view of the saved outlines, shared by the builder and the Sunday view. */
export function useSermons() {
  const [sermons, setSermons] = useState<Sermon[]>(() => listSermons());

  useEffect(() => {
    const sync = () => setSermons(listSermons());
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const save = useCallback((s: Sermon) => setSermons(saveSermon(s)), []);
  const remove = useCallback((id: string) => setSermons(deleteSermon(id)), []);

  return { sermons, save, remove };
}
