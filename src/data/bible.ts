export type Genre =
  | "Law"
  | "History"
  | "Wisdom"
  | "Major Prophets"
  | "Minor Prophets"
  | "Gospels"
  | "Acts"
  | "Paul's Letters"
  | "General Letters"
  | "Prophecy";

export interface Book {
  id: string;
  name: string;
  chapters: number;
  testament: "OT" | "NT";
  genre: Genre;
  author: string;
  about: string;
}

const raw: [string, string, number, Genre, string, string][] = [
  ["GEN", "Genesis", 50, "Law", "Traditionally Moses", "Creation, the fall, the flood, and the families of Abraham, Isaac, Jacob and Joseph."],
  ["EXO", "Exodus", 40, "Law", "Traditionally Moses", "God rescues Israel from slavery in Egypt and meets them at Mount Sinai."],
  ["LEV", "Leviticus", 27, "Law", "Traditionally Moses", "How a holy God can live among His people — sacrifices, priests and holiness."],
  ["NUM", "Numbers", 36, "Law", "Traditionally Moses", "Forty years of wandering in the wilderness between Egypt and the promised land."],
  ["DEU", "Deuteronomy", 34, "Law", "Traditionally Moses", "Moses' final sermons, calling a new generation to love and obey God."],
  ["JOS", "Joshua", 24, "History", "Traditionally Joshua", "Israel crosses the Jordan and settles in the promised land."],
  ["JDG", "Judges", 21, "History", "Unknown (traditionally Samuel)", "A repeating cycle of rebellion, oppression and rescue through judges like Gideon and Samson."],
  ["RUT", "Ruth", 4, "History", "Unknown", "A Moabite widow's loyalty brings her into the family line of King David."],
  ["1SA", "1 Samuel", 31, "History", "Unknown (draws on Samuel's records)", "Israel asks for a king: the stories of Samuel, Saul and young David."],
  ["2SA", "2 Samuel", 24, "History", "Unknown", "David's reign — his triumphs, his sin with Bathsheba, and its consequences."],
  ["1KI", "1 Kings", 22, "History", "Unknown", "Solomon's glory, the temple, the kingdom's split, and the prophet Elijah."],
  ["2KI", "2 Kings", 25, "History", "Unknown", "The decline of Israel and Judah, ending in exile to Assyria and Babylon."],
  ["1CH", "1 Chronicles", 29, "History", "Traditionally Ezra", "Israel's story retold from Adam to David, centred on worship and the temple."],
  ["2CH", "2 Chronicles", 36, "History", "Traditionally Ezra", "The kings of Judah from Solomon to the exile — and the hope of return."],
  ["EZR", "Ezra", 10, "History", "Traditionally Ezra", "Exiles return from Babylon to rebuild the temple and renew their faith."],
  ["NEH", "Nehemiah", 13, "History", "Nehemiah", "A cupbearer to the Persian king leads the rebuilding of Jerusalem's walls."],
  ["EST", "Esther", 10, "History", "Unknown", "A Jewish queen in Persia risks her life to save her people. God is never named — yet He is everywhere."],
  ["JOB", "Job", 42, "Wisdom", "Unknown", "A righteous man loses everything and wrestles honestly with God about suffering."],
  ["PSA", "Psalms", 150, "Wisdom", "David and others (Asaph, the sons of Korah, Moses…)", "150 songs and prayers covering every human emotion."],
  ["PRO", "Proverbs", 31, "Wisdom", "Mainly Solomon", "Short, practical wisdom for work, money, words, family and faith."],
  ["ECC", "Ecclesiastes", 12, "Wisdom", "Traditionally Solomon (“the Preacher”)", "A search for meaning “under the sun” — and where it is finally found."],
  ["SNG", "Song of Solomon", 8, "Wisdom", "Traditionally Solomon", "Poetry celebrating love and desire between a bride and groom."],
  ["ISA", "Isaiah", 66, "Major Prophets", "Isaiah", "Judgment and comfort, with striking prophecies of a coming Servant."],
  ["JER", "Jeremiah", 52, "Major Prophets", "Jeremiah", "The “weeping prophet” warns Judah before Babylon's conquest and promises a new covenant."],
  ["LAM", "Lamentations", 5, "Major Prophets", "Traditionally Jeremiah", "Five poems of grief over Jerusalem's destruction."],
  ["EZK", "Ezekiel", 48, "Major Prophets", "Ezekiel", "Visions given to exiles in Babylon, including the valley of dry bones."],
  ["DAN", "Daniel", 12, "Major Prophets", "Daniel", "Faithfulness in a foreign empire: the lions' den, the fiery furnace and visions of kingdoms."],
  ["HOS", "Hosea", 14, "Minor Prophets", "Hosea", "A prophet's marriage to an unfaithful wife pictures God's faithful love."],
  ["JOL", "Joel", 3, "Minor Prophets", "Joel", "A locust plague, and the promise that God will pour out His Spirit."],
  ["AMO", "Amos", 9, "Minor Prophets", "Amos", "A shepherd-prophet confronts injustice: “let judgment run down as waters.”"],
  ["OBA", "Obadiah", 1, "Minor Prophets", "Obadiah", "The shortest Old Testament book: judgment on Edom for its pride."],
  ["JON", "Jonah", 4, "Minor Prophets", "Jonah", "A reluctant prophet, a great fish, and God's mercy on Nineveh."],
  ["MIC", "Micah", 7, "Minor Prophets", "Micah", "Justice, mercy and humility — and a ruler to be born in Bethlehem."],
  ["NAM", "Nahum", 3, "Minor Prophets", "Nahum", "The fall of Nineveh, capital of Assyria."],
  ["HAB", "Habakkuk", 3, "Minor Prophets", "Habakkuk", "A prophet questions God about evil and learns to live by faith."],
  ["ZEP", "Zephaniah", 3, "Minor Prophets", "Zephaniah", "The day of the LORD — and God rejoicing over His people with singing."],
  ["HAG", "Haggai", 2, "Minor Prophets", "Haggai", "A call to returned exiles to finish rebuilding the temple."],
  ["ZEC", "Zechariah", 14, "Minor Prophets", "Zechariah", "Visions of restoration and a humble king riding on a donkey."],
  ["MAL", "Malachi", 4, "Minor Prophets", "Malachi", "The last Old Testament prophet — followed by about 400 years of prophetic silence."],
  ["MAT", "Matthew", 28, "Gospels", "Matthew (Levi), the tax collector", "Jesus as the promised King, including the Sermon on the Mount."],
  ["MRK", "Mark", 16, "Gospels", "John Mark", "The shortest, fastest Gospel — Jesus the servant in action."],
  ["LUK", "Luke", 24, "Gospels", "Luke, the physician", "A carefully researched account of Jesus, full of outsiders and parables."],
  ["JHN", "John", 21, "Gospels", "John, the beloved disciple", "Seven signs and seven “I am” sayings — written so that you might believe."],
  ["ACT", "Acts", 28, "Acts", "Luke", "The Holy Spirit comes and the church spreads from Jerusalem to Rome."],
  ["ROM", "Romans", 16, "Paul's Letters", "Paul", "Paul's fullest explanation of the gospel: grace, faith and new life."],
  ["1CO", "1 Corinthians", 16, "Paul's Letters", "Paul", "Correcting a divided church — including the great chapter on love (13)."],
  ["2CO", "2 Corinthians", 13, "Paul's Letters", "Paul", "Paul's most personal letter: strength made perfect in weakness."],
  ["GAL", "Galatians", 6, "Paul's Letters", "Paul", "Freedom in Christ: saved by grace through faith, not by keeping the law."],
  ["EPH", "Ephesians", 6, "Paul's Letters", "Paul", "Who we are in Christ — and the whole armour of God."],
  ["PHP", "Philippians", 4, "Paul's Letters", "Paul", "A letter overflowing with joy — written from prison."],
  ["COL", "Colossians", 4, "Paul's Letters", "Paul", "The supremacy of Christ over everything."],
  ["1TH", "1 Thessalonians", 5, "Paul's Letters", "Paul", "Encouragement for a young church and hope in Christ's return."],
  ["2TH", "2 Thessalonians", 3, "Paul's Letters", "Paul", "Clearing up confusion about the day of the Lord."],
  ["1TI", "1 Timothy", 6, "Paul's Letters", "Paul", "Guidance to a young pastor on leadership, teaching and money."],
  ["2TI", "2 Timothy", 4, "Paul's Letters", "Paul", "Paul's final letter before his execution: “I have fought a good fight.”"],
  ["TIT", "Titus", 3, "Paul's Letters", "Paul", "Instructions for organising churches on the island of Crete."],
  ["PHM", "Philemon", 1, "Paul's Letters", "Paul", "A personal appeal to welcome back a runaway slave, Onesimus, as a brother."],
  ["HEB", "Hebrews", 13, "General Letters", "Unknown", "Jesus is greater than angels, Moses and the old priesthood; includes the “hall of faith” (11)."],
  ["JAS", "James", 5, "General Letters", "James, brother of Jesus", "Practical faith: faith without works is dead."],
  ["1PE", "1 Peter", 5, "General Letters", "Peter", "Living hope for Christians facing suffering."],
  ["2PE", "2 Peter", 3, "General Letters", "Peter", "Warnings about false teachers and a reminder that the Lord keeps His promises."],
  ["1JN", "1 John", 5, "General Letters", "John", "God is love — and how to know you truly belong to Him."],
  ["2JN", "2 John", 1, "General Letters", "John", "A short letter on walking in truth and love."],
  ["3JN", "3 John", 1, "General Letters", "John", "A short letter praising hospitality to travelling believers."],
  ["JUD", "Jude", 1, "General Letters", "Jude, brother of James", "Contend for the faith against false teachers."],
  ["REV", "Revelation", 22, "Prophecy", "John", "Visions of Christ's victory and a new heaven and a new earth."],
];

