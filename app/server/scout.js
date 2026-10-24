// Partner Scout: the agent's tools, each a short server call so no request runs long
// (Vercel's free plan cuts off slow functions). The browser drives the loop.
import { chatJSON, handle, LLMError } from './llm.js'
import { requireUser } from './auth.js'
import { normalizeProfile, SCHEMA as PROFILE_SCHEMA, STATES } from './extract.js'

// Directories and marketplaces are skipped on purpose: their terms forbid scraping and their
// listings mix in personal contact data. The agent only reads companies' own websites.
const SKIP_DOMAINS = ['indiamart.com', 'justdial.com', 'tradeindia.com', 'exportersindia.com', 'linkedin.com', 'facebook.com',
  'instagram.com', 'youtube.com', 'wikipedia.org', 'amazon.in', 'amazon.com', 'flipkart.com', 'glassdoor', 'ambitionbox.com',
  'naukri.com', 'zaubacorp.com', 'tofler.in', 'thecompanycheck.com', 'crunchbase.com', 'zoominfo.com', 'dnb.com', 'quora.com',
  'reddit.com', 'twitter.com', 'x.com', 'alibaba.com', 'made-in-china.com', 'sulekha.com', 'yellowpages', 'go4worldbusiness.com']

const INDUSTRIES = ['auto', 'electronics', 'machinery', 'pharma', 'food']

// ---------- plan ----------
const PLAN_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['product', 'requirements', 'queries', 'reasoning', 'reasoning_ja'],
  properties: {
    product: { type: 'string', description: 'What the SME sells, in a few words' },
    requirements: {
      type: 'object', additionalProperties: false,
      required: ['industry', 'budget', 'localInstall', 'ownService', 'timing'],
      properties: {
        industry: { type: 'string', enum: INDUSTRIES, description: 'Target customer industry' },
        budget: { type: 'string', enum: ['limited', 'moderate', 'committed'] },
        localInstall: { type: 'boolean', description: 'Does the product need on-site installation?' },
        ownService: { type: 'boolean', description: 'Does the SME have its own service engineers for India?' },
        timing: { type: 'string', enum: ['6m', '12m', '18m'] },
      },
    },
    queries: { type: 'array', items: { type: 'string' }, description: '2-3 web search queries that find Indian partner companies (distributors, integrators, service firms) on their own websites' },
    reasoning: { type: 'string', description: 'One or two sentences on the search strategy' },
    reasoning_ja: { type: 'string', description: 'The same in natural Japanese' },
  },
}

const PLAN_SYSTEM = `You are TsunaGo Partner Scout, an analyst helping a Japanese SME find its first Indian distribution or service partner.
Turn the SME's goal (English or Japanese) into structured requirements and 2-3 precise web search queries.
Queries should find the partner companies' OWN websites: include the product category, the partner type (distributor, system integrator, service/calibration company) and an Indian city or state that fits the industry (e.g. Pune/Chennai/Gurugram for automotive, Bengaluru for electronics, Ahmedabad/Hyderabad for pharma).
If feedback from an earlier round is given, write NEW queries that fix the gaps it describes.`

export async function plan({ goal, feedback }, env) {
  if (typeof goal !== 'string' || goal.trim().length < 10) throw new LLMError('too_short', 'Describe your product and goal in a sentence or two.', 400)
  const user = feedback
    ? `SME goal:\n${goal}\n\nEarlier round result: ${feedback}\n\nPlan the next search round.`
    : `SME goal:\n${goal}`
  const out = await chatJSON(env, { system: PLAN_SYSTEM, user, schema: PLAN_SCHEMA, maxTokens: 1200 })
  const d = out.data || {}
  const r = d.requirements || {}
  return {
    product: String(d.product || '').slice(0, 120),
    requirements: {
      industry: INDUSTRIES.includes(r.industry) ? r.industry : 'machinery',
      budget: ['limited', 'moderate', 'committed'].includes(r.budget) ? r.budget : 'limited',
      localInstall: r.localInstall !== false,
      ownService: r.ownService === true,
      timing: ['6m', '12m', '18m'].includes(r.timing) ? r.timing : '6m',
    },
    queries: (Array.isArray(d.queries) ? d.queries : []).map(String).filter(Boolean).slice(0, 3),
    reasoning: String(d.reasoning || ''),
    reasoning_ja: String(d.reasoning_ja || d.reasoning || ''),
    model: out.model, provider: out.provider, ms: out.ms,
  }
}

