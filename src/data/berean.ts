export interface Verse {
  n: number;
  t: string;
}

export interface Passage {
  ref: string;
  book: string;
  chapter: number;
  title: string;
  theme: string;
  verses: Verse[];
}

/* KJV — Public Domain. Text verified against bible-api.com */
export const passages: Record<string, Passage> = {
  psalm1: {
    ref: "Psalm 1:1-3",
    book: "Psalms",
    chapter: 1,
    title: "The Tree By The Water",
    theme: "Rooted",
    verses: [
      {
        n: 1,
        t: "Blessed is the man that walketh not in the counsel of the ungodly, nor standeth in the way of sinners, nor sitteth in the seat of the scornful.",
      },
      {
        n: 2,
        t: "But his delight is in the law of the LORD; and in his law doth he meditate day and night.",
      },
      {
        n: 3,
        t: "And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper.",
      },
    ],
  },
  james1: {
    ref: "James 1:2-8",
    book: "James",
    chapter: 1,
    title: "Wisdom In The Trial",
    theme: "Endurance",
    verses: [
      { n: 2, t: "My brethren, count it all joy when ye fall into divers temptations;" },
      {
        n: 3,
        t: "Knowing this, that the trying of your faith worketh patience.",
      },
      {
        n: 4,
        t: "But let patience have her perfect work, that ye may be perfect and entire, wanting nothing.",
      },
      {
        n: 5,
        t: "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.",
      },
      {
        n: 6,
        t: "But let him ask in faith, nothing wavering. For he that wavereth is like a wave of the sea driven with the wind and tossed.",
      },
      {
        n: 7,
        t: "For let not that man think that he shall receive any thing of the Lord.",
      },
      { n: 8, t: "A double minded man is unstable in all his ways." },
    ],
  },
  phil4: {
    ref: "Philippians 4:4-9",
    book: "Philippians",
    chapter: 4,
    title: "Peace For Anxious Days",
    theme: "Peace",
    verses: [
      { n: 4, t: "Rejoice in the Lord alway: and again I say, Rejoice." },
      {
        n: 5,
        t: "Let your moderation be known unto all men. The Lord is at hand.",
      },
      {
        n: 6,
        t: "Be careful for nothing; but in every thing by prayer and supplication with thanksgiving let your requests be made known unto God.",
      },
      {
        n: 7,
        t: "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus.",
      },
      {
        n: 8,
        t: "Finally, brethren, whatsoever things are true, whatsoever things are honest, whatsoever things are just, whatsoever things are pure, whatsoever things are lovely, whatsoever things are of good report; if there be any virtue, and if there be any praise, think on these things.",
      },
    ],
  },
  acts17: {
    ref: "Acts 17:10-12",
    book: "Acts",
    chapter: 17,
    title: "The Bereans",
    theme: "Daily search",
    verses: [
      {
        n: 10,
        t: "And the brethren immediately sent away Paul and Silas by night unto Berea: who coming thither went into the synagogue of the Jews.",
      },
      {
        n: 11,
        t: "These were more noble than those in Thessalonica, in that they received the word with all readiness of mind, and searched the scriptures daily, whether those things were so.",
      },
      {
        n: 12,
        t: "Therefore many of them believed; also of honourable women which were Greeks, and of men, not a few.",
      },
    ],
  },
};

/* The plan the member is walking through */
export const plan = {
  name: "Rooted",
  subtitle: "14 days in the Psalms & Epistles",
  day: 6,
  total: 14,
  today: "psalm1",
  streak: 5,
  minutes: 6,
};

export const reflection = [
  "Where is there fresh fruit in your life this week — evidence God is at work?",
  "What counsel have you been listening to most lately, and who is it from?",
  "What is one thing you will put down today in order to sit with God?",
];

export const memoryVerse = {
  ref: "Philippians 4:6",
  words: [
    "Be",
    "careful",
    "for",
    "nothing;",
    "but",
    "in",
    "every",
    "thing",
    "by",
    "prayer",
    "and",
    "supplication",
    "with",
    "thanksgiving",
    "let",
    "your",
    "requests",
    "be",
    "made",
    "known",
    "unto",
    "God.",
  ],
  hideAt: [2, 5, 8, 11, 14, 17, 20],
};

