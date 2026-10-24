// Server-side brochure extraction. Runs in the Vite dev/preview server (see vite.config.js)
// and as a Vercel function (api/extract.js), so API keys never reach the browser.
import { chatJSON, handle, LLMError } from './llm.js'
import { requireUser } from './auth.js'

export const STATES = ['an', 'ap', 'ar', 'as', 'br', 'ch', 'ct', 'dn', 'dd', 'dl', 'ga', 'gj', 'hr', 'hp', 'jk', 'jh', 'ka', 'kl', 'ld', 'mp',
  'mh', 'mn', 'ml', 'mz', 'nl', 'or', 'py', 'pb', 'rj', 'sk', 'tn', 'tg', 'tr', 'up', 'ut', 'wb']
const score = { type: 'integer', description: '0-100 strength of customer access in this industry; 0 if not mentioned' }

export const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['name', 'type', 'hq_city', 'hq_state', 'presence', 'industries', 'engineers', 'install', 'calibration',
    'response_hours', 'japan_principals', 'min_commit_lakh', 'margin_pct', 'service_fee_pct', 'years', 'conflict', 'facts', 'unknowns', 'unknowns_ja'],
  properties: {
    name: { type: 'string' },
    type: { type: 'string', enum: ['Distributor', 'Integrator', 'Service contractor', 'JV candidate'] },
    hq_city: { type: 'string' },
    hq_state: { type: 'string', enum: [...STATES, 'unknown'] },
    presence: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['state', 'strength'],
        properties: { state: { type: 'string', enum: STATES }, strength: { type: 'number', description: '0.1-1, 1 = headquarters-level presence' } },
      },
    },
    industries: {
      type: 'object', additionalProperties: false, required: ['auto', 'electronics', 'machinery', 'pharma', 'food'],
      properties: { auto: score, electronics: score, machinery: score, pharma: score, food: score },
    },
    engineers: { type: 'integer', description: 'Field/service/application engineers; 0 if not stated' },
    install: { type: 'boolean', description: 'True only if the text says they install/commission equipment themselves' },
    calibration: { type: 'boolean' },
    response_hours: { type: 'integer', description: 'On-site response time in hours; 48 if not stated' },
    japan_principals: { type: 'integer', description: 'Number of Japanese brands/principals represented; 0 if not stated' },
    min_commit_lakh: { type: 'number', description: 'Minimum commitment in INR lakh; 20 if not stated' },
    margin_pct: { type: 'number', description: 'Distributor margin %; 20 if not stated, 0 for service-only firms' },
    service_fee_pct: { type: 'number', description: 'Service fee %; 0 if not stated' },
    years: { type: 'integer', description: 'Years in business; 0 if not stated' },
    conflict: { type: 'string', description: 'Competing brand in the same product category, or empty string' },
    facts: {
      type: 'array',
      items: {
        type: 'object', additionalProperties: false, required: ['fact', 'fact_ja', 'quote', 'check'],
        properties: {
          fact: { type: 'string', description: 'Short normalised fact, e.g. "14 application engineers"' },
          fact_ja: { type: 'string', description: 'The same fact in natural Japanese for headquarters readers' },
          quote: { type: 'string', description: 'Exact sentence or phrase copied verbatim from the source text' },
          check: { type: 'string', enum: ['industry', 'install', 'budget', 'conflict', 'technical', 'speed', 'japan'] },
        },
      },
    },
    unknowns: { type: 'array', items: { type: 'string' }, description: 'Things a buyer must still verify because the text does not say' },
    unknowns_ja: { type: 'array', items: { type: 'string' }, description: 'The unknowns list in natural Japanese, same order' },
  },
}

