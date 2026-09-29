export const wordleWords: { w: string; hint: string; ref: string }[] = [
  { w: "GRACE", hint: "“For by ___ are ye saved through faith.”", ref: "Ephesians 2:8" },
  { w: "FAITH", hint: "The substance of things hoped for.", ref: "Hebrews 11:1" },
  { w: "MOSES", hint: "He met God at a burning bush.", ref: "Exodus 3" },
  { w: "DAVID", hint: "A shepherd who became king.", ref: "1 Samuel 16" },
  { w: "JONAH", hint: "He ran from Nineveh and ended up in a fish.", ref: "Jonah 1" },
  { w: "BREAD", hint: "“I am the ___ of life.”", ref: "John 6:35" },
  { w: "SHEEP", hint: "The good shepherd gives his life for them.", ref: "John 10:11" },
  { w: "STONE", hint: "David chose five smooth ones.", ref: "1 Samuel 17:40" },
  { w: "LIGHT", hint: "Thy word is a lamp and a ___.", ref: "Psalm 119:105" },
  { w: "PEACE", hint: "It passeth all understanding.", ref: "Philippians 4:7" },
  { w: "MANNA", hint: "Bread from heaven in the wilderness.", ref: "Exodus 16" },
  { w: "CROSS", hint: "Where the curtain tore in two.", ref: "Mark 15" },
  { w: "ISAAC", hint: "The son of promise, born to Sarah in old age.", ref: "Genesis 21" },
  { w: "TRUTH", hint: "“I am the way, the ___, and the life.”", ref: "John 14:6" },
  { w: "HEART", hint: "Keep it with all diligence.", ref: "Proverbs 4:23" },
  { w: "WATER", hint: "Jesus offered a woman at a well the living kind.", ref: "John 4" },
  { w: "ANGEL", hint: "Gabriel was one.", ref: "Luke 1:26" },
  { w: "EGYPT", hint: "Where Joseph rose from prison to palace.", ref: "Genesis 41" },
  { w: "MERCY", hint: "It triumphs over judgment.", ref: "James 2:13" },
  { w: "CROWN", hint: "Paul looked forward to a crown of righteousness.", ref: "2 Timothy 4:8" },
];

export interface Trivia {
  q: string;
  options: string[];
  answer: number;
  ref: string;
  fact: string;
}

export const trivia: Trivia[] = [
  { q: "Who was swallowed by a great fish?", options: ["Elijah", "Jonah", "Peter", "Noah"], answer: 1, ref: "Jonah 1:17", fact: "He spent three days and three nights inside it." },
  { q: "How many books are in the Protestant Bible?", options: ["66", "73", "39", "27"], answer: 0, ref: "Whole Bible", fact: "39 in the Old Testament and 27 in the New. Catholic Bibles include more, totalling 73." },
  { q: "What is the shortest verse in the KJV Bible?", options: ["“God is love.”", "“Pray without ceasing.”", "“Jesus wept.”", "“Rejoice evermore.”"], answer: 2, ref: "John 11:35", fact: "Jesus wept at Lazarus' tomb, moments before raising him." },
  { q: "Which book has the most chapters?", options: ["Isaiah", "Genesis", "Jeremiah", "Psalms"], answer: 3, ref: "Psalms", fact: "Psalms has 150 chapters. Isaiah is next with 66." },
  { q: "Where was Jesus born?", options: ["Nazareth", "Jerusalem", "Bethlehem", "Capernaum"], answer: 2, ref: "Matthew 2:1", fact: "Micah had foretold a ruler from Bethlehem centuries earlier, in Micah 5:2." },
  { q: "Who was the first king of Israel?", options: ["David", "Saul", "Solomon", "Samuel"], answer: 1, ref: "1 Samuel 10", fact: "Saul was tall and impressive, but season 3 shows that God looks at the heart." },
  { q: "How many apostles did Jesus choose?", options: ["7", "10", "12", "70"], answer: 2, ref: "Mark 3:14", fact: "Twelve, echoing the twelve tribes of Israel." },
  { q: "What was Paul's name before he became known as Paul?", options: ["Silas", "Saul", "Simon", "Stephen"], answer: 1, ref: "Acts 13:9", fact: "He was a Pharisee who persecuted the church before meeting Jesus on the Damascus road." },
  { q: "What did Esau sell his birthright for?", options: ["Silver", "A robe", "A bowl of stew", "A field"], answer: 2, ref: "Genesis 25:34", fact: "Bread and pottage of lentils. One hungry moment, a lifetime of regret." },
  { q: "What was Jesus' first miracle in John's Gospel?", options: ["Healing a blind man", "Water into wine", "Walking on water", "Feeding 5,000"], answer: 1, ref: "John 2", fact: "At a wedding in Cana, when the wine ran out." },
  { q: "Which prophet was taken to heaven in a whirlwind?", options: ["Elisha", "Isaiah", "Elijah", "Enoch"], answer: 2, ref: "2 Kings 2:11", fact: "A chariot of fire appeared, and Elijah went up by a whirlwind." },
  { q: "In what language was most of the New Testament written?", options: ["Hebrew", "Latin", "Aramaic", "Greek"], answer: 3, ref: "Whole New Testament", fact: "Common (Koine) Greek, thanks to Alexander the Great spreading Greek across the world." },
  { q: "Who interpreted Pharaoh's dreams of fat and thin cows?", options: ["Daniel", "Joseph", "Moses", "Aaron"], answer: 1, ref: "Genesis 41", fact: "That is season 2, episode 5. Joseph goes from prison to prime minister in a day." },
  { q: "Which is the shortest Gospel?", options: ["Matthew", "Mark", "Luke", "John"], answer: 1, ref: "Mark", fact: "Mark has 16 chapters. It is season 4, and you can finish it in about an hour." },
];

export const timelineEvents: { id: string; label: string; ref: string }[] = [
  { id: "creation", label: "Creation", ref: "Genesis 1" },
  { id: "flood", label: "The Flood", ref: "Genesis 7" },
  { id: "abraham", label: "God calls Abram", ref: "Genesis 12" },
  { id: "joseph", label: "Joseph sold into Egypt", ref: "Genesis 37" },
  { id: "exodus", label: "The Exodus", ref: "Exodus 14" },
  { id: "david", label: "David becomes king", ref: "2 Samuel 5" },
  { id: "temple", label: "Solomon builds the temple", ref: "1 Kings 6" },
  { id: "exile", label: "Exile to Babylon", ref: "2 Kings 25" },
  { id: "jesus", label: "Birth of Jesus", ref: "Luke 2" },
  { id: "pentecost", label: "Pentecost", ref: "Acts 2" },
];
