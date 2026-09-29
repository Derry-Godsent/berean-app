/**
 * Berean — instant answers service
 * Deploy on Cloudflare Workers (free tier: 100,000 requests/day).
 *
 *   wrangler deploy worker/ask.js
 *
 * Then set your AI key once (never put it in the browser — the browser is
 * public and anyone can read it):
 *
 *   wrangler secret put AI_API_KEY
 *
 * Finally paste the worker URL into Berean → Profile → Instant answers service.
 *
 * Any OpenAI-compatible API works. For a free or cheap option use Groq,
 * Google Gemini or OpenRouter, and swap BASE below.
 */

const BASE = "https://api.openai.com/v1/chat/completions";
const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `You are the study assistant inside Berean, a Bible reading app for Christians worldwide.

Rules — these matter more than fluency:
1. Never invent a verse, a quotation, a chapter number or a person. If you are not sure, say so plainly and suggest where to look.
2. Always answer from Scripture itself first. Cite book, chapter and verse, e.g. "Romans 8:28". List every reference you used under "refs".
3. Use the King James Version wording when quoting, and note when a word is archaic (e.g. "upbraideth" means "finds fault").
4. Keep answers warm, direct and under about 180 words. Plain English beats theology-speak.
5. End practical answers with one small step the reader can take today.
6. If the question is about another religion, self-harm, or is not about faith at all, be kind, say Berean is a Bible study tool, and answer briefly or decline.
7. Never claim to be God, to hear from God, or to replace a pastor. Suggest their church leader for personal or pastoral matters.

You are a study aid. The reader should always compare your answer with their Bible.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST")
      return new Response("Method not allowed", { status: 405, headers: CORS });

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const question = String(body.question ?? "").slice(0, 1200).trim();
    if (!question) return json({ error: "Missing question" }, 400);

    const context = [
      body.bookId ? `Book: ${body.bookId}` : null,
      body.chapter ? `Chapter: ${body.chapter}` : null,
      body.verse ? `Verse: ${body.verse}` : null,
      body.verseText ? `The verse being asked about: "${body.verseText}"` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await fetch(BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: MODEL,
          temperature: 0.2,
          max_tokens: 400,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            {
              role: "user",
              content: context ? `${context}\n\nQuestion: ${question}` : question,
            },
          ],
        }),
      });

      if (!res.ok) {
        const detail = await res.text();
        return json({ error: "Upstream error", detail: detail.slice(0, 200) }, 502);
      }

      const data = await res.json();
      const answer = data?.choices?.[0]?.message?.content ?? "";

      // Pull "Book Chapter:Verse" references out of the answer text.
      const refs = [
        ...new Set(
          (
            answer.match(
              /\b(1|2|3\s?)?[A-Z][a-z]+(?:\s(?:of\s)?[A-Z][a-z]+)?\s+\d{1,3}(?::\d{1,3}(?:-\d{1,3})?)?/g
            ) ?? []
          ).map((r) => r.trim())
        ),
      ].slice(0, 6);

      return json({ answer, refs });
    } catch (err) {
      return json({ error: "Request failed", detail: String(err) }, 500);
    }
  },
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}
