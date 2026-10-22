# Chatbot API

A single Vercel Edge Function (`api/chat.js`) that streams answers about Jumin's portfolio from Claude. The site on GitHub Pages calls it; everything the model knows comes from `knowledge.js`, which is generated from the site's own data.

## Deploy (one time)

```bash
cd chatbot-api
npm install
npx vercel login
npx vercel link            # create a new project, e.g. "jumin-chatbot-api"
npx vercel env add ANTHROPIC_API_KEY production   # paste the key when prompted
npx vercel --prod
```

The deploy prints a URL such as `https://jumin-chatbot-api.vercel.app`. Put it in the site's `.env.production`:

```
VITE_CHAT_API_URL=https://jumin-chatbot-api.vercel.app/api/chat
```

then commit and push; GitHub Pages rebuilds with the chat connected. Until that variable is set, the site answers from its built-in portfolio index instead.

## Environment variables

| Name | Default | Purpose |
| --- | --- | --- |
| `ANTHROPIC_API_KEY` | — | Required. Set it in Vercel, never in the repo. |
| `CHAT_MODEL` | `claude-opus-5-5` | Model id. |
| `ALLOWED_ORIGINS` | GitHub Pages + localhost | Comma-separated origins allowed to call the function. |
| `RATE_LIMIT_PER_IP` | `24` | Messages per IP per 10 minutes (per edge instance). |
| `DAILY_CAP` | `600` | Messages per day across all visitors (per edge instance). |

## Updating what the bot knows

The knowledge file is generated, not edited:

```bash
node scripts/build-chat-knowledge.mjs   # from the repo root
cd chatbot-api && npx vercel --prod
```

Run it whenever `src/data/*.json` or the project copy changes. The system prompt is cached by Anthropic (prompt caching), so repeat questions cost a fraction of the first.

## Notes

- The function refuses requests from other origins, caps conversation length, and limits message rate. The limits live in memory per edge instance, so they are a speed bump rather than a hard wall; move them to Vercel KV if abuse ever becomes a problem.
- Server-side refusal fallback (`fallbacks: "default"`) is on, so a rare safety decline is re-run on a fallback model inside the same request.
