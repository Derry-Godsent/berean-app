import { idbDel, idbGet, idbKeys, idbSet, storageEstimate } from "./db";
import { passages } from "../data/berean";
import { bookById } from "../data/bible";

export interface ChapterVerse {
  n: number;
  t: string;
}

export type Translation = "kjv" | "web";

const PREFIX = "ch:";
const key = (t: Translation, bookId: string, ch: number) => `${PREFIX}${t}:${bookId}:${ch}`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Bundled offline excerpts (KJV, verified) — used only when nothing else works. */
const bundled: Record<string, ChapterVerse[]> = {
  "kjv:PSA:1": passages.psalm1.verses,
  "kjv:JAS:1": passages.james1.verses,
  "kjv:PHP:4": passages.phil4.verses,
  "kjv:ACT:17": passages.acts17.verses,
};

const clean = (t: string) => t.replace(/\s+/g, " ").trim();

export async function getCachedChapter(
  t: Translation,
  bookId: string,
  ch: number
): Promise<ChapterVerse[] | undefined> {
  return idbGet<ChapterVerse[]>(key(t, bookId, ch));
}

export async function putCachedChapter(
  t: Translation,
  bookId: string,
  ch: number,
  verses: ChapterVerse[]
): Promise<void> {
  await idbSet(key(t, bookId, ch), verses);
}

/**
 * Fetch one chapter from the free public-domain API.
 * The API is rate limited to 15 requests per 30 seconds per IP, so we slow
 * down politely and retry once if it ever answers 429.
 */
export async function fetchChapterFromNetwork(
  t: Translation,
  bookId: string,
  ch: number
): Promise<ChapterVerse[]> {
  const url = `https://bible-api.com/data/${t}/${bookId}/${ch}`;
  let res = await fetch(url);
  if (res.status === 429) {
    await sleep(4000);
    res = await fetch(url);
  }
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  const verses: ChapterVerse[] = (json.verses ?? []).map((v: { verse: number; text: string }) => ({
    n: v.verse,
    t: clean(v.text),
  }));
  if (!verses.length) throw new Error("empty chapter");
  await putCachedChapter(t, bookId, ch, verses);
  return verses;
}

export function bundledFallback(
  t: Translation,
  bookId: string,
  ch: number
): ChapterVerse[] | undefined {
  return bundled[`${t}:${bookId}:${ch}`];
}

/* ------------------------- downloads ------------------------- */

export interface DownloadProgress {
  done: number;
  total: number;
  current: string;
  ok: number;
  failed: number;
  cancelled: boolean;
}

let cancelRequested = false;

export function cancelDownload() {
  cancelRequested = true;
}

/**
 * Save whole books to the device so they read with no data at all.
 * Deliberately sequential with a pause — respectful of the free API's limits
 * and much kinder to a phone on a metered connection.
 */
export async function downloadBooks(
  t: Translation,
  targets: { bookId: string; chapters: number; name: string }[],
  onProgress: (p: DownloadProgress) => void
): Promise<{ ok: number; failed: number }> {
  cancelRequested = false;
  const total = targets.reduce((s, x) => s + x.chapters, 0);
  let done = 0;
  let ok = 0;
  let failed = 0;

  for (const book of targets) {
    for (let ch = 1; ch <= book.chapters; ch++) {
      if (cancelRequested) {
        onProgress({ done, total, current: "Cancelled", ok, failed, cancelled: true });
        return { ok, failed };
      }
      const label = `${book.name} ${ch}`;
      const have = await getCachedChapter(t, book.bookId, ch);
      if (have) {
        ok++;
        done++;
        onProgress({ done, total, current: label, ok, failed, cancelled: false });
        continue;
      }
      try {
        await fetchChapterFromNetwork(t, book.bookId, ch);
        ok++;
      } catch {
        failed++;
      }
      done++;
      onProgress({ done, total, current: label, ok, failed, cancelled: false });
      await sleep(1100);
    }
  }
  return { ok, failed };
}

export interface LibraryStats {
  chapters: number;
  books: { id: string; name: string; chapters: number; saved: number }[];
  bytes: number;
  estimate: { usage: number; quota: number };
}

export async function libraryStats(translation: Translation): Promise<LibraryStats> {
  const keys = await idbKeys(`${PREFIX}${translation}:`);
  const byBook = new Map<string, number>();
  let bytes = 0;

  for (const k of keys) {
    const parts = k.split(":"); // ch:tr:BOOK:1
    const bookId = parts[2];
    byBook.set(bookId, (byBook.get(bookId) ?? 0) + 1);
    const data = await idbGet<ChapterVerse[]>(k);
    if (data) bytes += JSON.stringify(data).length;
  }

  const known = [...byBook.entries()]
    .map(([id, saved]) => {
      const b = bookById(id);
      return { id, name: b?.name ?? id, chapters: b?.chapters ?? saved, saved };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  return {
    chapters: keys.length,
    books: known,
    bytes,
    estimate: await storageEstimate(),
  };
}

export async function clearLibrary(translation: Translation): Promise<void> {
  const keys = await idbKeys(`${PREFIX}${translation}:`);
  for (const k of keys) await idbDel(k);
}
