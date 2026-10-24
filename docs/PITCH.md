# TsunaGo — Pitch Kit (Team Shinazugawa)

Everything the team needs for a live 3-minute pitch plus Q&A. Rehearse at least three times with a timer.

---

## 1. The 3-minute script (synced to the live demo)

**Roles:** Speaker drives the story. Demo driver clicks. Swap at 0:40 and 2:20 if you want two voices.

| Time | Say | Do on screen |
|---|---|---|
| 0:00–0:20 | "1,434 Japanese companies operate in India today. But behind that number are SMEs with excellent products that stalled before their first Indian sale. Not because the product was weak, because the decisions were." | Open the site fresh. **Let the sakura intro play.** |
| 0:20–0:40 | "Region, partner, price and service aren't separate choices. Pick the wrong service model and your perfect distributor can't install your machine. First-time entrants make these decisions with scattered information. TsunaGo connects them. 繋ぐ: to connect." | Home page. Click **Start**. |
| 0:40–1:05 | "Meet a Japanese inspection-equipment maker. Limited budget, no Indian operation, needs local installation. Six questions." | Pick **Equipment manufacturer** → Continue. Point at the **Service model B** callout. → **Compare my entry options**. |
| 1:05–1:35 | "Chennai ranks first for automotive. Four of ten partners pass every essential check. Click one: fit score, AI analyst summary, every claim traced to a source. And this map: sakura covering where the partner actually operates." | Click **Coromandel Metrology** → glance at Analysis → **Regions** tab (petals fall) → **Evidence** tab. Close. |
| 1:35–1:50 | "Now the moment. What if they *do* have their own service team?" | Click **A · Our team supports**. Partners re-rank live. "Same SME, one answer changed, different partners." **Then click B again** (the AI demo below assumes model B). |
| 1:50–2:20 | "And for a partner we've never seen, here's the AI. Paste a brochure. Claude extracts the facts, quotes the exact sentence behind each one, and we check every quote against the source, so the AI can't quietly invent a capability. This distributor looks great: 400 automotive plants. But it carries a competing Japanese brand and can't install. Excluded, with reasons." | **✦ Analyze partner** → **Ganga Trade Links** → **Analyze with AI**. Hover a fact to light up its sentence. Point at the red checks. |
| 2:20–2:40 | "The output isn't a report, it's a pilot plan: owners, milestones, the facts still to verify, and KPIs for the go/no-go review. Legal and tax stay with experts." | **Pilot plan** page. Flip **日本語** for two seconds: "and headquarters in Japan reads the same reasoning." Flip back. |
| 2:40–3:00 | "Free screening through JETRO and chambers of commerce. Fixed-fee assisted assessments. Partners pay to be verified, never to be ranked. TsunaGo: connect every decision before your first Indian sale." | Back to home logo. Stop. |

**If the AI call is slow or offline:** the two sample brochures fall back to cached results automatically (badge reads "Offline demo cache"). Say: *"this is the cached run of the same call; the live version takes a few seconds."* Don't apologise twice.

---

## 2. Q&A cheat sheet

Answer in one or two sentences, then stop. If you don't know, say what you'd measure.

| Question | Answer |
|---|---|
| Why not just hire a consultant or ask JETRO? | We complement both. A consultant gives a snapshot; TsunaGo keeps the model live so the SME can test "what if" in seconds. JETRO advisers get SMEs arriving with a structured brief, so their time goes to judgement calls, not first-pass screening. |
| Where exactly is the AI? | Extraction: Claude turns a brochure into a structured profile with a verbatim quote per fact. We verify every quote against the source. Ranking itself is transparent rules: essential checks first, then weights the SME controls. |
| What about hallucination? | Every fact must quote the source, and quotes not found word-for-word are flagged as unverified. Brochure facts are marked "claimed", never "verified", until a human or a reference confirms them. |
| Is the data real? | The Japan-presence index uses Embassy of Japan & JETRO company counts (Oct 2024). Partner companies in the demo are fictional on purpose, so we never rank a real company on invented data. Demand/logistics indices are team estimates, and the app labels them as such. |
| How do you keep partner data fresh? | Every fact carries a date and status; stale facts lose weight; pilot outcomes feed back into the partner record. Verification is a paid service for partners, but ranking can't be bought. |
| How do you make money? | Free self-serve screening via JETRO/chambers → fixed-fee assisted assessment with expert review → partner verification fees. Never pay-to-rank. |
| Who's liable if it's wrong? | It's decision support, not legal or tax advice. Every regulated step is assigned to an expert reviewer in the plan. |
| Why start with industrial equipment? | Installation and service make the partner decision hardest and most costly to get wrong, which is where connected decisions add the most value. The engine is sector-agnostic: industries and checks are data. |
| What's built vs. mocked? | Built and working: full flow, scoring engine, cost model, live AI extraction with quote verification, Japanese UI, pilot plan export. Illustrative: partner profiles and some regional indices, all labelled in the app. |
| Competitors? | Directories list companies; consultants advise once. Neither connects region, partner, price and service into one live decision with evidence. |
| What would you do with more time? | Run the validation pilot: TsunaGo vs. manual research for 5 SMEs, measuring time-to-shortlist and evidence coverage. Then onboard real verified partners in one cluster. |

---

## 3. Demo-day checklist

**The night before**
- [ ] Put the API key in `app/.env.local` as `ANTHROPIC_API_KEY=...` (never commit it).
- [ ] Run a production build: `cd app && npm run build && npm run preview`, then do the full demo on `http://localhost:4173`.
- [ ] Run **Analyze** live once with each sample and once with a real brochure paragraph.
- [ ] Test offline: turn Wi-Fi off and confirm both samples still work (cached badge).
- [ ] **Verify the state figures** against the Embassy PDF (https://www.in.emb-japan.go.jp/files/100867260.pdf): Maharashtra 248, Karnataka 234, Tamil Nadu 182, Gujarat 40. Fix any that differ in `app/src/data/catalog.js` and set `checked: true`.
- [ ] Record the backup video (below).

**On stage**
- [ ] Browser at 100% zoom, window ≥ 1366 px wide, bookmarks bar hidden.
- [ ] Language set to **EN** before starting (it's remembered per browser).
- [ ] To replay the intro: reload the home page (`/#/home` or `/`).
- [ ] Phone hotspot ready; charger plugged in; notifications off.
- [ ] Backup video open in another tab.

---

## 4. Backup video shot list (90 seconds)

Record at 1440×900 with a screen recorder, no voice-over needed (or one take of the script).

1. Intro animation (full, 4 s).
2. Profile → Equipment manufacturer → Requirements (model B callout).
3. Options page; open Coromandel → Regions tab with the sakura map.
4. Flip A ↔ B; show the partner list re-ranking.
5. Analyze → Ganga Trade Links → result with highlighted quotes and red checks.
6. Pilot plan; flip to 日本語 and back.

---

## 5. Highest-value things for teammates to do now

1. **Get one real quote.** Message a JETRO adviser, an export-oriented Japanese SME, or a Thapar professor who works with Japanese firms. One line like "this would save us weeks of desk research" beats any slide. Put it on screen at 2:40.
2. **Verify the four state figures** against the Embassy PDF (see checklist).
3. **Rehearse the A/B toggle moment** until it's smooth. It's the moment judges will remember.
4. **Prepare one fallback slide** with the four demo screenshots in case the laptop fails.