export const books: Book[] = raw.map(([id, name, chapters, genre, author, about], i) => ({
  id,
  name,
  chapters,
  genre,
  author,
  about,
  testament: i < 39 ? "OT" : "NT",
}));

export const TOTAL_CHAPTERS = books.reduce((s, b) => s + b.chapters, 0); // 1189

const aliases: Record<string, string> = {
  psalm: "PSA",
  "song of songs": "SNG",
  songs: "SNG",
};

export function bookById(id: string): Book | undefined {
  return books.find((b) => b.id === id);
}

export function findBook(name: string): Book | undefined {
  const n = name.trim().toLowerCase();
  if (aliases[n]) return bookById(aliases[n]);
  return books.find((b) => b.name.toLowerCase() === n);
}

/** Names usable in /slash tags, longest first so "1 John" beats "John". */
export const tagNames: string[] = [...books.map((b) => b.name), "Psalm"].sort(
  (a, b) => b.length - a.length
);

/* ------------------------------------------------------------------
   KJV word helper — archaic + key theological words
   ------------------------------------------------------------------ */
export const glossary: Record<string, string> = {
  thee: "“You” — singular, as the object of a sentence (“I love thee”).",
  thou: "“You” — singular, as the subject (“thou art”).",
  thy: "“Your” — singular.",
  thine: "“Your / yours” — singular; used before vowels (“thine heart”).",
  ye: "“You” — plural. In the KJV, “ye” always means more than one person.",
  hath: "“Has.”",
  doth: "“Does.”",
  unto: "“To” or “toward.”",
  verily: "“Truly.” When Jesus says “verily, verily” He is stressing that what follows is certain.",
  behold: "“Look!” — a call to stop and pay attention.",
  lo: "“Look!” or “See!”",
  walketh: "“Walks.” The ending “-eth” is simply old English for “-s”.",
  standeth: "“Stands.”",
  sitteth: "“Sits.”",
  bringeth: "“Brings.”",
  withereth: "“Withers.”",
  doeth: "“Does.”",
  believeth: "“Believes” — keeps on trusting, not a one-off opinion.",
  giveth: "“Gives.”",
  wavereth: "“Wavers” — is torn between two ways, unsettled.",
  passeth: "“Passes” — here, goes beyond / surpasses.",
  maketh: "“Makes.”",
  leadeth: "“Leads.”",
  restoreth: "“Restores” — brings back to life, refreshes.",
  upbraideth: "“Reproaches” or “finds fault.” God gives wisdom without scolding you for asking.",
  divers: "“Various” or “many different kinds.” (Not “divers” as in swimmers!)",
  careful: "In Philippians 4:6 it means “anxious, full of worry” — “be anxious for nothing.”",
  supplication: "An earnest, humble request — pouring out a specific need to God.",
  moderation: "In Philippians 4:5: gentleness, graciousness, reasonableness.",
  conversation: "Your conduct or whole way of life — not just talking.",
  charity: "Love — the self-giving love (Greek: agape) described in 1 Corinthians 13.",
  quick: "Often means “living” or “alive” (“the quick and the dead”).",
  mammon: "An Aramaic word for wealth or money — Jesus pictures it as a rival master.",
  raiment: "Clothing.",
  begotten: "Fathered or born. “Only begotten” (John 3:16) stresses that Jesus is God's unique, one-of-a-kind Son.",
  whosoever: "“Whoever” — anyone at all.",
  whithersoever: "“Wherever.”",
  whither: "“Where to.”",
  dismayed: "Discouraged, alarmed, losing heart.",
  perdition: "Destruction or ruin.",
  godliness: "Devotion to God that shows up in how you live.",
  selah: "A word found in the Psalms, probably a musical or reflective pause. Its exact meaning is uncertain.",
  scornful: "Mockers — people who ridicule God and goodness.",
  substance: "Depends on context: in Hebrews 11:1 it means assurance or confidence; in Proverbs 3:9 it means your wealth.",
  vanity: "In Ecclesiastes: breath or vapour — something fleeting and empty.",
  lasciviousness: "Shameless, unrestrained sensuality.",
  gainsaying: "Contradicting, speaking against — rebellion.",
  sanctified: "Set apart for God and made holy.",
  tarry: "Wait, stay, or linger.",
  wist: "“Knew.”",
  peradventure: "“Perhaps.”",
  froward: "Stubborn, perverse, hard to deal with.",
  ghost: "Spirit. “Holy Ghost” and “Holy Spirit” mean the same.",
  firmament: "The sky; the expanse above the earth.",
  void: "Empty.",
  meditate: "To think deeply and repeatedly — in Hebrew, even to murmur it aloud to yourself.",
  covet: "To desire strongly what belongs to someone else.",
  coveted: "Strongly desired (often wrongly).",
  righteousness: "Being right with God — and the right living that flows from it.",
  iniquity: "Wickedness; a crookedness or twisting of what is right.",
  transgression: "Crossing a line God has drawn; deliberate rebellion.",
  covenant: "A binding, solemn relationship-promise. God's covenants run through the whole Bible.",
  atonement: "Making peace between God and people by dealing with sin.",
  tabernacle: "The portable tent where God's presence dwelt among Israel in the wilderness.",
  abide: "Remain, stay, live in.",
  grace: "God's undeserved kindness and favour.",
};

