import { evaluate } from './engine.js'
import { findQuote, toPartner } from './ai.js'

// The agent loop runs in the browser and calls one short server tool at a time,
// so it fits Vercel's free-plan function limits and every step can be shown live.

async function post(action, body) {
  const res = await fetch(`/api/scout?action=${action}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(data.message || `Scout step failed (${res.status}).`)
    err.code = data.error
    throw err
  }
  return data
}

export async function scoutStatus() {
  try {
    const res = await fetch('/api/scout?action=status')
    return res.ok ? await res.json() : { model: null, search: null }
  } catch {
    return { model: null, search: null }
  }
}

export const liveSource = {
  live: true,
  plan: (b) => post('plan', b),
  search: (b) => post('search', b),
  read: (b) => post('read', b),
  draft: (b) => post('draft', b),
  digest: (b) => post('digest', b),
}

// Replays a recorded or simulated run with its original pacing (capped), for offline demos.
export function replaySource(run) {
  const wait = (ms) => new Promise((r) => setTimeout(r, Math.min(ms || 800, 2500)))
  let round = 0
  return {
    live: false,
    simulated: !!run.simulated,
    plan: async () => { await wait(run.plan.ms); return run.plan },
    search: async () => { round++; await wait(run.search.ms); return round === 1 ? run.search : { candidates: [], skipped: [] } },
    read: async ({ url }) => {
      const r = run.reads.find((x) => x.url === url)
      await wait(r?.ms)
      return r || { url, readable: false, reason: 'Not in the recording.' }
    },
    draft: async ({ url }) => { const d = run.drafts?.[url]; await wait(d?.ms); if (!d) throw new Error('No draft in the recording.'); return d },
    // Simulated runs carry a canned partner reply so the reply flow can be shown offline.
    reply: async (url) => { await wait(1200); return run.replies?.[url] || null },
    digest: async ({ url }) => { await wait(1200); const d = run.replies?.[url]?.digest; if (!d) throw new Error('No summary in the recording.'); return d },
  }
}

const digits = (s) => String(s || '').replace(/\D/g, '')

// A contact detail counts as verified only if it appears on the company's own page text.
function verifyContact(contact, text) {
  const t = text.toLowerCase()
  const email = contact.email && t.includes(contact.email.toLowerCase()) ? contact.email : ''
  const phone = contact.phone && digits(contact.phone).length >= 8 && digits(text).includes(digits(contact.phone)) ? contact.phone : ''
  return { email, phone, contact_url: contact.contact_url || '', claimedEmail: contact.email, claimedPhone: contact.phone }
}

export function readToPartner(r, at = new Date()) {
  const p = toPartner(r.profile, r.text, at)
  const domain = new URL(r.url).hostname.replace(/^www\./, '')
  return {
    ...p,
    id: 'scout-' + domain.replace(/[^a-z0-9]+/gi, '-'),
    website: r.url,
    domain,
    contact: verifyContact(r.contact || {}, r.text),
    quotesFound: r.profile.facts.filter((f) => findQuote(r.text, f.quote)).length,
    quotesTotal: r.profile.facts.length,
    evidence: p.evidence.map((e) => ({ ...e, source: 'Company website (AI-extracted)' })),
    scouted: true,
  }
}

// Runs the agent. `emit` receives {type, ...} events for the live timeline.
export async function runScout({ goal, source, baseAnswers, emit }) {
  const log = { goal, simulated: !!source.simulated, plan: null, search: { candidates: [], skipped: [] }, reads: [], drafts: {}, startedAt: new Date().toISOString() }
  const seen = new Set()
  const found = []
  let answers = baseAnswers
  let feedback = null

  for (let round = 1; round <= 2; round++) {
    emit({ type: 'step', id: `plan${round}`, kind: 'plan', status: 'run', round })
    const plan = await source.plan({ goal, feedback })
    if (round === 1) {
      log.plan = plan
      answers = { ...baseAnswers, ...plan.requirements, profile: baseAnswers.profile || 'scout' }
    }
    emit({ type: 'step', id: `plan${round}`, kind: 'plan', status: 'done', round, plan, answers })

    emit({ type: 'step', id: `search${round}`, kind: 'search', status: 'run', queries: plan.queries })
    const s = await source.search({ queries: plan.queries })
    log.search.candidates.push(...s.candidates)
    log.search.skipped.push(...s.skipped)
    const fresh = s.candidates.filter((c) => !seen.has(c.domain)).slice(0, round === 1 ? 6 : 4)
    fresh.forEach((c) => seen.add(c.domain))
    emit({ type: 'step', id: `search${round}`, kind: 'search', status: 'done', queries: plan.queries, candidates: fresh, skipped: s.skipped })

    // Read two sites at a time: quick enough for a live demo, gentle on free rate limits.
    const queue = [...fresh]
    const worker = async () => {
      while (queue.length) {
        const c = queue.shift()
        emit({ type: 'read', status: 'run', candidate: c })
        try {
          const r = await source.read({ url: c.url, product: log.plan.product })
          log.reads.push(r)
          if (r.readable && r.relevant && r.profile?.facts?.length) {
            const partner = readToPartner(r)
            found.push(partner)
            emit({ type: 'read', status: 'done', candidate: c, partner, reason: r.reason })
          } else {
            emit({ type: 'read', status: 'skip', candidate: c, reason: r.reason || 'Not a likely partner.' })
          }
        } catch (e) {
          emit({ type: 'read', status: 'error', candidate: c, reason: e.message })
          if (e.code === 'rate_limit' || e.code === 'no_key') throw e
        }
      }
    }
    await Promise.all([worker(), worker()])

    const result = evaluate(answers, found)
    const eligible = result.partners.filter((p) => p.scouted && p.eligible)
    emit({ type: 'step', id: `score${round}`, kind: 'score', status: 'done', eligible: eligible.length, total: found.length })

    // Reflect: one more round only if the first didn't produce enough viable partners.
    if (eligible.length >= 2 || round === 2 || !source.live) break
    const gaps = result.partners.filter((p) => p.scouted && !p.eligible).flatMap((p) => p.checks.filter((c) => c.status === 'fail').map((c) => c.label))
    feedback = `Found ${found.length} relevant companies, ${eligible.length} pass all essential checks. Most common failures: ${[...new Set(gaps)].join(', ') || 'too few relevant companies'}. Already checked: ${[...seen].join(', ')}.`
    emit({ type: 'step', id: 'reflect', kind: 'reflect', status: 'done', feedback })
  }

  const final = evaluate(answers, found)
  const top = final.partners.find((p) => p.scouted && p.eligible)
  if (top) {
    emit({ type: 'step', id: 'draft', kind: 'draft', status: 'run', partner: top })
    try {
      const d = await source.draft({
        url: top.website,
        partner: { name: top.name, type: top.type, city: top.hq.city, facts: top.evidence.map((e) => e.fact) },
        product: log.plan.product,
        model: final.model,
      })
      log.drafts[top.website] = d
      emit({ type: 'step', id: 'draft', kind: 'draft', status: 'done', partner: top, draft: d })
    } catch (e) {
      emit({ type: 'step', id: 'draft', kind: 'draft', status: 'error', reason: e.message })
    }
  }
  log.finishedAt = new Date().toISOString()
  return { log, answers, partners: found }
}

export async function draftFor(source, partner, product, model) {
  return source.draft({
    url: partner.website,
    partner: { name: partner.name, type: partner.type, city: partner.hq.city, facts: partner.evidence.map((e) => e.fact) },
    product,
    model,
  })
}
