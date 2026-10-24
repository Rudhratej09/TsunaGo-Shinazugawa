// India market-entry Advisor: the team's system prompt + the SME profile + app context.
import { requireUser } from './auth.js'
import { chatWithSearch, searchAvailable } from './chat.js'
import { handle, LLMError } from './llm.js'
import { ADVISOR_PROMPT } from './advisorPrompt.js'

export const PROFILE_FIELDS = [
  ['companyName', 'Company name'],
  ['homeCountry', 'Home country'],
  ['stage', 'Size and stage'],
  ['products', 'Product(s) and use cases'],
  ['usp', 'Measurable advantage (USP)'],
  ['price', 'Current price'],
  ['unitCost', 'Approximate unit cost'],
  ['customers', 'Current customers and markets'],
  ['buyerType', 'Likely Indian buyer type'],
  ['investment', 'Investment ceiling'],
  ['modify', 'Willingness to modify the product'],
  ['capacity', 'Manufacturing capacity and minimum order'],
  ['ip', 'IP and exclusivity constraints'],
  ['contacts', 'Existing India contacts or distributors'],
  ['timeline', 'Timeline and risk tolerance'],
  ['notes', 'Other notes from TsunaGo'],
]

const clean = (v) => String(v ?? '').replace(/[<>]/g, '').trim().slice(0, 1500)

export function renderProfile(profile = {}) {
  return PROFILE_FIELDS
    .map(([k, label]) => `- ${label}: ${clean(profile[k]) || 'not provided'}`)
    .join('\n')
}

export function buildSystem({ profile, lang, searched, today }) {
  return ADVISOR_PROMPT.replace('{{SME_PROFILE}}', renderProfile(profile)) + `

<app_context>
- Today's date: ${today}. Use it to judge how old a source is.
- In this app the Partner Finder tab is labelled "Partner Scout". Refer to it as "the Partner Scout (Partner Finder) tab".
- ${searched
    ? 'You have a web_search tool. Use it for anything that can change (regulations, duties, taxes, prices, market data, FX). Cite each source as a markdown link with its date. Do not search for or name specific Indian partner companies.'
    : 'Web search is NOT available in this session. Say so when a fact needs current verification, and tag such claims [E] or [H] instead of [F].'}
- Write in ${lang === 'ja' ? 'Japanese (keep the evidence tags [F] [U] [E] [H] and table structure)' : 'English'} unless the user writes in another language.
- Format with markdown: short headings, bullet lists, and tables where the workflow asks for them.
</app_context>`
}

const MAX_MESSAGES = 30

export async function advise({ messages, profile, lang }, env) {
  if (!Array.isArray(messages) || !messages.length) throw new LLMError('bad_input', 'Send at least one message.', 400)
  const convo = messages
    .filter((m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim())
    .slice(-MAX_MESSAGES)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 12000) }))
  if (!convo.length || convo[convo.length - 1].role !== 'user') throw new LLMError('bad_input', 'The last message must be from the user.', 400)
  // Some providers require the conversation to start with a user turn.
  while (convo.length && convo[0].role !== 'user') convo.shift()
  const system = buildSystem({ profile, lang, searched: searchAvailable(env), today: new Date().toISOString().slice(0, 10) })
  const out = await chatWithSearch(env, { system, messages: convo, maxTokens: 4096 })
  return { reply: out.text, sources: out.sources, model: out.model, provider: out.provider, searched: out.searched, ms: out.ms }
}

export async function handleAdvisor(req, res, env) {
  if (!(await requireUser(req, res, env))) return
  return handle(req, res, (body) => advise(body, env))
}
