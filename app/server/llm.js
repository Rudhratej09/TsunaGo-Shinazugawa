// One JSON-returning chat call, routed to whichever model provider is configured.
// Free/open options speak the OpenAI-compatible API (Groq, Hugging Face router,
// OpenRouter, local Ollama); Claude is supported through the Anthropic SDK.
import Anthropic from '@anthropic-ai/sdk'

const PRESETS = {
  // Groq retired llama-3.3-70b-versatile on 2026-08-16; gpt-oss is its recommended replacement.
  groq: { baseURL: 'https://api.groq.com/openai/v1', keyVar: 'GROQ_API_KEY', model: 'openai/gpt-oss-120b', fallbacks: ['openai/gpt-oss-20b', 'qwen/qwen3.6-27b'] },
  huggingface: { baseURL: 'https://router.huggingface.co/v1', keyVar: 'HF_TOKEN', model: 'Qwen/Qwen2.5-72B-Instruct' },
  openrouter: { baseURL: 'https://openrouter.ai/api/v1', keyVar: 'OPENROUTER_API_KEY', model: 'meta-llama/llama-3.3-70b-instruct:free' },
  ollama: { baseURL: 'http://localhost:11434/v1', keyVar: null, model: 'qwen2.5:7b' },
  anthropic: { keyVar: 'ANTHROPIC_API_KEY', model: 'claude-opus-5-5' },
}

export class LLMError extends Error {
  constructor(code, message, status = 502) {
    super(message)
    this.code = code
    this.status = status
  }
}

// Pick the provider: explicit LLM_PROVIDER wins, otherwise the first one with a key.
export function llmConfig(env) {
  const name = env.LLM_PROVIDER || ['groq', 'huggingface', 'openrouter', 'anthropic'].find((p) => env[PRESETS[p].keyVar])
  if (!name || !PRESETS[name]) return null
  const p = PRESETS[name]
  const apiKey = p.keyVar ? env[p.keyVar] || env.LLM_API_KEY : 'ollama'
  if (!apiKey) return null
  const model = env.LLM_MODEL || p.model
  const fallbacks = [p.model, ...(p.fallbacks || [])].filter((m) => m !== model)
  return { name, baseURL: env.LLM_BASE_URL || p.baseURL, apiKey, model, fallbacks }
}

const isReasoning = (model) => /gpt-oss|qwen3/i.test(model)