/* The cell group — the real discipleship unit */
export const cellGroup = {
  name: "Adenta Thursday Cell",
  church: "Cornerstone Chapel",
  meeting: "Thursdays · 7:00 PM · Sister Ama's house",
  groupStreak: 23,
  members: [
    { name: "Ama Boateng", initials: "AB", read: true, streak: 41, leader: true },
    { name: "Kwabena Mensah", initials: "KM", read: true, streak: 23 },
    { name: "Efua Asante", initials: "EA", read: true, streak: 17 },
    { name: "Yaw Ofori", initials: "YO", read: true, streak: 12 },
    { name: "Naa Adjeley", initials: "NA", read: false, streak: 4 },
    { name: "Kofi Danso", initials: "KD", read: false, streak: 0 },
    { name: "Abena Owusu", initials: "AO", read: true, streak: 31 },
    { name: "Selorm Agbeko", initials: "SA", read: false, streak: 2 },
  ],
  prayerWall: [
    {
      name: "Abena Owusu",
      text: "For my brother's job interview on Friday.",
      time: "2h",
      praying: 9,
    },
    {
      name: "Kwabena Mensah",
      text: "Grateful — my mother's surgery went well. Thank you all.",
      time: "5h",
      praying: 14,
    },
    {
      name: "Naa Adjeley",
      text: "Struggling to read consistently in the mornings. Praying for discipline.",
      time: "1d",
      praying: 6,
    },
  ],
};

/* Sunday's sermon — the wedge. Church-promoted distribution. */
export const sermon = {
  week: "Week of 12 January",
  title: "Peace For Anxious Days",
  preacher: "Rev. Emmanuel Osei",
  church: "Cornerstone Chapel",
  mainRef: "Philippians 4:4-9",
  mainKey: "phil4",
  date: "Sunday 11 January",
  readThisWeek: 142,
  congregation: 248,
  scriptures: [
    {
      ref: "Philippians 4:6-7",
      note: "“Be careful for nothing” — the command to hand over anxiety.",
      key: "phil4",
    },
    {
      ref: "Matthew 6:25-34",
      note: "Jesus on worry and the lilies of the field.",
    },
    {
      ref: "1 Peter 5:7",
      note: "Casting all your care upon him, for he careth for you.",
    },
    {
      ref: "Isaiah 26:3",
      note: "Perfect peace for the mind stayed on God.",
    },
    {
      ref: "Psalm 23",
      note: "The shepherd who leads beside still waters.",
    },
  ],
};

/* The pastor's dashboard — this is the revenue screen */
export const church = {
  name: "Cornerstone Chapel",
  pastor: "Rev. Emmanuel Osei",
  members: 248,
  cells: 18,
  weeklyReaders: 61,
  beforeBerean: 24,
  avgStreak: 9.4,
  minutesWeek: 1874,
  plan: "Congregation",
  price: "GHS 150",
  topPassages: [
    { ref: "Philippians 4", pct: 92 },
    { ref: "Psalm 23", pct: 78 },
    { ref: "James 1", pct: 64 },
    { ref: "Matthew 6", pct: 51 },
    { ref: "Psalm 91", pct: 44 },
  ],
  cellsActive: [
    { name: "Adenta Thursday Cell", pct: 88, streak: 23 },
    { name: "Madina Youth Cell", pct: 76, streak: 31 },
    { name: "Tema Women's Cell", pct: 54, streak: 6 },
    { name: "Legon Students Cell", pct: 41, streak: 2 },
  ],
  visitors: [
    { name: "Selorm Agbeko", first: "2 Sundays ago", follows: "Cell — Adenta" },
    { name: "Grace Amankwah", first: "Last Sunday", follows: "Youth cell" },
    { name: "Michael Tetteh", first: "Last Sunday", follows: "Not yet placed" },
  ],
};