export const glossaryRegex = new RegExp(
  `\\b(${Object.keys(glossary)
    .sort((a, b) => b.length - a.length)
    .join("|")})\\b`,
  "gi"
);

/* ------------------------------------------------------------------
   Topic index — powers Ask, the Sermon Builder and cross-references
   ------------------------------------------------------------------ */
export interface Topic {
  id: string;
  name: string;
  keywords: string[];
  refs: string[];
  summary: string;
}

export const topics: Topic[] = [
  {
    id: "peace",
    name: "Anxiety & Peace",
    keywords: ["anxious", "anxiety", "worry", "worried", "stress", "peace", "afraid", "careful"],
    refs: ["Philippians 4:6-7", "Matthew 6:25-34", "1 Peter 5:7", "Isaiah 26:3", "John 14:27", "Psalm 23"],
    summary:
      "Scripture never pretends life is calm. Instead it invites us to hand our worries to God in specific prayer with thanksgiving, and promises a peace that goes beyond understanding — guarding the heart and mind in Christ.",
  },
  {
    id: "money",
    name: "Money & Work",
    keywords: ["money", "rich", "wealth", "mammon", "tithe", "tithing", "poor", "prosper", "prosperity", "business", "job", "work", "debt", "riches", "gold"],
    refs: ["Matthew 6:19-24", "1 Timothy 6:6-10", "Proverbs 3:9-10", "Luke 12:13-21", "Proverbs 13:11", "Luke 16:10", "Colossians 3:23", "Malachi 3:10"],
    summary:
      "The Bible doesn't condemn money — it warns about the love of it. Wealth is a tool to steward, not a master to serve. Work hard and honestly, give generously, avoid get-rich-quick schemes, and remember godliness with contentment is great gain.",
  },
  {
    id: "faith",
    name: "Faith",
    keywords: ["faith", "believe", "trust", "doubt", "doubts", "doubting"],
    refs: ["Hebrews 11:1-6", "Romans 10:17", "James 2:14-26", "Mark 9:24", "Proverbs 3:5-6", "Genesis 15:6"],
    summary:
      "Faith is trusting God's character and promises even before you see the outcome. It grows by hearing God's word, and real faith shows itself in action. Honest doubt isn't the opposite of faith — “Lord, I believe; help thou mine unbelief” (Mark 9:24) is a prayer God honours.",
  },
  {
    id: "prayer",
    name: "Prayer",
    keywords: ["pray", "prayer", "praying", "prayers", "fasting"],
    refs: ["Matthew 6:5-13", "1 Thessalonians 5:17", "James 5:16", "Luke 18:1-8", "Philippians 4:6"],
    summary:
      "Prayer is conversation with God. Jesus taught a simple pattern — honour God, seek His will, ask for daily needs, forgive and be forgiven, ask for protection — and urged us to keep praying and not lose heart.",
  },
  {
    id: "forgiveness",
    name: "Forgiveness",
    keywords: ["forgive", "forgiveness", "forgiven", "sin", "sins", "guilt", "shame", "repent", "repentance"],
    refs: ["1 John 1:9", "Luke 15:11-32", "Matthew 18:21-35", "Ephesians 4:32", "Colossians 3:13", "Psalm 51"],
    summary:
      "God's forgiveness is complete for all who confess their sins and turn to Him. Because we are forgiven so much, we are called to forgive others — not because they deserve it, but because we didn't either.",
  },
  {
    id: "purpose",
    name: "Purpose & Calling",
    keywords: ["purpose", "calling", "called", "future", "plan", "plans", "destiny", "direction", "decision"],
    refs: ["Jeremiah 29:11", "Ephesians 2:10", "Romans 8:28", "Proverbs 19:21", "Matthew 5:14-16", "Proverbs 3:5-6"],
    summary:
      "You are God's workmanship, created for good works He prepared in advance. Scripture gives direction less as a hidden map and more as a relationship: trust Him, acknowledge Him in all your ways, and He will direct your paths.",
  },
  {
    id: "love",
    name: "Love",
    keywords: ["love", "loved", "loving", "charity", "marriage", "relationship"],
    refs: ["1 Corinthians 13", "John 3:16", "1 John 4:7-21", "Romans 5:8", "John 15:13"],
    summary:
      "God is love, and He proved it: while we were still sinners, Christ died for us. Biblical love is patient, kind and self-giving — more a commitment than a feeling.",
  },
  {
    id: "courage",
    name: "Fear & Courage",
    keywords: ["fear", "scared", "courage", "brave", "strong", "strength", "dismayed"],
    refs: ["Joshua 1:9", "Isaiah 41:10", "2 Timothy 1:7", "Psalm 27:1", "Deuteronomy 31:6"],
    summary:
      "The most repeated command in the Bible is some form of “fear not.” Courage in Scripture isn't the absence of fear — it's the presence of God: “the LORD thy God is with thee whithersoever thou goest.”",
  },
  {
    id: "temptation",
    name: "Temptation",
    keywords: ["temptation", "tempted", "tempt", "lust", "addiction", "purity", "porn"],
    refs: ["1 Corinthians 10:13", "James 1:12-15", "Psalm 119:9-11", "Matthew 4:1-11", "Hebrews 4:15"],
    summary:
      "Temptation is common to everyone — even Jesus was tempted, yet without sin. God always provides a way of escape, and hiding His word in your heart is one of the strongest defences.",
  },
  {
    id: "suffering",
    name: "Suffering & Hope",
    keywords: ["suffer", "suffering", "pain", "why", "evil", "grief", "death", "sick", "sickness", "trial", "trials", "hurt"],
    refs: ["Romans 8:18", "2 Corinthians 4:16-18", "James 1:2-4", "Romans 5:3-5", "Revelation 21:4", "Job 38"],
    summary:
      "The Bible doesn't give a tidy answer to why suffering happens, but it gives something better: a God who suffers with us, who uses trials to build endurance, and who promises a day when He will wipe away every tear.",
  },
];

