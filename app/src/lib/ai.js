import { CLUSTERS } from '../data/catalog.js'
import { CITY_COORDS, SAMPLES } from '../data/samples.js'

// Calls the server-side extractor. If the server has no API key or the network is down,
// the two demo samples fall back to their cached extraction so a live demo never stalls.
export async function extractBrochure(text) {
  const sample = SAMPLES.find((s) => s.text.trim() === text.trim())
  try {
    const res = await fetch('/api/extract', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    const body = await res.json().catch(() => ({}))
    if (res.ok) return { ...body, source: 'live' }
    if (sample) return { ...sample.cached, source: 'cached', reason: body.message }
    throw new Error(body.message || `Extraction failed (${res.status}).`)
  } catch (e) {
    if (sample) return { ...sample.cached, source: 'cached', reason: e.message }
    throw e
  }
}

// Normalise case, quotes, dashes and whitespace, keeping a map back to original offsets.
function normalise(s) {
  let out = ''
  const map = []
  let space = false
  for (let i = 0; i < s.length; i++) {
    let ch = s[i]
    if (/\s/.test(ch)) {
      if (space || out.length === 0) continue
      space = true
      ch = ' '
    } else {
      space = false
      ch = ch.toLowerCase().replace(/[‘’]/, "'").replace(/[“”]/, '"').replace(/[–—]/, '-')
    }
    out += ch
    map.push(i)
  }
  return { out: out.trimEnd(), map }
}

// [start, end) of the quote in the original text, or null if it isn't there verbatim.
export function findQuote(text, quote) {
  const hay = normalise(text)
  const needle = normalise(quote).out
  if (needle.length < 8) return null
  const at = hay.out.indexOf(needle)
  if (at < 0) return null
  return [hay.map[at], hay.map[at + needle.length - 1] + 1]
}

export const locateQuote = (text, quote) => (findQuote(text, quote) ? 1 : -1)

// Turn an extraction into the partner shape the scoring engine uses.
export function toPartner(data, text, extractedAt = new Date()) {
  const date = extractedAt.toISOString().slice(0, 7)
  const city = (data.hq_city || '').toLowerCase().trim()
  const coords = CITY_COORDS[city]
  const presence = Object.fromEntries(data.presence.map((p) => [p.state, Math.max(0.1, Math.min(1, p.strength))]))
  if (data.hq_state !== 'unknown' && presence[data.hq_state] == null) presence[data.hq_state] = 1
  const clusters = CLUSTERS.filter((c) => presence[c.state] != null).map((c) => c.id)
  return {
    id: 'ai-' + data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40),
    name: data.name,
    type: data.type,
    hq: { city: data.hq_city || 'Unknown', state: data.hq_state, lon: coords?.[0], lat: coords?.[1] },
    presence,
    clusters,
    industries: data.industries,
    engineers: data.engineers,
    install: data.install,
    calibration: data.calibration,
    responseHours: data.response_hours,
    japanPrincipals: data.japan_principals,
    minCommitLakh: data.min_commit_lakh,
    marginPct: data.margin_pct,
    serviceFeePct: data.service_fee_pct,
    years: data.years,
    conflict: data.conflict || null,
    references: [],
    evidence: data.facts.map((f) => ({
      source: 'Pasted brochure (AI-extracted)',
      date,
      quote: f.quote,
      fact: f.fact,
      check: f.check,
      status: locateQuote(text, f.quote) >= 0 ? 'claimed' : 'pending',
    })),
    unknowns: data.unknowns,
    lastVerified: date,
    aiExtracted: true,
  }
}
