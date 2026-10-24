// Multi-turn chat with optional live web search, for the Advisor.
// OpenAI-compatible providers (Groq by default) get a web_search function backed by Tavily;
// Claude uses Anthropic's server-side web search tool.
import Anthropic from '@anthropic-ai/sdk'
import { llmConfig, LLMError, postChat, providerError } from './llm.js'
import { tavilySearch } from './search.js'

const SEARCH_TOOL = {
  type: 'function',
  function: {
    name: 'web_search',
    description: 'Search the web for current facts: Indian regulations, duties, taxes, competitor prices, market data, FX rates, case histories. Returns titles, URLs, publish dates and snippets.',
    parameters: {
      type: 'object',
      properties: { query: { type: 'string', description: 'A precise search query' } },
      required: ['query'],
    },
  },
}

const MAX_ROUNDS = 4
// Leave room inside the 60 s serverless limit for the final answer.
const SEARCH_BUDGET_MS = 30_000

async function openAIChat(cfg, env, { system, messages, maxTokens, search }) {
  const t0 = Date.now()
  const convo = [{ role: 'system', content: system }, ...messages]
  const sources = []
  let tools = search
  for (let round = 0; ; round++) {
    const final = !tools || round >= MAX_ROUNDS || Date.now() - t0 > SEARCH_BUDGET_MS
    const body = { temperature: 0.3, max_tokens: maxTokens, messages: convo }
    if (tools) Object.assign(body, { tools: [SEARCH_TOOL], tool_choice: final ? 'none' : 'auto' })
    const { res, model } = await postChat(cfg, body)
    if (res.status === 400 && tools) {
      // Some open models occasionally emit a malformed tool call; answer without search instead.
      const err = await res.json().catch(() => ({}))
      if (/tool/i.test(JSON.stringify(err))) {
        tools = false
        continue
      }
      throw await providerError(cfg, new Response(JSON.stringify(err), { status: 400 }), model)
    }
    if (!res.ok) throw await providerError(cfg, res, model)
    const data = await res.json()
    const msg = data.choices?.[0]?.message || {}
    const calls = msg.tool_calls || []
    if (calls.length && !final) {
      convo.push({ role: 'assistant', content: msg.content || '', tool_calls: calls })
      for (const call of calls) {
        let content
        try {
          const { query } = JSON.parse(call.function?.arguments || '{}')
          const results = await tavilySearch(String(query || '').slice(0, 300), env, { maxResults: 6, depth: 'advanced' })
          const trimmed = results.map((r) => ({ title: r.title, url: r.url, published_date: r.published_date || 'unknown', snippet: String(r.content || '').slice(0, 900) }))
          trimmed.forEach((r) => sources.push({ title: r.title, url: r.url, date: r.published_date, query }))
          content = JSON.stringify({ query, searched_on: new Date().toISOString().slice(0, 10), results: trimmed })
        } catch (e) {
          content = JSON.stringify({ error: e.message || 'search failed' })
        }
        convo.push({ role: 'tool', tool_call_id: call.id, content })
      }
      continue
    }
    if (data.choices?.[0]?.finish_reason === 'length') throw new LLMError('truncated', 'The answer was cut off — ask for one section at a time.', 422)
    if (!msg.content) throw new LLMError('empty', 'The model returned nothing.')
    return { text: msg.content, sources, model: data.model || model, provider: cfg.name, ms: Date.now() - t0 }
  }
}

async function anthropicChat(cfg, { system, messages, maxTokens, search }) {
  const t0 = Date.now()
  const client = new Anthropic({ apiKey: cfg.apiKey, timeout: 55_000 })
  const convo = [...messages]
  const sources = []
  const text = []
  for (let i = 0; i < 3; i++) {
    let response
    try {
      response = await client.beta.messages.create({
        model: cfg.model,
        max_tokens: Math.max(maxTokens, 16000),
        betas: ['server-side-fallback-2026-07-01'],
        fallbacks: 'default',
        output_config: { effort: 'medium' },
        system,
        messages: convo,
        ...(search ? { tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 4 }] } : {}),
      })
    } catch (error) {
      if (error instanceof Anthropic.AuthenticationError) throw new LLMError('auth', 'The Anthropic API key was rejected.')
      if (error instanceof Anthropic.RateLimitError) throw new LLMError('rate_limit', 'Rate limited — try again in a moment.', 429)
      if (error instanceof Anthropic.APIError) throw new LLMError('api', `Claude API error ${error.status}.`)
      throw new LLMError('network', 'Could not reach the Claude API.')
    }
    if (response.stop_reason === 'refusal') throw new LLMError('refusal', 'The model declined this request.', 422)
    for (const b of response.content) {
      if (b.type === 'text') text.push(b.text)
      if (b.type === 'web_search_tool_result' && Array.isArray(b.content)) {
        b.content.forEach((r) => sources.push({ title: r.title, url: r.url, date: r.page_age || 'unknown' }))
      }
    }
    // A long server-side search turn can pause; resume it with the partial turn appended.
    if (response.stop_reason !== 'pause_turn') return { text: text.join(''), sources, model: response.model, provider: cfg.name, ms: Date.now() - t0 }
    convo.push({ role: 'assistant', content: response.content })
  }
  return { text: text.join(''), sources, model: cfg.model, provider: cfg.name, ms: Date.now() - t0 }
}

// Claude searches with Anthropic's own tool; other providers need a Tavily key.
export function searchAvailable(env) {
  const cfg = llmConfig(env)
  return !!cfg && (cfg.name === 'anthropic' || !!env.TAVILY_API_KEY)
}

export async function chatWithSearch(env, { system, messages, maxTokens = 4096, search = true }) {
  const cfg = llmConfig(env)
  if (!cfg) throw new LLMError('no_key', 'No model is configured. Set GROQ_API_KEY (free) or another provider key on the server.', 503)
  const canSearch = search && searchAvailable(env)
  const out = cfg.name === 'anthropic'
    ? await anthropicChat(cfg, { system, messages, maxTokens, search: canSearch })
    : await openAIChat(cfg, env, { system, messages, maxTokens, search: canSearch })
  return { ...out, searched: canSearch }
}
