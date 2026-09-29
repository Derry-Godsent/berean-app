import { getCachedChapter, fetchChapterFromNetwork, bundledFallback, type ChapterVerse } from "./library";

export type { ChapterVerse } from "./library";

export interface ChapterResult {
  verses: ChapterVerse[];
  source: "live" | "cache" | "offline";
  partial?: boolean;
}

/**
 * Reads a chapter: saved-on-device copy first, then the network
 * (which automatically saves it for next time), then a bundled excerpt.
 */
export async function fetchChapter(
  translation: "kjv" | "web",
  bookId: string,
  chapter: number
): Promise<ChapterResult> {
  const cached = await getCachedChapter(translation, bookId, chapter);
  if (cached?.length) return { verses: cached, source: "cache" };

  try {
    const verses = await fetchChapterFromNetwork(translation, bookId, chapter);
    return { verses, source: "live" };
  } catch {
    const fb = bundledFallback(translation, bookId, chapter);
    if (fb?.length) return { verses: fb, source: "offline", partial: true };
    throw new Error("offline");
  }
}
