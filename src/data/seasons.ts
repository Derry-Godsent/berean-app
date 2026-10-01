export interface Episode {
  id: string;
  n: number;
  title: string;
  bookId: string;
  book: string;
  chapter: number;
  minutes: number;
  synopsis: string;
  nextTime: string;
}

/**
 * A season's own colour, as a pair: one tone that reads on paper, one that
 * reads on charcoal. Stored per skin because a single hex cannot be legible on
 * both — the light tones are deep, the dark tones are warm and bright.
 */
export interface SeasonAccent {
  light: string;
  dark: string;
}

export interface Season {
  id: string;
  n: number;
  title: string;
  tagline: string;
  poster?: string;
  gradient: string;
  status: "live" | "soon";
  genre: string;
  /** Carried by the season's own labels, progress bars and markers. */
  accent: SeasonAccent;
  /** ISO date of a real, scheduled premiere. Leave unset until one is actually planned. */
  premiereAt?: string;
  episodes: Episode[];
}

const ep = (
  s: number,
  n: number,
  title: string,
  bookId: string,
  book: string,
  chapter: number,
  minutes: number,
  synopsis: string,
  nextTime: string
): Episode => ({ id: `s${s}e${n}`, n, title, bookId, book, chapter, minutes, synopsis, nextTime });

