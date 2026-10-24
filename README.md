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

## Live AI extraction

The **✦ Analyze partner** page sends pasted brochure text to Claude via a small server
route (`/api/extract`), so the API key never reaches the browser.

```bash
cp app/.env.example app/.env.local   # then fill in ANTHROPIC_API_KEY
```

The key is read by the Vite dev/preview server and by `app/api/extract.js` on Vercel.
Without a key, the two sample brochures still work from a cached result.

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
