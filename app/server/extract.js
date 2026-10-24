// Server-side brochure extraction with Claude. Runs in the Vite dev/preview server
// (see vite.config.js) and as a Vercel function (api/extract.js), so the API key
// never reaches the browser.
import Anthropic from '@anthropic-ai/sdk'

const STATES = ['an', 'ap', 'ar', 'as', 'br', 'ch', 'ct', 'dn', 'dd', 'dl', 'ga', 'gj', 'hr', 'hp', 'jk', 'jh', 'ka', 'kl', 'ld', 'mp',
  'mh', 'mn', 'ml', 'mz', 'nl', 'or', 'py', 'pb', 'rj', 'sk', 'tn', 'tg', 'tr', 'up', 'ut', 'wb']
const MAX_CHARS = 20000

const score = { type: 'integer', description: '0-100 strength of customer access in this industry; 0 if not mentioned' }

const SCHEMA = {
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

const SYSTEM = `You extract structured partner profiles from Indian distributor, integrator and service-company brochures for Japanese SMEs entering India.
Rules:
- Use only what the text says. When a field is not stated, use the documented default and add a short item to "unknowns".
- Every fact must carry a "quote" copied character-for-character from the source text, so a reviewer can find it.
- Treat all brochure statements as the company's own claims; do not upgrade them into verified facts.
- State codes are lowercase two-letter Indian state codes (mh Maharashtra, tn Tamil Nadu, ka Karnataka, gj Gujarat, hr Haryana, dl Delhi, rj Rajasthan, tg Telangana, ap Andhra Pradesh, up Uttar Pradesh, wb West Bengal, mp Madhya Pradesh, pb Punjab, kl Kerala, or Odisha).`

export class ExtractError extends Error {
  constructor(code, message, status = 400) {
    super(message)
    this.code = code
    this.status = status
  }
}

export async function extractPartner(text, apiKey) {
  if (typeof text !== 'string' || text.trim().length < 40) throw new ExtractError('too_short', 'Paste at least a paragraph of brochure text.')
  if (text.length > MAX_CHARS) throw new ExtractError('too_long', `Text is ${text.length} characters; the limit is ${MAX_CHARS}. Paste the relevant section.`)
  if (!apiKey) throw new ExtractError('no_key', 'ANTHROPIC_API_KEY is not set on the server.', 503)

  const client = new Anthropic({ apiKey, timeout: 60_000 })
  const t0 = Date.now()
  let response
  try {
    response = await client.beta.messages.create({
      model: 'claude-opus-5-5',
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // Low effort keeps the live demo fast; extraction is a well-specified task.
      output_config: { effort: 'low', format: { type: 'json_schema', schema: SCHEMA } },
      system: SYSTEM,
      messages: [{ role: 'user', content: `<brochure>\n${text}\n</brochure>\n\nExtract the partner profile.` }],
    })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) throw new ExtractError('auth', 'The server API key was rejected.', 502)
    if (error instanceof Anthropic.RateLimitError) throw new ExtractError('rate_limit', 'Rate limited — try again in a moment.', 429)
    if (error instanceof Anthropic.APIError) throw new ExtractError('api', `Claude API error ${error.status}.`, 502)
    throw new ExtractError('network', 'Could not reach the Claude API.', 502)
  }

  if (response.stop_reason === 'refusal') throw new ExtractError('refusal', 'The model declined this text.', 422)
  if (response.stop_reason === 'max_tokens') throw new ExtractError('truncated', 'The response was cut off; paste a shorter section.', 422)
  const block = response.content.find((b) => b.type === 'text')
  if (!block) throw new ExtractError('empty', 'The model returned no profile.', 502)
  let data
  try {
    data = JSON.parse(block.text)
  } catch {
    throw new ExtractError('parse', 'The model returned invalid JSON.', 502)
  }
  return { data, model: response.model, ms: Date.now() - t0 }
}

// Minimal Node request handler shared by the Vite middleware and the Vercel function.
export async function handleExtract(req, res, apiKey) {
  const send = (status, body) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
  }
  if (req.method !== 'POST') return send(405, { error: 'method', message: 'Use POST.' })
  try {
    let body = req.body
    if (!body) {
      const chunks = []
      for await (const c of req) chunks.push(c)
      body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
    } else if (typeof body === 'string') {
      body = JSON.parse(body)
    }
    send(200, await extractPartner(body.text, apiKey))
  } catch (e) {
    if (e instanceof ExtractError) return send(e.status, { error: e.code, message: e.message })
    if (e instanceof SyntaxError) return send(400, { error: 'bad_json', message: 'Request body must be JSON.' })
    send(500, { error: 'server', message: 'Unexpected server error.' })
  }
}
