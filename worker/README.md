# Instant answers service

The app already answers questions on its own — archaic words, who wrote each book,
what each book is about, and the ten biggest life topics (money, anxiety, prayer,
faith, forgiveness, purpose, love, fear, temptation, suffering). When it isn't
certain, it says so instead of guessing.

For free-form AI answers, deploy this tiny service and paste its URL into
**Berean → Profile → Instant answers service → Test connection**.

## Deploy (about 3 minutes, free)

1. Install the command line tool: `npm i -g wrangler`
2. Log in: `wrangler login`
3. Deploy: `wrangler deploy worker/ask.js`
4. Save your AI key as a secret: `wrangler secret put AI_API_KEY`
5. Copy the URL it prints (something like `https://ask.YOUR-NAME.workers.dev`)
   and paste it into the app.

## Choosing an AI provider

`worker/ask.js` calls an OpenAI-compatible endpoint. Change `BASE` and `MODEL`
at the top of the file to use another provider:

- Groq — very fast, generous free tier
- Google Gemini — free tier
- OpenRouter — many models, pay as you go

The key is stored **on the server only**, which is what keeps it safe.
Never put an AI key in the app code: everything in the app is public and readable.

## Why a service instead of asking directly?

- Your key stays secret
- You control the prompt (see `SYSTEM_PROMPT`) so answers stay careful and honest
  about Scripture rather than confident and wrong
- You can add rate limiting later when churches are paying for it

## What still runs without it

Reading, seasons, games, the Room, offline library, progress, the pastor's
sermon builder and the church insights all work with no server at all.