export const seasons: Season[] = [
  {
    id: "s1",
    n: 1,
    title: "In the Beginning",
    tagline: "Before kings, before nations, before time had a name.",
    poster: "images/s1-beginning.jpg",
    gradient: "from-[#1b2a44] to-[#0d1117]",
    status: "live",
    genre: "Genesis",
    accent: { light: "#2f5d8c", dark: "#8ab6e6" },
    episodes: [
      ep(1, 1, "Let There Be Light", "GEN", "Genesis", 1, 5, "Out of darkness and emptiness God speaks, and a universe answers. Light, land, life, and finally humanity, made in His image.", "A garden, a tree, and one rule."),
      ep(1, 2, "The Serpent's Question", "GEN", "Genesis", 3, 5, "“Yea, hath God said…?” One question plants a doubt that changes everything. Hidden inside the curse is a promise, in verse 15.", "Two brothers, two offerings, one jealous heart."),
      ep(1, 3, "My Brother's Keeper", "GEN", "Genesis", 4, 5, "The first family fractures. Cain's anger becomes the first murder, and God still pursues the guilty.", "The world grows violent. God looks for one righteous man."),
      ep(1, 4, "One Righteous Man", "GEN", "Genesis", 6, 4, "The earth is filled with violence, but Noah found grace in the eyes of the Lord. The blueprints for an ark arrive.", "The windows of heaven are about to open."),
      ep(1, 5, "The Windows of Heaven", "GEN", "Genesis", 7, 4, "The rain begins. Everything outside the ark is lost, and everything inside is carried.", "Humanity tries to build its way to heaven."),
      ep(1, 6, "A Tower to Heaven", "GEN", "Genesis", 11, 5, "United by one language and by pride, humanity builds Babel. God scatters them, and the chapter ends on a man from Ur named Abram.", "Season 2 changes the subject entirely."),
    ],
  },
  {
    id: "s2",
    n: 2,
    title: "The Money Question",
    tagline: "Jesus talked about money more than heaven and hell. There is a reason.",
    poster: "images/s2-money.jpg",
    gradient: "from-[#3a2c12] to-[#0d1117]",
    status: "live",
    genre: "Proverbs, Gospels, Letters",
    accent: { light: "#8a6212", dark: "#d9b25f" },
    episodes: [
      ep(2, 1, "Honour With Thy Substance", "PRO", "Proverbs", 3, 6, "Trust, not cleverness, directs your path. And the first fruits of your increase say who you really trust.", "Jesus names the one master you cannot serve alongside God."),
      ep(2, 2, "Two Masters", "MAT", "Matthew", 6, 7, "Treasure, moths, rust and thieves. Where your treasure is, there your heart will be also. Then comes the command that reorders everything: seek ye first.", "A man with full barns makes one fatal plan."),
      ep(2, 3, "The Rich Fool", "LUK", "Luke", 12, 8, "A family fights over an inheritance. Jesus answers with a story about a farmer who planned everything except the one thing that mattered.", "A dishonest manager gets praised. Wait, what?"),
      ep(2, 4, "Faithful in Little", "LUK", "Luke", 16, 7, "The strangest parable Jesus told, and the principle behind every promotion: he that is faithful in that which is least is faithful also in much.", "A prisoner gets 24 hours to save an empire's economy."),
      ep(2, 5, "Seven Fat Years", "GEN", "Genesis", 41, 8, "From prison to palace in a single day. Joseph reads Pharaoh's dreams and designs a national savings plan that saves the world from famine.", "Paul reveals the root, and it is not money."),
      ep(2, 6, "The Root", "1TI", "1 Timothy", 6, 5, "Godliness with contentment is great gain. The verse everyone misquotes, and the charge to the rich that nobody preaches.", "Season 3: a shepherd boy, a giant, and a crown."),
    ],
  },
  {
    id: "s3",
    n: 3,
    title: "Kings and Crowns",
    tagline: "A shepherd, a giant, a throne, a fall.",
    poster: "images/s3-kings.jpg",
    gradient: "from-[#2b1f3a] to-[#0d1117]",
    status: "live",
    genre: "1 and 2 Samuel, Psalms",
    accent: { light: "#6a4a86", dark: "#b99ade" },
    episodes: [
      ep(3, 1, "The Youngest Son", "1SA", "1 Samuel", 16, 5, "Samuel is sent to anoint a king. Seven impressive brothers are rejected, because the Lord looketh on the heart.", "A giant is waiting in the valley of Elah."),
      ep(3, 2, "Five Smooth Stones", "1SA", "1 Samuel", 17, 9, "An army frozen by fear, and a teenage shepherd who will not wear the king's armour. You know the ending. Read how he got there.", "The king who loved him now wants him dead."),
      ep(3, 3, "The Cave", "1SA", "1 Samuel", 24, 4, "Saul walks into the very cave where David is hiding. His men say this is your moment. David cuts a robe instead of a throat.", "Years later, on a rooftop, David is not at war where he should be."),
      ep(3, 4, "The Rooftop", "2SA", "2 Samuel", 11, 5, "The man after God's own heart commits adultery, then murder to cover it. The darkest episode in the season.", "A prophet tells the king a story about a lamb."),
      ep(3, 5, "Thou Art the Man", "2SA", "2 Samuel", 12, 6, "Nathan's parable traps the king in his own verdict. Confession, consequence, and a mercy David did not expect.", "The prayer David wrote after he was found out."),
      ep(3, 6, "A Clean Heart", "PSA", "Psalms", 51, 4, "Create in me a clean heart, O God. The most honest prayer of repentance ever written, by a king with blood on his hands.", "Season 4: the road to the cross."),
    ],
  },
  {
    id: "s4",
    n: 4,
    title: "The Road to the Cross",
    tagline: "The most important week in history, told at full speed.",
    poster: "images/s4-cross.jpg",
    gradient: "from-[#3a1a14] to-[#0d1117]",
    status: "live",
    genre: "Mark",
    accent: { light: "#8e2f3c", dark: "#e78d94" },
    episodes: [
      ep(4, 1, "A Voice in the Wilderness", "MRK", "Mark", 1, 6, "No birth story, no warm-up. Mark opens with a wild prophet, a baptism, a voice from heaven, and Jesus already on the move.", "A storm that terrifies fishermen."),
      ep(4, 2, "Peace, Be Still", "MRK", "Mark", 4, 6, "Parables about seeds, then a storm on the lake. Jesus sleeps, the disciples panic, and three words silence the sea.", "A rich young man asks the right question."),
      ep(4, 3, "One Thing Thou Lackest", "MRK", "Mark", 10, 7, "He kept every rule. Jesus looked at him, loved him, and asked for the one thing he could not give.", "A garden at night, a cup, a kiss."),
      ep(4, 4, "Gethsemane", "MRK", "Mark", 14, 10, "Perfume, a last supper, sleeping friends, a traitor's kiss and a denial by the fire. The longest night.", "Darkness at noon. A curtain torn in two."),
      ep(4, 5, "The Curtain Torn", "MRK", "Mark", 15, 7, "Mocked, crucified, forsaken. At His last breath the temple veil rips from top to bottom, and a Roman soldier says what the disciples could not.", "Three women, an empty tomb, a young man in white."),
      ep(4, 6, "He Is Risen", "MRK", "Mark", 16, 4, "Be not affrighted: ye seek Jesus of Nazareth, which was crucified: he is risen; he is not here. The finale that started everything.", "Season 5: fire falls."),
    ],
  },
  {
    id: "s5",
    n: 5,
    title: "Fire",
    tagline: "120 frightened people in one upper room. Then wind and fire.",
    gradient: "from-[#5a2a0e] via-[#2b140a] to-[#0d1117]",
    status: "soon",
    genre: "Acts",
    accent: { light: "#a54a12", dark: "#f0a05c" },
    episodes: [],
  },
  {
    id: "s6",
    n: 6,
    title: "The Unveiling",
    tagline: "The ending you were told to fear is the ending you have been waiting for.",
    gradient: "from-[#0f2a2a] via-[#0b1a1f] to-[#0d1117]",
    status: "soon",
    genre: "Revelation",
    accent: { light: "#1f6f6a", dark: "#74c6bd" },
    episodes: [],
  },
];

export const allEpisodes = seasons.flatMap((s) => s.episodes.map((e) => ({ ...e, season: s })));

export function episodeById(id: string) {
  return allEpisodes.find((e) => e.id === id);
}

/** The next scheduled premiere (a season with a future `premiereAt`), or null. */
export function nextPremiere(now = new Date()): { season: Season; at: Date } | null {
  let best: { season: Season; at: Date } | null = null;
  for (const season of seasons) {
    if (!season.premiereAt) continue;
    const at = new Date(season.premiereAt);
    if (Number.isNaN(at.getTime()) || at.getTime() <= now.getTime()) continue;
    if (!best || at < best.at) best = { season, at };
  }
  return best;
}

/** The season's colour for the skin currently in use. */
export function accentOf(season: Pick<Season, "accent">, skin: "light" | "dark") {
  return season.accent[skin];
}
