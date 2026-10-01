import { seasons, type Episode, type Season } from "../data/seasons";

/**
 * The path through the seasons.
 *
 * Berean is a series, not a shelf: everyone starts at Season 1, Episode 1, and
 * the next episode opens when the one before it is finished. Two rules keep
 * that fair rather than punishing:
 *
 * 1. **Nothing already begun is ever locked.** Anyone who read ahead before
 *    this existed keeps what they have.
 * 2. **The Bible itself is never locked.** The reader, the verse of the day,
 *    the games and the search all stay open. Only the curated season path has
 *    an order.
 *
 * The path is *derived* from the finished episodes (`done`), never stored
 * separately — so it cannot drift, and it is exactly the record that syncs to
 * `episode_progress` / `reading_progress` when accounts arrive.
 */
export const pathSeasons = (): Season[] =>
  seasons.filter((s) => s.status === "live" && s.episodes.length > 0);

export function completedIn(season: Season, done: string[]): number {
  return season.episodes.filter((e) => done.includes(e.id)).length;
}

export function isSeasonComplete(season: Season, done: string[]): boolean {
  return season.episodes.length > 0 && completedIn(season, done) === season.episodes.length;
}

export function hasBegun(season: Season, done: string[]): boolean {
  return completedIn(season, done) > 0;
}

export type SeasonState = "in-production" | "locked" | "open" | "complete";

export function seasonState(season: Season, done: string[]): SeasonState {
  if (season.status !== "live" || season.episodes.length === 0) return "in-production";
  if (isSeasonComplete(season, done)) return "complete";

  const path = pathSeasons();
  const i = path.findIndex((s) => s.id === season.id);
  if (i <= 0) return "open"; // Season 1 is where everyone starts.
  if (hasBegun(season, done)) return "open"; // Never take away what someone has started.
  return isSeasonComplete(path[i - 1], done) ? "open" : "locked";
}

export const seasonUnlocked = (season: Season, done: string[]) => {
  const state = seasonState(season, done);
  return state === "open" || state === "complete";
};

/**
 * What opens a locked season: the **earliest season still unfinished**, which
 * is always one the reader can actually work on right now. Pointing at the
 * immediate predecessor would be useless — that one is usually locked too.
 */
export function seasonLock(season: Season, done: string[]): { season: Season; remaining: number } | null {
  if (seasonState(season, done) !== "locked") return null;
  const path = pathSeasons();
  const next = path.find((s) => !isSeasonComplete(s, done));
  if (!next) return null;
  return { season: next, remaining: next.episodes.length - completedIn(next, done) };
}

export type EpisodeState = "done" | "open" | "locked";

/**
 * Inside an unlocked season, episodes open in order — finish one and the next
 * is waiting. In a locked season every episode carries the season's reason,
 * never a neighbour's: finishing a neighbour would not open it anyway.
 */
export function episodeState(season: Season, episode: Episode, done: string[]): EpisodeState {
  if (done.includes(episode.id)) return "done";
  if (!seasonUnlocked(season, done)) return "locked";
  const i = season.episodes.findIndex((e) => e.id === episode.id);
  if (i <= 0) return "open";
  return done.includes(season.episodes[i - 1].id) ? "open" : "locked";
}

/**
 * The episode that opens this one, when finishing it genuinely would.
 * Null for the first episode, and null while the whole season is locked.
 */
export function episodeLock(season: Season, episode: Episode, done: string[]): Episode | null {
  if (seasonState(season, done) !== "open") return null;
  if (episodeState(season, episode, done) !== "locked") return null;
  const i = season.episodes.findIndex((e) => e.id === episode.id);
  if (i <= 0) return null;
  return season.episodes[i - 1];
}

/** How far along the whole path someone is. Used for the honest progress line. */
export function pathProgress(done: string[]) {
  const path = pathSeasons();
  const episodes = path.flatMap((s) => s.episodes);
  const finished = episodes.filter((e) => done.includes(e.id)).length;
  const opened = path.filter((s) => seasonUnlocked(s, done)).length;
  return {
    finished,
    total: episodes.length,
    opened,
    seasons: path.length,
    complete: episodes.length > 0 && finished === episodes.length,
  };
}
