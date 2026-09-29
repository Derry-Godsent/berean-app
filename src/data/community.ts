export interface Msg {
  id: string;
  user: string;
  city: string;
  flag: string;
  color: string;
  text: string;
  time: string;
  reactions: { pray: number; fire: number; heart: number };
  mine?: boolean;
  pastor?: boolean;
  spoiler?: string;
}

export const channels = [
  { id: "room", name: "The Upper Room", desc: "Everyone, everywhere, reading together" },
  { id: "s2", name: "Season 2: The Money Question", desc: "Episode talk. Spoilers are blurred" },
  { id: "questions", name: "Ask the Room", desc: "No question is too basic" },
  { id: "cell", name: "My Cell Group", desc: "Adenta Thursday Cell. Streaks and prayer" },
] as const;

export type ChannelId = (typeof channels)[number]["id"];

const r = (pray: number, fire: number, heart: number) => ({ pray, fire, heart });

export const seedMessages: Record<string, Msg[]> = {
  room: [
    { id: "m1", user: "Kwame", city: "Accra", flag: "GH", color: "#9b2f22", text: "Day 12 and I finally get why /Psalm 1:3 compares us to a tree planted by water. Roots first, fruit later.", time: "09:12", reactions: r(4, 11, 7) },
    { id: "m2", user: "Sarah", city: "London", flag: "UK", color: "#5a6b8c", text: "Started this month at literally zero. Nine chapters in. Not stopping.", time: "09:20", reactions: r(2, 24, 16) },
    { id: "m3", user: "Grace", city: "Lagos", flag: "NG", color: "#4d6b47", text: "Joseph in /Genesis 41 was basically running Egypt's central bank. A fourteen-year savings plan from a dream.", time: "09:41", reactions: r(1, 19, 5), spoiler: "s2e5" },
    { id: "m4", user: "Daniel", city: "Nairobi", flag: "KE", color: "#a8542b", text: "Just finished /S2E3. “Thou fool, this night thy soul shall be required of thee” hit me hard. That is /Luke 12:20.", time: "10:03", reactions: r(9, 14, 3), spoiler: "s2e3" },
    { id: "m5", user: "Miguel", city: "Sao Paulo", flag: "BR", color: "#7a5b8c", text: "Season 5 premieres Sunday. Who is reading /Acts 2 live with us?", time: "10:15", reactions: r(3, 31, 8) },
    { id: "m6", user: "Ana", city: "Manila", flag: "PH", color: "#8a7a3f", text: "Tip: turn on the one-minute mode on the trotro. One verse is better than none.", time: "10:32", reactions: r(0, 12, 20) },
  ],
  s2: [
    { id: "s1", user: "Joy", city: "Houston", flag: "US", color: "#4d6b47", text: "/S2E2 made me check my bank app and my heart at the same time. /Matthew 6:21 is a mirror.", time: "Yesterday", reactions: r(6, 17, 9), spoiler: "s2e2" },
    { id: "s2", user: "Kofi", city: "Kumasi", flag: "GH", color: "#9b2f22", text: "Unpopular opinion: the dishonest manager in /Luke 16 is the smartest person in the whole season.", time: "Yesterday", reactions: r(1, 22, 4), spoiler: "s2e4" },
    { id: "s3", user: "Esther", city: "Kigali", flag: "RW", color: "#a8542b", text: "Paul never said money is the root of all evil. Read /1 Timothy 6:10 again, slowly.", time: "08:10", reactions: r(3, 28, 11), spoiler: "s2e6" },
  ],
  questions: [
    { id: "q1", user: "Lerato", city: "Johannesburg", flag: "ZA", color: "#5a6b8c", text: "In /Matthew 6:24 what exactly is “mammon”? Is it a demon?", time: "08:44", reactions: r(2, 1, 3) },
    { id: "q2", user: "Pastor Emmanuel", city: "Accra", flag: "GH", color: "#9b2f22", pastor: true, text: "Good question, Lerato. Mammon is an Aramaic word for wealth. Jesus personifies it as a master competing for your loyalty. Not a demon, but a rival god. Money is a great servant and a terrible master.", time: "08:52", reactions: r(12, 9, 21) },
    { id: "q3", user: "Tunde", city: "Abuja", flag: "NG", color: "#4d6b47", text: "Why does /James 1:5 say God “upbraideth not”? What does that word mean?", time: "09:30", reactions: r(1, 0, 2) },
    { id: "q4", user: "Hannah", city: "Toronto", flag: "CA", color: "#7a5b8c", text: "Tunde, it means he does not scold you for asking. Tap any underlined word in the reader and it explains itself.", time: "09:34", reactions: r(4, 6, 13) },
  ],
};

export const pulse = [
  "Kwame in Accra finished season 2, episode 3",
  "Sarah in London asked a question about Proverbs 3:9",
  "Grace in Lagos solved today's daily word in three tries",
  "Miguel in Sao Paulo is on a 21-day streak",
  "Pastor Emmanuel published this Sunday's sermon",
  "Ana in Manila highlighted Psalm 23:1",
  "Adenta Cell reached a 23-day group streak",
  "Lerato in Johannesburg started season 1",
];