// ---------- search ----------
const domainOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}

export async function search({ queries }, env) {
  const key = env.TAVILY_API_KEY
  if (!key) throw new LLMError('no_search_key', 'No search provider is configured. Set TAVILY_API_KEY (free tier) on the server.', 503)
  const list = (Array.isArray(queries) ? queries : []).map(String).filter(Boolean).slice(0, 3)
  if (!list.length) throw new LLMError('no_queries', 'No search queries to run.', 400)
  const t0 = Date.now()
  const runs = await Promise.all(list.map(async (q) => {
    try {
      const res = await fetch('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
        body: JSON.stringify({ query: q, max_results: 8, search_depth: 'basic', include_answer: false }),
      })
      if (res.status === 401 || res.status === 403) throw new LLMError('auth', 'The Tavily API key was rejected.')
      if (res.status === 429 || res.status === 432) throw new LLMError('rate_limit', 'Search quota reached — try again later.', 429)
      if (!res.ok) throw new LLMError('api', `Search error ${res.status}.`)
      return { q, results: (await res.json()).results || [] }
    } catch (e) {
      if (e instanceof LLMError) throw e
      throw new LLMError('network', 'Could not reach the search service.')
    }
  }))
  const seen = new Set()
  const candidates = []
  const skipped = []
  for (const { q, results } of runs) {
    for (const r of results) {
      const domain = domainOf(r.url)
      if (!domain || seen.has(domain)) continue
      seen.add(domain)
      const blocked = SKIP_DOMAINS.find((d) => domain === d || domain.endsWith('.' + d) || domain.includes(d))
      if (blocked) skipped.push({ domain, reason: 'directory' })
      else candidates.push({ url: r.url, domain, title: String(r.title || domain).slice(0, 140), snippet: String(r.content || '').slice(0, 300), query: q })
    }
  }
  return { candidates: candidates.slice(0, 8), skipped, ms: Date.now() - t0 }
}

// ---------- read ----------
// Only public http(s) hosts: refuse IP literals and internal names so the endpoint can't be aimed at private networks.
function safeURL(raw) {
  let u
  try {
    u = new URL(raw)
  } catch {
    return null
  }
  if (!/^https?:$/.test(u.protocol)) return null
  const h = u.hostname.toLowerCase()
  if (h === 'localhost' || h.endsWith('.local') || h.endsWith('.internal') || /^[\d.]+$/.test(h) || h.includes(':') || !h.includes('.')) return null
  return u
}

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' }

export function htmlToText(html) {
  return html
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<(script|style|noscript|svg|iframe)[\s\S]*?<\/\1>/gi, ' ')
    .replace(/<(br|\/p|\/div|\/li|\/h\d|\/tr|\/section|\/article|\/header|\/footer)[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#x?[0-9a-f]+|\w+);/gi, (m, e) => {
      if (e[0] === '#') {
        const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)
        return Number.isFinite(n) ? String.fromCodePoint(n) : m
      }
      return ENTITIES[e.toLowerCase()] ?? m
    })
    .replace(/[ \t\f\r]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n')
    .trim()
}

