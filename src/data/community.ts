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
  { id: "room", name: "The Upper Room", desc: "Opening soon: everyone reading together" },
  { id: "s2", name: "Season 2: The Money Question", desc: "Episode talk. Spoilers are blurred" },
  { id: "questions", name: "Ask the Room", desc: "No question is too basic" },
  { id: "cell", name: "My Cell Group", desc: "Sample preview of cell-group tools" },
] as const;

export type ChannelId = (typeof channels)[number]["id"];
