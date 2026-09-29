export interface Era {
  id: string;
  date: string;
  title: string;
  people: string;
  summary: string;
  read: string[];
  world: string[];
}

export const eras: Era[] = [
  {
    id: "beginning",
    date: "Before history",
    title: "The Beginning",
    people: "Adam · Eve · Noah",
    summary: "Creation, the fall, the flood and the tower of Babel — the story of why the world is both beautiful and broken.",
    read: ["Genesis 1", "Genesis 3", "Genesis 11"],
    world: ["Genesis 1–11 is told before any nations, kings or dates appear — it's the prologue to everything."],
  },
  {
    id: "patriarchs",
    date: "c. 2000–1800 BC",
    title: "The Patriarchs",
    people: "Abraham · Isaac · Jacob · Joseph",
    summary: "God calls one man from Ur and promises that through his family all nations will be blessed.",
    read: ["Genesis 12", "Genesis 22", "Genesis 37"],
    world: [
      "The Great Pyramid of Giza (c. 2560 BC) was already around 500 years old when Abraham was born.",
      "The Code of Hammurabi was carved in Babylon around 1754 BC.",
    ],
  },
  {
    id: "exodus",
    date: "c. 1446 or c. 1260 BC",
    title: "Exodus & Wilderness",
    people: "Moses · Aaron · Miriam",
    summary: "Ten plagues, the Red Sea, the Ten Commandments, and forty years in the desert. Scholars debate the exact date.",
    read: ["Exodus 3", "Exodus 14", "Exodus 20"],
    world: [
      "Tutankhamun ruled Egypt around 1332–1323 BC.",
      "Ramesses II (1279–1213 BC) is often linked to the Exodus story; others place it earlier.",
    ],
  },
  {
    id: "judges",
    date: "c. 1400/1200–1050 BC",
    title: "Conquest & Judges",
    people: "Joshua · Deborah · Gideon · Samson · Ruth",
    summary: "Israel enters the land, then spirals: “every man did that which was right in his own eyes.”",
    read: ["Joshua 1", "Judges 7", "Ruth 1"],
    world: [
      "The Late Bronze Age collapse (c. 1200–1150 BC) toppled empires across the Mediterranean.",
      "Greek legend sets the Trojan War around this era.",
    ],
  },
  {
    id: "kingdom",
    date: "c. 1050–930 BC",
    title: "The United Kingdom",
    people: "Saul · David · Solomon",
    summary: "Israel gets its kings. David unites the nation; Solomon builds the temple — then it all begins to crack.",
    read: ["1 Samuel 17", "2 Samuel 7", "1 Kings 3"],
    world: [
      "The Zhou dynasty began in China in 1046 BC.",
      "Phoenician traders were spreading the alphabet that eventually became the one you're reading now.",
    ],
  },
  {
    id: "divided",
    date: "930–586 BC",
    title: "The Divided Kingdom",
    people: "Elijah · Isaiah · Amos · Hosea · Jonah",
    summary: "Israel splits into north and south. Prophets thunder warnings; Assyria destroys the north in 722 BC.",
    read: ["1 Kings 18", "Isaiah 6", "Jonah 1"],
    world: [
      "The first Olympic Games (776 BC) took place around the time Amos and Hosea were preaching.",
      "By tradition, Rome was founded in 753 BC.",
    ],
  },
  {
    id: "exile",
    date: "586–538 BC",
    title: "The Exile",
    people: "Daniel · Ezekiel · Jeremiah",
    summary: "Babylon burns Jerusalem and the temple. In a foreign empire, faith has to survive without a homeland.",
    read: ["Daniel 3", "Daniel 6", "Ezekiel 37"],
    world: [
      "Nebuchadnezzar II built Babylon's famous blue Ishtar Gate around 575 BC.",
      "Cyrus the Great of Persia conquered Babylon in 539 BC — Isaiah 45:1 calls him by name.",
    ],
  },
  {
    id: "return",
    date: "538–430 BC",
    title: "Return & Rebuilding",
    people: "Ezra · Nehemiah · Esther · Haggai · Malachi",
    summary: "Exiles return to rebuild the temple and walls, while Esther saves her people inside the Persian palace.",
    read: ["Ezra 3", "Nehemiah 2", "Esther 4"],
    world: [
      "Confucius was teaching in China (551–479 BC) while the temple was being rebuilt.",
      "The King Ahasuerus in Esther is widely identified as Xerxes I — the Persian king who invaded Greece in 480 BC, the story behind the film “300.”",
      "Athens built the Parthenon (447–432 BC) around Nehemiah's time.",
    ],
  },
  {
    id: "silence",
    date: "c. 430–5 BC",
    title: "The 400 Silent Years",
    people: "Between Malachi and Matthew",
    summary: "No new prophets — but empires rise that set the stage for the gospel to spread.",
    read: ["Malachi 4", "Daniel 2"],
    world: [
      "Alexander the Great conquered much of the known world (336–323 BC), making Greek the common language — which is why the New Testament was written in Greek.",
      "The Hebrew scriptures were translated into Greek (the Septuagint) in the 3rd–2nd centuries BC.",
      "Julius Caesar was assassinated in 44 BC — roughly 40 years before Jesus was born.",
    ],
  },
  {
    id: "jesus",
    date: "c. 5 BC – AD 30/33",
    title: "The Life of Jesus",
    people: "Jesus · Mary · John the Baptist · the Twelve",
    summary: "Born in Bethlehem, raised in Nazareth, crucified in Jerusalem — and risen.",
    read: ["Luke 2", "Mark 4", "Mark 16"],
    world: [
      "Caesar Augustus ruled Rome (27 BC – AD 14) — his census is in Luke 2:1.",
      "Luke 3:1 dates John the Baptist's ministry to the fifteenth year of Emperor Tiberius.",
    ],
  },
  {
    id: "church",
    date: "AD 30–100",
    title: "The Early Church",
    people: "Peter · Paul · John · Lydia · Timothy",
    summary: "Fire falls at Pentecost and a movement spreads from Jerusalem to the capital of the empire.",
    read: ["Acts 2", "Acts 9", "Revelation 21"],
    world: [
      "The Great Fire of Rome (AD 64) — Emperor Nero blamed the Christians.",
      "Roman general Titus destroyed Jerusalem's temple in AD 70.",
      "Mount Vesuvius buried Pompeii in AD 79; the Colosseum opened in AD 80.",
    ],
  },
];

export interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
  note: string;
  read: string;
}

export const places: Place[] = [
  { id: "ur", name: "Ur", lat: 30.96, lon: 46.1, note: "Abraham's hometown in Mesopotamia — a wealthy city he left on God's word.", read: "Genesis 11" },
  { id: "haran", name: "Haran", lat: 36.87, lon: 39.03, note: "Where Abram's family settled before God called him onward.", read: "Genesis 12" },
  { id: "jerusalem", name: "Jerusalem", lat: 31.78, lon: 35.23, note: "David's capital, site of the temple, the cross and the empty tomb.", read: "2 Samuel 5" },
  { id: "bethlehem", name: "Bethlehem", lat: 31.4, lon: 35.05, note: "Birthplace of David — and of Jesus.", read: "Luke 2" },
  { id: "nazareth", name: "Nazareth", lat: 32.7, lon: 35.3, note: "The small town where Jesus grew up.", read: "Luke 4" },
  { id: "egypt", name: "Memphis, Egypt", lat: 29.85, lon: 31.25, note: "Joseph rose to power in Egypt; Israel later left in the Exodus.", read: "Genesis 41" },
  { id: "sinai", name: "Mount Sinai", lat: 28.54, lon: 33.97, note: "Traditional site where Moses received the Ten Commandments.", read: "Exodus 20" },
  { id: "babylon", name: "Babylon", lat: 32.54, lon: 44.42, note: "Capital of the empire that exiled Judah — home of Daniel.", read: "Daniel 1" },
  { id: "nineveh", name: "Nineveh", lat: 36.36, lon: 43.15, note: "Assyria's capital, where Jonah finally preached.", read: "Jonah 3" },
  { id: "susa", name: "Susa (Shushan)", lat: 32.19, lon: 48.26, note: "Persian royal city — the setting of Esther and Nehemiah's service.", read: "Esther 1" },
  { id: "damascus", name: "Damascus", lat: 33.51, lon: 36.29, note: "On the road here, Saul the persecutor met the risen Jesus.", read: "Acts 9" },
  { id: "antioch", name: "Antioch", lat: 36.2, lon: 36.16, note: "Where believers were first called Christians; launch-pad for Paul's journeys.", read: "Acts 11" },
  { id: "ephesus", name: "Ephesus", lat: 37.94, lon: 27.34, note: "A major city where Paul stayed about three years.", read: "Acts 19" },
  { id: "athens", name: "Athens", lat: 37.98, lon: 23.73, note: "Paul preached about the “unknown god” to philosophers.", read: "Acts 17" },
  { id: "corinth", name: "Corinth", lat: 37.91, lon: 22.88, note: "A busy port city; Paul later wrote it two letters.", read: "Acts 18" },
  { id: "rome", name: "Rome", lat: 41.9, lon: 12.5, note: "Capital of the empire. Acts ends with Paul preaching here.", read: "Acts 28" },
];

export const routes: { id: string; name: string; stops: string[]; color: string }[] = [
  { id: "abraham", name: "Abraham's journey", stops: ["ur", "haran", "jerusalem", "egypt"], color: "#9b2f22" },
  { id: "exodus", name: "The Exodus", stops: ["egypt", "sinai", "jerusalem"], color: "#4d6b47" },
  { id: "exile", name: "Into exile", stops: ["jerusalem", "babylon", "susa"], color: "#a8542b" },
  { id: "paul", name: "Paul's world (simplified)", stops: ["jerusalem", "damascus", "antioch", "ephesus", "athens", "corinth", "rome"], color: "#5a6b8c" },
];