async function fetchPage(url) {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 10_000)
  try {
    // Follow redirects by hand so every hop passes the same public-host check.
    let target = safeURL(url)
    let res
    for (let hop = 0; target && hop < 4; hop++) {
      res = await fetch(target.href, {
        signal: ctrl.signal,
        redirect: 'manual',
        headers: { 'User-Agent': 'TsunaGoPartnerScout/1.0 (research prototype; reads public company pages)', Accept: 'text/html' },
      })
      if (res.status < 300 || res.status >= 400) break
      target = safeURL(new URL(res.headers.get('location') || '', target).href)
      res = null
    }
    if (!res || !res.ok || !(res.headers.get('content-type') || '').includes('html')) return null
    return (await res.text()).slice(0, 400_000)
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

// Emails and phone numbers the company publishes in links (mailto:/tel:) aren't always visible text;
// list them so the model can quote them and the app can verify them.
function publishedContacts(html) {
  const emails = [...html.matchAll(/mailto:([^"'?\s>]+)/gi)].map((m) => decodeURIComponent(m[1]))
  const phones = [...html.matchAll(/tel:([+\d\s()-]{8,})/gi)].map((m) => m[1].trim())
  return [...new Set(emails)].slice(0, 4).map((e) => `Email: ${e}`).concat([...new Set(phones)].slice(0, 3).map((p) => `Phone: ${p}`)).join('\n')
}

function contactLink(html, base) {
  for (const m of html.matchAll(/<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    if (/contact/i.test(m[1]) || /contact/i.test(m[2])) {
      try {
        const u = new URL(m[1], base)
        if (u.hostname === base.hostname && u.href !== base.href) return u
      } catch {
        // ignore malformed links
      }
    }
  }
  return null
}

const READ_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['relevant', 'relevance_reason', 'profile', 'contact'],
  properties: {
    relevant: { type: 'boolean', description: 'True only if this is an Indian company that could distribute, integrate or service the SME product' },
    relevance_reason: { type: 'string', description: 'One short sentence' },
    profile: PROFILE_SCHEMA,
    contact: {
      type: 'object', additionalProperties: false, required: ['email', 'phone', 'contact_url'],
      properties: {
        email: { type: 'string', description: 'Business email copied exactly from the page, or empty' },
        phone: { type: 'string', description: 'Business phone copied exactly from the page, or empty' },
        contact_url: { type: 'string', description: 'Contact page URL if known, or empty' },
      },
    },
  },
}

const READ_SYSTEM = `You are TsunaGo Partner Scout. You read one Indian company's own website and decide whether it could be a distribution, integration or service partner for a Japanese SME.
Rules:
- Use only what the page text says. Unknown numbers get the schema defaults and an entry in "unknowns".
- Every fact needs a "quote" copied character-for-character from the page text.
- Contact details: copy only business contacts published on the page. Never guess an email or phone number.
- State codes are lowercase two-letter Indian codes (mh Maharashtra, tn Tamil Nadu, ka Karnataka, gj Gujarat, hr Haryana, dl Delhi, rj Rajasthan, tg Telangana, ap Andhra Pradesh, up Uttar Pradesh, wb West Bengal, mp Madhya Pradesh, pb Punjab, kl Kerala).`

const MAX_TEXT = 14000

export async function read({ url, product }, env) {
  const u = safeURL(url)
  if (!u) throw new LLMError('bad_url', 'That address cannot be read.', 400)
  const t0 = Date.now()
  const html = await fetchPage(u.href)
  if (!html) return { url: u.href, readable: false, reason: 'The site could not be loaded.' }
  let text = htmlToText(html)
  let contacts = publishedContacts(html)
  const cu = contactLink(html, u)
  if (cu && text.length < MAX_TEXT) {
    const chtml = await fetchPage(cu.href)
    if (chtml) {
      text += `\n\n[Contact page: ${cu.href}]\n` + htmlToText(chtml)
      contacts = [contacts, publishedContacts(chtml)].filter(Boolean).join('\n')
    }
  }
  if (contacts) text += `\n\n[Published contact links]\n${contacts}`
  // Keep the published contact links even when the page is long.
  text = text.length > MAX_TEXT ? text.slice(0, MAX_TEXT - 600) + '\n…\n' + text.slice(-600) : text
  if (text.length < 200) return { url: u.href, readable: false, reason: 'The page has too little text to assess.' }

  const out = await chatJSON(env, {
    system: READ_SYSTEM,
    user: `SME product: ${product || 'industrial equipment'}\nWebsite: ${u.href}\n\n<page>\n${text}\n</page>\n\nAssess this company.`,
    schema: READ_SCHEMA,
    maxTokens: 3000,
  })
  const d = out.data || {}
  const c = d.contact || {}
  return {
    url: u.href,
    readable: true,
    relevant: d.relevant === true,
    reason: String(d.relevance_reason || ''),
    profile: normalizeProfile(d.profile),
    contact: { email: String(c.email || '').trim(), phone: String(c.phone || '').trim(), contact_url: String(c.contact_url || (cu ? cu.href : '')).trim() },
    text,
    model: out.model, provider: out.provider, ms: Date.now() - t0,
  }
}

// ---------- draft ----------
const DRAFT_SCHEMA = {
  type: 'object', additionalProperties: false, required: ['subject_en', 'body_en', 'subject_ja', 'body_ja'],
  properties: {
    subject_en: { type: 'string' }, body_en: { type: 'string', description: '120-180 words' },
    subject_ja: { type: 'string' }, body_ja: { type: 'string', description: 'Natural business Japanese, same content' },
  },
}

const DRAFT_SYSTEM = `You write a first partnership enquiry from a Japanese SME to an Indian company, in English and Japanese.
Polite, specific and short: who the SME is (use only what is given), why this company (cite one or two facts given), what the SME proposes (an introductory call and a small pilot), and a clear next step. No invented facts, prices or promises. Sign off as "[Your name], [Company]".`

export async function draft({ partner, product, model }, env) {
  if (!partner || !partner.name) throw new LLMError('bad_input', 'Missing partner.', 400)
  const facts = (partner.facts || []).slice(0, 4).map((f) => `- ${f}`).join('\n')
  const out = await chatJSON(env, {
    system: DRAFT_SYSTEM,
    user: `SME product: ${product || 'industrial inspection equipment'}\nService need: ${model === 'B' ? 'needs a partner that can install and service the equipment locally' : 'needs a sales partner; the SME supports installations itself'}\n\nPartner: ${partner.name} (${partner.type || 'company'}, ${partner.city || 'India'})\nFacts from their website:\n${facts}`,
    schema: DRAFT_SCHEMA,
    maxTokens: 1500,
  })
  const d = out.data || {}
  return { subject_en: String(d.subject_en || ''), body_en: String(d.body_en || ''), subject_ja: String(d.subject_ja || ''), body_ja: String(d.body_ja || ''), model: out.model, ms: out.ms }
}

// ---------- digest (a partner's reply) ----------
const DIGEST_SCHEMA = {
  type: 'object', additionalProperties: false,
  required: ['intent', 'summary_en', 'summary_ja', 'next_step_en', 'next_step_ja'],
  properties: {
    intent: { type: 'string', enum: ['interested', 'needs_info', 'declined', 'other'] },
    summary_en: { type: 'string', description: '1-2 sentences' },
    summary_ja: { type: 'string', description: 'Same in natural Japanese' },
    next_step_en: { type: 'string', description: 'One concrete next step for the SME' },
    next_step_ja: { type: 'string', description: 'Same in natural Japanese' },
  },
}

const DIGEST_SYSTEM = `You help a Japanese SME read replies from Indian partner companies. Summarise the reply faithfully (no invented details), classify the partner's intent, and suggest one concrete next step.`

export async function digest({ partner, reply }, env) {
  const text = String(reply || '').slice(0, 6000)
  if (text.trim().length < 5) throw new LLMError('too_short', 'The reply is empty.', 400)
  const out = await chatJSON(env, { system: DIGEST_SYSTEM, user: `Partner: ${partner || 'Indian company'}\n\n<reply>\n${text}\n</reply>`, schema: DIGEST_SCHEMA, maxTokens: 800 })
  const d = out.data || {}
  return {
    intent: ['interested', 'needs_info', 'declined', 'other'].includes(d.intent) ? d.intent : 'other',
    summary_en: String(d.summary_en || ''), summary_ja: String(d.summary_ja || d.summary_en || ''),
    next_step_en: String(d.next_step_en || ''), next_step_ja: String(d.next_step_ja || d.next_step_en || ''),
    model: out.model, ms: out.ms,
  }
}

// ---------- status ----------
export function status(env) {
  const provider = env.LLM_PROVIDER || ['groq', 'huggingface', 'openrouter', 'anthropic'].find((p) => env[{ groq: 'GROQ_API_KEY', huggingface: 'HF_TOKEN', openrouter: 'OPENROUTER_API_KEY', anthropic: 'ANTHROPIC_API_KEY' }[p]]) || null
  return { model: provider, search: env.TAVILY_API_KEY ? 'tavily' : null }
}

const ACTIONS = { plan, search, read, draft, digest }

export async function handleScout(req, res, env) {
  const action = new URL(req.url, 'http://x').searchParams.get('action')
  if (action === 'status') {
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify(status(env)))
  }
  const fn = ACTIONS[action]
  if (fn && !(await requireUser(req, res, env))) return
  if (!fn) {
    res.statusCode = 404
    res.setHeader('Content-Type', 'application/json')
    return res.end(JSON.stringify({ error: 'unknown_action', message: 'Unknown scout action.' }))
  }
  return handle(req, res, (body) => fn(body, env))
}

export { STATES }
