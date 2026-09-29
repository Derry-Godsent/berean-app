import { bookById, findBook, glossary, topics, type Book } from "../data/bible";

export interface AskContext {
  bookId?: string;
  chapter?: number;
  verse?: number;
  verseText?: string;
}

export interface Answer {
  text: string;
  refs: string[];
  kind: "word" | "book" | "topic" | "study" | "verse" | "unsure" | "live";
}

/**
 * PRODUCTION: set VITE_ASK_ENDPOINT to a serverless function (e.g. a free
 * Cloudflare Worker) that calls an AI model with the question + verse context.
 * Never put an AI API key in the browser.
 */
const ENDPOINT: string | undefined = (import.meta as unknown as { env?: Record<string, string> }).env
  ?.VITE_ASK_ENDPOINT;

/** Saved from Settings — no rebuild needed to connect your own answer service. */
export function askEndpoint(): string | undefined {
  try {
    return localStorage.getItem("berean:ask:endpoint") || ENDPOINT || undefined;
  } catch {
    return ENDPOINT;
  }
}

export function setAskEndpoint(url: string) {
  try {
    if (url.trim()) localStorage.setItem("berean:ask:endpoint", url.trim());
    else localStorage.removeItem("berean:ask:endpoint");
  } catch {
    /* ignore */
  }
}

const study: { match: RegExp; text: string; refs: string[] }[] = [
  {
    match: /\bselah\b/i,
    text: "“Selah” appears 71 times in the Psalms and three times in Habakkuk. Nobody knows its exact meaning for certain — most scholars think it was a musical or liturgical instruction, like a pause to reflect. A good way to read it: stop, breathe, and let the last line sink in.",
    refs: ["Psalm 46", "Habakkuk 3"],
  },
  {
    match: /why did jesus (have to )?die|why .*cross|purpose of the cross/i,
    text: "The New Testament's answer is that Jesus died for our sins — taking the penalty and the separation that sin causes, so we could be reconciled to God. It's presented as the ultimate act of love (Romans 5:8), and the resurrection shows the sacrifice was accepted and death defeated.",
    refs: ["Romans 5:8", "Isaiah 53", "2 Corinthians 5:21", "Mark 10:45"],
  },
  {
    match: /what is (the )?gospel|good news/i,
    text: "“Gospel” means good news. In short: God made us for Himself; sin separated us; Jesus — fully God and fully man — lived the life we couldn't, died for our sins, and rose again; and everyone who turns to Him in faith is forgiven and given new life.",
    refs: ["1 Corinthians 15:1-4", "John 3:16", "Romans 6:23", "Ephesians 2:8-9"],
  },
  {
    match: /trinity|father.*son.*spirit/i,
    text: "The word “Trinity” isn't in the Bible, but Christians use it to summarise what the Bible teaches: there is one God (Deuteronomy 6:4), and the Father, the Son and the Holy Spirit are each fully God. You see all three together at Jesus' baptism and in the Great Commission.",
    refs: ["Deuteronomy 6:4", "Matthew 3:16-17", "Matthew 28:19", "John 1:1"],
  },
  {
    match: /pharisee/i,
    text: "The Pharisees were a devout Jewish renewal movement focused on careful obedience to God's law and their traditions. Jesus often clashed with them — not because they were irreligious, but because rule-keeping had replaced mercy and a real heart for God. Paul himself was a Pharisee.",
    refs: ["Matthew 23", "Luke 18:9-14", "Philippians 3:5"],
  },
  {
    match: /genealog|begat|so many names/i,
    text: "Genealogies can feel boring, but they were how ancient readers traced identity and promises. They show God keeping His word across generations — Matthew's list, for example, proves Jesus is the son of Abraham and David, and quietly includes women and outsiders like Rahab and Ruth.",
    refs: ["Matthew 1", "Genesis 5", "Ruth 4:18-22"],
  },
  {
    match: /old (and|vs|versus) new testament|difference between .*testament/i,
    text: "The Old Testament (39 books) tells the story of God's promises to Israel — creation, the law, kings and prophets. The New Testament (27 books) announces that those promises are fulfilled in Jesus and tells the story of the early church. It's one story in two acts.",
    refs: ["Luke 24:27", "Hebrews 1:1-2", "Jeremiah 31:31"],
  },
  {
    match: /holy (spirit|ghost)/i,
    text: "The Holy Spirit is God present with and within believers. Jesus promised the Spirit as a Comforter and guide; at Pentecost the Spirit came with wind and fire. The Spirit convicts, teaches, empowers and grows fruit like love, joy and peace in a believer's life.",
    refs: ["John 14:26", "Acts 2", "Galatians 5:22-23"],
  },
  {
    match: /how (do i|to|should i) (start )?read/i,
    text: "Start small and consistent: 5–10 minutes daily beats a long read once a month. A Gospel like Mark is a great starting point (it's Season 4 here). Read slowly, underline what stands out, ask one question, and apply one thing that day. Reading with others — your cell group — makes it stick.",
    refs: ["Psalm 1:2", "Joshua 1:8", "Acts 17:11"],
  },
];

