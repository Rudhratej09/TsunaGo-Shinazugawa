// Culture & negotiation (PS part 5): a message coach and a negotiation-prep brief for a
// Japanese SME talking to an Indian counterpart. Runs as /api/culture?action=coach|negotiate.
import { chatJSON, handle, LLMError } from './llm.js'
import { requireUser } from './auth.js'

const str = { type: 'string' }
const clip = (v, n) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, n)

const GROUND_RULES = `You advise Japanese SMEs doing business with Indian companies.
- Describe common business practice, never national character. Say "often" or "many", not "Indians always".
- Do not invent facts about the counterpart; use only what the user gives you.
- Not legal or tax advice. If a point needs a lawyer or CA, say so.
- Be concrete and short. No filler.`

const SITUATIONS = {
  first: 'First contact / introduction',
  followup: 'Follow-up after no reply',
  price: 'Price or margin discussion',
  decline: 'Saying no or declining a request',
  delay: 'Explaining a delay or slower decision in Japan',
  payment: 'Payment terms or a payment reminder',
  meeting: 'Confirming a meeting and its agenda',
}

const COACH_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['rewritten', 'back_translation', 'changes', 'risks', 'tone_note'],
  properties: {
    rewritten: { type: 'string', description: 'The improved message in English, ready to send' },
    back_translation: { type: 'string', description: 'Faithful Japanese translation of the improved message' },
    changes: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['what', 'why'], properties: { what: str, why: str } } },
    risks: { type: 'array', description: 'Ways the ORIGINAL could be misread by an Indian counterpart', items: { type: 'object', additionalProperties: false, required: ['risk', 'fix'], properties: { risk: str, fix: str } } },
    tone_note: { type: 'string', description: 'One sentence on the tone chosen and why' },
  },
}

export async function coach({ message, situation, counterpart, lang }, env) {
  const text = clip(message, 4000)
  if (text.length < 5) throw new LLMError('bad_input', 'Write or paste the message you want to send.', 400)
  const sit = SITUATIONS[situation] || SITUATIONS.first
  const explain = lang === 'ja' ? 'Japanese' : 'English'
  const out = await chatJSON(env, {
    system: `${GROUND_RULES}
Task: rewrite a message from a Japanese SME to an Indian business counterpart so it is clear, polite and gets the intended response.
Common friction to fix: Japanese indirectness ("we will consider it", "it is difficult") that Indian counterparts may read as a soft yes; missing explicit next step, owner and date; no decision-maker named; over-long apologies; vague timelines. Keep it warm and professional; Indian business email is usually more direct and relationship-friendly than Japanese keigo. Keep any facts, numbers and names exactly as given.
Write "changes", "risks" and "tone_note" in ${explain}. "rewritten" is always English. "back_translation" is always Japanese.`,
    user: `Situation: ${sit}\nCounterpart: ${clip(counterpart, 200) || 'Indian distributor / partner'}\n\nOriginal message (may be Japanese or English):\n${text}`,
    schema: COACH_SCHEMA,
    maxTokens: 2500,
  })
  return { ...out.data, model: out.model }
}

const NEGOTIATE_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['summary', 'likely_asks', 'concessions', 'red_lines', 'phrases', 'before_meeting'],
  properties: {
    summary: { type: 'string', description: 'Two or three sentences: what this negotiation is really about' },
    likely_asks: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['ask', 'why', 'response'], properties: { ask: str, why: str, response: str } } },
    concessions: { type: 'array', description: 'Give-get pairs, in the order to offer them', items: { type: 'object', additionalProperties: false, required: ['give', 'get'], properties: { give: str, get: str } } },
    red_lines: { type: 'array', items: str },
    phrases: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['en', 'ja', 'use'], properties: { en: str, ja: str, use: str } } },
    before_meeting: { type: 'array', description: 'Checklist of things to prepare', items: str },
  },
}

export async function negotiate({ partner, product, terms, position, model, lang }, env) {
  const what = clip(terms, 1500)
  if (!what) throw new LLMError('bad_input', 'Say what is being negotiated (e.g. exclusivity, margin, minimum order).', 400)
  const explain = lang === 'ja' ? 'Japanese' : 'English'
  const out = await chatJSON(env, {
    system: `${GROUND_RULES}
Task: prepare a Japanese SME for a negotiation with a prospective Indian partner.
Typical asks from Indian distributors and integrators include all-India or long exclusivity, higher margin, 60–90 day credit, free demo or stock units, marketing funds, and price cuts to match local or Chinese competitors. Use only those that fit the facts given.
Concessions must be give-get pairs: never give without getting (e.g. exclusivity in two states only, tied to a minimum annual purchase and a 12-month review). Order them from cheapest to most expensive for the SME.
Phrases: short, natural English the SME can say in the room, with Japanese meaning and when to use it. 4–6 phrases.
Write every field in ${explain} except phrases[].en (English) and phrases[].ja (Japanese).`,
    user: `Partner: ${clip(partner, 300) || 'unnamed Indian partner'}
Product: ${clip(product, 300) || 'industrial product'}
Service model: ${model === 'B' ? 'partner must install and service locally' : 'SME supports customers itself; partner sells'}
What is being negotiated: ${what}
SME position / limits: ${clip(position, 1000) || 'not stated'}`,
    schema: NEGOTIATE_SCHEMA,
    maxTokens: 3500,
  })
  return { ...out.data, model: out.model }
}

const ACTIONS = { coach, negotiate }

export async function handleCulture(req, res, env) {
  if (!(await requireUser(req, res, env))) return
  const action = new URL(req.url, 'http://x').searchParams.get('action')
  const fn = ACTIONS[action]
  if (!fn) return handle(req, res, () => { throw new LLMError('bad_input', 'Unknown action.', 404) })
  return handle(req, res, (body) => fn(body, env))
}
