# TsunaGo 繋 — India market entry for Japanese SMEs

Team Shinazugawa · Thapar × JETRO Hackathon

TsunaGo connects the decisions a first-time entrant must make together (region, partner,
price and service model) and shows every recommendation with its evidence.

## Run it

```bash
cd app
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in app/dist
```

## AI setup (free)

TsunaGo runs on open models through any OpenAI-compatible provider. The free default:

| Key | What for | Get it free |
|---|---|---|
| `GROQ_API_KEY` | The model (Llama 3.3 70B) for Partner Scout and brochure analysis | https://console.groq.com |
| `TAVILY_API_KEY` | Web search for Partner Scout | https://tavily.com |

```bash
cp app/.env.example app/.env.local   # then paste the two keys
```

Keys stay on the server (`/api/*`), never in the browser. Alternatives are in `app/.env.example`:
Hugging Face, OpenRouter, Claude, or **Ollama for a fully offline model**.
Without keys, the simulated Partner Scout run and the two sample brochures still work.

## Partner Scout (AI agent)

**✦ Partner Scout** takes a goal in English or Japanese and runs an agent loop in short steps:
plan searches → search the web → read companies' own websites (two at a time) → extract a
profile with a verbatim quote per fact → score with the TsunaGo engine → search again if fewer
than two partners pass → draft a bilingual introduction.

- Directories and marketplaces (IndiaMART, Justdial, …) are skipped by policy. Only companies'
  own public pages and the business contacts they publish are used.
- Every quote, email and phone number is checked against the fetched page; anything not found is flagged.
- Messages open as email or WhatsApp drafts. Nothing is sent automatically.
- **Save run** downloads a recording; **Replay saved run** plays it back offline (use this as the stage backup).

## Google sign-in (optional, recommended when deployed)

When `GOOGLE_CLIENT_ID` is set, the live AI routes (`/api/scout`, `/api/extract`) require a Google
sign-in, so visitors can't use up your free API quota. Simulated and replayed runs stay open.

1. In Google Cloud Console → *APIs & Services → Credentials*, create an **OAuth client ID** (Web application).
2. Add **Authorized JavaScript origins**: `http://localhost:5173` and `https://<your-app>.vercel.app`.
3. Set `GOOGLE_CLIENT_ID` and a random `SESSION_SECRET` (32+ characters, e.g. `openssl rand -base64 48`).
4. Optional: `ALLOWED_EMAILS="you@gmail.com,@thapar.edu"` limits who can sign in.

The browser receives Google's signed ID token; the server verifies it against Google's public keys and
sets a 7-day HttpOnly session cookie. No Google client secret is needed, and cross-site requests are refused.

### Sending email from Partner Scout (Gmail)

**Send now** sends the AI-written email from the signed-in user's own Gmail (send-only permission,
requested on first use; the token stays in the browser). To enable it in the same Google Cloud project:

1. Enable the **Gmail API** (*APIs & Services → Library*).
2. On the **OAuth consent screen**, add the scopes `https://www.googleapis.com/auth/gmail.send` (Send now)
   and `https://www.googleapis.com/auth/gmail.readonly` (Check replies).
3. While the app is in **Testing** mode, add each sender's Google account under **Test users** (up to 100).
   Publishing for everyone requires Google's verification of this sensitive scope.

Every send needs a confirm click, goes only to an address verified on the company's own site, and is
blocked while placeholders like `[Company]` remain. **Send a test to me** sends the same email to yourself,
which is the safest way to demo it live. Simulated runs never send to their fictional addresses.

**Replies** land in the sender's own Gmail inbox. **Check replies** on a sent partner reads only that
email thread, and the AI summarises the reply in English and Japanese, labels the partner's intent
(interested / needs information / declined) and suggests the next step. The simulated run includes a
canned reply so this can be shown offline.

## Deploy on Vercel (free)

1. Import the GitHub repo in Vercel and set **Root Directory** to `app`.
2. Add `GROQ_API_KEY`, `TAVILY_API_KEY` and (for sign-in) `GOOGLE_CLIENT_ID` + `SESSION_SECRET` under *Settings → Environment Variables*.
3. Deploy. `app/vercel.json` builds the Vite site and serves `app/api/*` as functions.

The agent runs as many short requests driven by the browser, so it fits the free plan's function time limit.
Note that Vercel's free Hobby plan is for non-commercial use.

## Japanese

The **EN / 日本語** switch in the header translates the whole interface. Strings live
in `app/src/i18n-ja.js`, keyed by the English text.

## Pitch

See [`docs/PITCH.md`](docs/PITCH.md) for the 3-minute script, Q&A cheat sheet and demo-day checklist.

## Changing the logo

Replace `app/public/logo.png` (or point `logo` in `app/src/brand.js` at a new file).
A transparent PNG or SVG works best; any aspect ratio is fine. The opening animation
measures the image and lands it on the home-page logo automatically. Set `intro: false`
in `brand.js` to turn the animation off.

## Demo path (≈3 minutes)

1. **Home → Begin** → pick *Equipment manufacturer*.
2. **Requirements**: the app detects service model **B** (needs local installation).
3. **Options**: regions and partners re-rank live. Use the **A / B toggle** to show the
   slide-4 story: same SME, different requirement, different partners.
4. Click any **partner** to open the side panel:
   - *Analysis*: fit score, sub-scores, bilingual (EN/日本語) AI analyst summary, essential checks, radar.
   - *Regions*: India map with sakura covering the partner's regional presence.
   - *Costs*: editable 12-month pilot scenario → required list price.
   - *Evidence*: source quote → extracted fact → check it feeds, with verification status.
5. Click any **region** for region analytics and its map.
6. ✿ shortlist partners → **Pilot plan**: Gantt with owners, open checks and review-gate KPIs; export as PDF.
7. **Why TsunaGo**: USPs, comparison and answers to the questions judges are likely to ask.

## How it works

- `app/src/data/catalog.js`: prototype dataset (6 clusters, 10 **fictional** partners). The Japan-presence index uses Embassy of Japan & JETRO company counts (Oct 2024); other indices are illustrative.
- `app/src/lib/engine.js`: essential checks → weighted scoring → region ranking → cost model → analyst narrative → pilot plan.
- `app/src/components/IndiaMap.jsx`: state map (svg-maps, CC BY 4.0) with a calibrated Mercator projection for cluster pins.

- `app/server/extract.js`: Claude extraction with a strict JSON schema; every quote is re-checked against the source in `app/src/lib/ai.js`.