/* ------------------------------------------------------------------
   Verified KJV verses (bible-api.com, public domain)
   ------------------------------------------------------------------ */
export const verses: { ref: string; text: string }[] = [
  { ref: "John 3:16", text: "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life." },
  { ref: "Proverbs 3:5", text: "Trust in the LORD with all thine heart; and lean not unto thine own understanding." },
  { ref: "Proverbs 3:6", text: "In all thy ways acknowledge him, and he shall direct thy paths." },
  { ref: "Psalm 23:1", text: "The LORD is my shepherd; I shall not want." },
  { ref: "Genesis 1:1", text: "In the beginning God created the heaven and the earth." },
  { ref: "Matthew 6:21", text: "For where your treasure is, there will your heart be also." },
  { ref: "Psalm 119:105", text: "Thy word is a lamp unto my feet, and a light unto my path." },
  { ref: "Hebrews 11:1", text: "Now faith is the substance of things hoped for, the evidence of things not seen." },
  { ref: "Matthew 6:33", text: "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you." },
  { ref: "1 Timothy 6:6", text: "But godliness with contentment is great gain." },
  { ref: "Joshua 1:9", text: "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest." },
  { ref: "Philippians 4:7", text: "And the peace of God, which passeth all understanding, shall keep your hearts and minds through Christ Jesus." },
  { ref: "Matthew 6:24", text: "No man can serve two masters: for either he will hate the one, and love the other; or else he will hold to the one, and despise the other. Ye cannot serve God and mammon." },
  { ref: "Psalm 1:3", text: "And he shall be like a tree planted by the rivers of water, that bringeth forth his fruit in his season; his leaf also shall not wither; and whatsoever he doeth shall prosper." },
];

/** Parses "1 Timothy 6:6-10" → { book, chapter, verse } */
export function parseRef(ref: string): { book: Book; chapter: number; verse?: number } | null {
  const m = ref.match(/^([1-3]?\s?[A-Za-z ]+?)\s+(\d+)(?::(\d+))?/);
  if (!m) return null;
  const book = findBook(m[1]);
  if (!book) return null;
  return { book, chapter: Number(m[2]), verse: m[3] ? Number(m[3]) : undefined };
}

export function dayIndex(d = new Date()): number {
  return Math.floor(
    (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2024, 0, 1)) / 86400000
  );
}