// POST /chat/completions, moving on to the next model when the provider says the current one
// is unknown or retired (providers retire free models with little notice). Returns the
// Response plus the model that answered.
export async function postChat(cfg, body, timeoutMs = 50_000) {
  const models = [cfg.model, ...(cfg.fallbacks || [])]
  for (let i = 0; i < models.length; i++) {
    const model = models[i]
    const payload = { ...body, model }
    if (isReasoning(model) && cfg.name === 'groq') {
      // Reasoning tokens count against max_tokens; keep reasoning short and leave headroom.
      payload.reasoning_effort = 'low'
      if (payload.max_tokens) payload.max_tokens += 2000
    }
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), timeoutMs)
    let res
    try {
      res = await fetch(`${cfg.baseURL}/chat/completions`, {
        method: 'POST',
        signal: ctrl.signal,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${cfg.apiKey}` },
        body: JSON.stringify(payload),
      })
    } catch (e) {
      throw new LLMError(e.name === 'AbortError' ? 'timeout' : 'network', e.name === 'AbortError' ? 'The model took too long to answer.' : `Could not reach ${cfg.name}.`)
    } finally {
      clearTimeout(timer)
    }
    if (res.status === 404 || res.status === 400) {
      const text = await res.text()
      const gone = res.status === 404 || /model.*(not found|does not exist|decommission|deprecat|retired)/i.test(text)
      if (gone && i < models.length - 1) continue
      return { res: new Response(text, { status: res.status, headers: res.headers }), model }
    }
    return { res, model }
  }
}

// Turn a failed provider response into an LLMError that says what actually went wrong.
export async function providerError(cfg, res, model) {
  if (res.status === 401 || res.status === 403) return new LLMError('auth', `The ${cfg.name} API key was rejected.`)
  if (res.status === 429) return new LLMError('rate_limit', `${cfg.name} rate limit reached — wait a moment and retry.`, 429)
  let detail = ''
  try {
    const j = await res.json()
    detail = j.error?.message || j.message || ''
  } catch {
    // body was not JSON
  }
  return new LLMError('api', `${cfg.name} API error ${res.status} (model ${model})${detail ? `: ${String(detail).slice(0, 200)}` : '.'}`)
}

// Open models sometimes wrap JSON in prose or code fences; take the outermost object.
function parseJSON(text) {
  try {
    return JSON.parse(text)
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1))
      } catch {
        // fall through
      }
    }
    throw new LLMError('parse', 'The model returned invalid JSON.')
  }
}

async function openAICompatible(cfg, { system, user, schema, maxTokens }) {
  const { res, model } = await postChat(cfg, {
    temperature: 0.2,
    max_tokens: maxTokens,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: `${system}\n\nRespond with a single JSON object that follows this JSON Schema exactly:\n${JSON.stringify(schema)}` },
      { role: 'user', content: user },
    ],
  }, 45_000)
  if (!res.ok) throw await providerError(cfg, res, model)
  const body = await res.json()
  const choice = body.choices?.[0]
  if (choice?.finish_reason === 'length') throw new LLMError('truncated', 'The answer was cut off; try a shorter input.', 422)
  const content = choice?.message?.content
  if (!content) throw new LLMError('empty', 'The model returned nothing.')
  return { data: parseJSON(content), model: body.model || model }
}

async function anthropicCall(cfg, { system, user, schema, maxTokens }) {
  const client = new Anthropic({ apiKey: cfg.apiKey, timeout: 60_000 })
  let response
  try {
    response = await client.beta.messages.create({
      model: cfg.model,
      max_tokens: Math.max(maxTokens, 16000),
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      // Low effort keeps the live demo fast; these are well-specified extraction tasks.
      output_config: { effort: 'low', format: { type: 'json_schema', schema } },
      system,
      messages: [{ role: 'user', content: user }],
    })
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) throw new LLMError('auth', 'The Anthropic API key was rejected.')
    if (error instanceof Anthropic.RateLimitError) throw new LLMError('rate_limit', 'Rate limited — try again in a moment.', 429)
    if (error instanceof Anthropic.APIError) throw new LLMError('api', `Claude API error ${error.status}.`)
    throw new LLMError('network', 'Could not reach the Claude API.')
  }
  if (response.stop_reason === 'refusal') throw new LLMError('refusal', 'The model declined this text.', 422)
  if (response.stop_reason === 'max_tokens') throw new LLMError('truncated', 'The answer was cut off; try a shorter input.', 422)
  const block = response.content.find((b) => b.type === 'text')
  if (!block) throw new LLMError('empty', 'The model returned nothing.')
  return { data: parseJSON(block.text), model: response.model }
}

export async function chatJSON(env, { system, user, schema, maxTokens = 4000 }) {
  const cfg = llmConfig(env)
  if (!cfg) throw new LLMError('no_key', 'No model is configured. Set GROQ_API_KEY (free) or another provider key on the server.', 503)
  const t0 = Date.now()
  const out = cfg.name === 'anthropic'
    ? await anthropicCall(cfg, { system, user, schema, maxTokens })
    : await openAICompatible(cfg, { system, user, schema, maxTokens })
  return { ...out, provider: cfg.name, ms: Date.now() - t0 }
}

// Shared Node request plumbing for the Vite middleware and Vercel functions.
export async function readBody(req) {
  if (req.body && typeof req.body === 'object') return req.body
  if (typeof req.body === 'string') return JSON.parse(req.body || '{}')
  const chunks = []
  for await (const c of req) chunks.push(c)
  return JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}')
}

export function send(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export async function handle(req, res, fn) {
  if (req.method !== 'POST') return send(res, 405, { error: 'method', message: 'Use POST.' })
  try {
    send(res, 200, await fn(await readBody(req)))
  } catch (e) {
    if (e instanceof LLMError) return send(res, e.status, { error: e.code, message: e.message })
    if (e instanceof SyntaxError) return send(res, 400, { error: 'bad_json', message: 'Request body must be JSON.' })
    send(res, 500, { error: 'server', message: 'Unexpected server error.' })
  }
}
