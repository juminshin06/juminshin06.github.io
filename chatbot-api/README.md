# Chatbot API

A single Vercel Edge Function (`api/chat.js`) that streams answers about Jumin's portfolio from Google's Gemini Flash on the free tier. The site on GitHub Pages calls it; everything the model knows comes from `knowledge.js`, which is generated from the site's own data. No npm dependencies: the function talks to the Gemini REST API with `fetch`.

## 1. Get a free Gemini key

1. Open https://aistudio.google.com/apikey and sign in with a Google account.
2. Click **Create API key** (create a new Google Cloud project if it asks). No card is required for the free tier.
3. Copy the key. It starts with `AIza`.

## 2. Deploy to Vercel (one time)

```bash
cd chatbot-api
npx vercel login
npx vercel link            # "set up and deploy"? -> yes; new project, e.g. "jumin-chatbot-api"
npx vercel env add GEMINI_API_KEY production   # paste the key when prompted
npx vercel --prod
```

The deploy prints a URL such as `https://jumin-chatbot-api.vercel.app`. Put it in the site's `.env.production`:

```
VITE_CHAT_API_URL=https://jumin-chatbot-api.vercel.app/api/chat
```

then commit and push; GitHub Pages rebuilds with the chat connected. Until that variable is set, the site answers from its built-in portfolio index instead, and it falls back to that index whenever the function errors or the free quota is exhausted.

## 3. Check it

```bash
curl -N -X POST https://jumin-chatbot-api.vercel.app/api/chat \
  -H 'Content-Type: application/json' -H 'Origin: https://juminshin06.github.io' \
  -d '{"messages":[{"role":"user","content":"What did Jumin build at Bubba'\''s LA?"}]}'
```

You should see the answer stream in.

## Environment variables

| Name | Default | Purpose |
| --- | --- | --- |
| `GEMINI_API_KEY` | — | Required. Set it in Vercel, never in the repo. |
| `GEMINI_MODEL` | `gemini-3.8-flash` | Model id. Any Flash model on the free tier works. |
| `ALLOWED_ORIGINS` | GitHub Pages + localhost | Comma-separated origins allowed to call the function. |
| `RATE_LIMIT_PER_IP` | `24` | Messages per IP per 10 minutes (per edge instance). |
| `DAILY_CAP` | `600` | Messages per day across all visitors (per edge instance). |
| `FIRST_TEXT_MS` | `15000` | How long to wait for Gemini's first words before the site answers from its own index. |

## Updating what the bot knows

The knowledge file is generated, not edited:

```bash
node scripts/build-chat-knowledge.mjs   # from the repo root
cd chatbot-api && npx vercel --prod
```

Run it whenever `src/data/*.json` or the project copy changes.

## Notes

- When the free tier is busy, Gemini can take a minute or more to start answering. The function gives up after `FIRST_TEXT_MS` and the site answers from its built-in index, so visitors never wait long.
- Free-tier limits are per Google project (requests per minute and per day). The per-IP and daily caps here keep one visitor from burning the whole quota; when Google returns 429 the site quietly falls back to the built-in index.
- The function refuses requests from other origins and caps conversation length. The limits live in memory per edge instance, so they are a speed bump rather than a hard wall.