function hasMeaningIntent(q: string) {
  return /\bmean|meaning|define|definition|what is|what's|whats\b/i.test(q) || q.trim().split(/\s+/).length <= 3;
}

function bookFromQuestion(q: string): Book | undefined {
  const m = q.match(/\b([1-3]?\s?[A-Z][a-z]+(?:\s(?:of\s)?[A-Z][a-z]+)?)\b/g);
  if (!m) return undefined;
  for (const cand of m) {
    const b = findBook(cand);
    if (b) return b;
  }
  return undefined;
}

function glossaryWordsIn(text: string): string[] {
  const found = new Set<string>();
  for (const w of text.toLowerCase().match(/[a-z]+/g) ?? []) if (glossary[w]) found.add(w);
  return [...found];
}

export async function ask(question: string, ctx: AskContext): Promise<Answer> {
  const q = question.trim();
  const lower = q.toLowerCase();

  const endpoint = askEndpoint();
  if (endpoint) {
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, ...ctx }),
      });
      if (res.ok) {
        const j = await res.json();
        return { text: j.answer, refs: j.refs ?? [], kind: "live" };
      }
    } catch {
      /* fall through to local engine */
    }
  }

  // 1. Curated study answers
  for (const s of study) if (s.match.test(q)) return { text: s.text, refs: s.refs, kind: "study" };

  // 2. Word meanings
  if (hasMeaningIntent(q)) {
    const words = glossaryWordsIn(q.replace(/what does|mean|meaning/gi, ""));
    if (words.length) {
      const text = words.map((w) => `“${w}” — ${glossary[w]}`).join("\n\n");
      return { text, refs: [], kind: "word" };
    }
  }

  // 3. Book questions
  const book = bookFromQuestion(q) ?? (ctx.bookId ? bookById(ctx.bookId) : undefined);
  if (book && /who wrote|author|written by/i.test(lower)) {
    return {
      text: `${book.name} — author: ${book.author}.\n\nIt belongs to the ${book.genre} section of the ${
        book.testament === "OT" ? "Old" : "New"
      } Testament. In one line: ${book.about}`,
      refs: [`${book.name} 1`],
      kind: "book",
    };
  }
  if (book && /about|summary|summarise|summarize|overview|theme/i.test(lower)) {
    return {
      text: `${book.name} in one line: ${book.about}\n\n${book.chapters} chapter${book.chapters > 1 ? "s" : ""} · ${book.genre} · ${book.author}.`,
      refs: [`${book.name} 1`],
      kind: "book",
    };
  }

  // 4. Topics
  const scored = topics
    .map((t) => ({ t, score: t.keywords.filter((k) => new RegExp(`\\b${k}\\b`, "i").test(lower)).length }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  if (scored.length) {
    const t = scored[0].t;
    return { text: `${t.name}: ${t.summary}`, refs: t.refs.slice(0, 5), kind: "topic" };
  }

  // 5. Explain this verse — structured study help
  if (ctx.verseText && /explain|meaning|mean|understand|this verse|what is (he|this) saying/i.test(lower)) {
    const b = ctx.bookId ? bookById(ctx.bookId) : undefined;
    const words = glossaryWordsIn(ctx.verseText);
    const topicHits = topics.filter((t) => t.keywords.some((k) => new RegExp(`\\b${k}\\b`, "i").test(ctx.verseText!)));
    const parts: string[] = [];
    if (b) parts.push(`Context — ${b.name}: ${b.about}`);
    if (words.length) parts.push(`Key words — ${words.slice(0, 4).map((w) => `“${w}”: ${glossary[w]}`).join(" ")}`);
    if (topicHits.length) parts.push(`Theme — this verse connects to ${topicHits.map((t) => t.name.toLowerCase()).join(" and ")}. ${topicHits[0].summary}`);
    parts.push("Try this — read the verses just before and after it, then ask: what does this show me about God, and what is one thing I can do today?");
    return { text: parts.join("\n\n"), refs: topicHits[0]?.refs.slice(0, 3) ?? [], kind: "verse" };
  }

  // 6. Honest fallback
  return {
    text: "I'm not confident enough to answer that one well yet — and with Scripture, a wrong answer is worse than no answer. I've saved it to your Questions so you can bring it to your cell group or pastor, or post it in Ask The Room where others can help.",
    refs: [],
    kind: "unsure",
  };
}

export function suggestionsFor(bookId: string, verseTexts: string[]): string[] {
  const b = bookById(bookId);
  const words = glossaryWordsIn(verseTexts.join(" "))
    .filter((w) => !["unto", "thee", "thou", "thy", "hath", "doth", "ye"].includes(w))
    .slice(0, 2);
  const s = [`Who wrote ${b?.name ?? "this book"}?`, `What is ${b?.name ?? "this book"} about?`];
  for (const w of words) s.push(`What does “${w}” mean?`);
  s.push("Explain this verse");
  return s;
}