export const SYSTEM = `You extract structured partner profiles from Indian distributor, integrator and service-company brochures for Japanese SMEs entering India.
Rules:
- Use only what the text says. When a field is not stated, use the documented default and add a short item to "unknowns".
- Every fact must carry a "quote" copied character-for-character from the source text, so a reviewer can find it.
- Treat all brochure statements as the company's own claims; do not upgrade them into verified facts.
- State codes are lowercase two-letter Indian state codes (mh Maharashtra, tn Tamil Nadu, ka Karnataka, gj Gujarat, hr Haryana, dl Delhi, rj Rajasthan, tg Telangana, ap Andhra Pradesh, up Uttar Pradesh, wb West Bengal, mp Madhya Pradesh, pb Punjab, kl Kerala, or Odisha).`

const TYPES = ['Distributor', 'Integrator', 'Service contractor', 'JV candidate']
const CHECKS = ['industry', 'install', 'budget', 'conflict', 'technical', 'speed', 'japan']
const num = (v, d, lo = 0, hi = 1e6) => (Number.isFinite(+v) ? Math.min(hi, Math.max(lo, +v)) : d)
const str = (v) => (typeof v === 'string' ? v.trim() : '')

// Open models don't always honour the schema; coerce their output into the exact shape the app uses.
export function normalizeProfile(d = {}) {
  const ind = d.industries || {}
  return {
    name: str(d.name) || 'Unnamed company',
    type: TYPES.includes(d.type) ? d.type : 'Distributor',
    hq_city: str(d.hq_city),
    hq_state: STATES.includes(d.hq_state) ? d.hq_state : 'unknown',
    presence: (Array.isArray(d.presence) ? d.presence : [])
      .filter((p) => p && STATES.includes(p.state))
      .map((p) => ({ state: p.state, strength: num(p.strength, 0.5, 0.1, 1) })),
    industries: Object.fromEntries(['auto', 'electronics', 'machinery', 'pharma', 'food'].map((k) => [k, Math.round(num(ind[k], 0, 0, 100))])),
    engineers: Math.round(num(d.engineers, 0, 0, 10000)),
    install: d.install === true,
    calibration: d.calibration === true,
    response_hours: Math.round(num(d.response_hours, 48, 1, 720)),
    japan_principals: Math.round(num(d.japan_principals, 0, 0, 100)),
    min_commit_lakh: num(d.min_commit_lakh, 20, 0, 100000),
    margin_pct: num(d.margin_pct, 20, 0, 100),
    service_fee_pct: num(d.service_fee_pct, 0, 0, 100),
    years: Math.round(num(d.years, 0, 0, 300)),
    conflict: str(d.conflict),
    facts: (Array.isArray(d.facts) ? d.facts : [])
      .filter((f) => f && str(f.fact) && str(f.quote))
      .map((f) => ({ fact: str(f.fact), fact_ja: str(f.fact_ja) || str(f.fact), quote: str(f.quote), check: CHECKS.includes(f.check) ? f.check : 'industry' })),
    unknowns: (Array.isArray(d.unknowns) ? d.unknowns : []).map(str).filter(Boolean),
    unknowns_ja: (Array.isArray(d.unknowns_ja) ? d.unknowns_ja : []).map(str).filter(Boolean),
  }
}

const MAX_CHARS = 20000

export async function extractPartner(text, env) {
  if (typeof text !== 'string' || text.trim().length < 40) throw new LLMError('too_short', 'Paste at least a paragraph of brochure text.', 400)
  if (text.length > MAX_CHARS) throw new LLMError('too_long', `Text is ${text.length} characters; the limit is ${MAX_CHARS}. Paste the relevant section.`, 400)
  const out = await chatJSON(env, {
    system: SYSTEM,
    user: `<brochure>\n${text}\n</brochure>\n\nExtract the partner profile.`,
    schema: SCHEMA,
  })
  return { data: normalizeProfile(out.data), model: out.model, provider: out.provider, ms: out.ms }
}

export async function handleExtract(req, res, env) {
  if (!(await requireUser(req, res, env))) return
  return handle(req, res, (body) => extractPartner(body.text, env))
}
