import { BUDGETS, CLUSTERS, INDUSTRIES, PARTNERS, TIMINGS } from '../data/catalog.js'
import { STATE_NAMES } from './geo.js'

const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v))
const round = (v) => Math.round(v)

export const DEFAULT_PRIORITIES = { reach: 4, technical: 3, cost: 3, speed: 3, japan: 2 }

// Service model A: our own team supports the product. B: a local partner must install and service it.
export function serviceModel(a) {
  return a.localInstall && !a.ownService ? 'B' : 'A'
}

export const MODEL_COPY = {
  A: { title: 'Our team provides support', route: 'Distributor-led pilot', ja: '自社サポート型' },
  B: { title: 'We need local installation', route: 'Service-capable integrator', ja: '現地据付型' },
}

const budgetCap = (a) => BUDGETS.find((b) => b.id === a.budget).capLakh
export const industryLabel = (id) => INDUSTRIES.find((i) => i.id === id).label

export function rankClusters(a) {
  const model = serviceModel(a)
  const limited = a.budget === 'limited'
  return CLUSTERS.map((c) => {
    const backers = PARTNERS.filter((p) => p.clusters.includes(c.id) && checkPartner(p, a).eligible)
    const support = clamp(backers.length * 34)
    const parts = {
      demand: c.demand[a.industry],
      japan: c.japan,
      logistics: c.logistics,
      talent: c.talent,
      cost: c.cost,
      support,
    }
    const w = { demand: 0.38, japan: 0.14, logistics: 0.1, talent: 0.08, cost: limited ? 0.14 : 0.08, support: model === 'B' ? 0.2 : 0.12 }
    const total = Object.keys(w).reduce((s, k) => s + w[k], 0)
    const score = round(Object.keys(w).reduce((s, k) => s + parts[k] * w[k], 0) / total)
    return { ...c, score, parts, backers: backers.map((b) => b.id) }
  }).sort((x, y) => y.score - x.score)
}

export function checkPartner(p, a) {
  const model = serviceModel(a)
  const ind = p.industries[a.industry]
  const cap = budgetCap(a)
  const checks = []

  if (p.type === 'Service contractor') {
    checks.push({ id: 'industry', label: 'Sells to your customers', short: 'service-only', status: 'warn', detail: 'Service-only firm: pair it with a sales channel.' })
  } else {
    checks.push({
      id: 'industry', label: 'Sells to your customers', short: 'weak customer access', status: ind >= 55 ? 'pass' : 'fail',
      detail: ind >= 55 ? `Strong ${industryLabel(a.industry).toLowerCase()} access (${ind}/100).` : `Weak ${industryLabel(a.industry).toLowerCase()} access (${ind}/100).`,
    })
  }

  if (model === 'B') {
    const ok = p.install && p.engineers >= 5
    checks.push({
      id: 'install', label: 'Can install & service locally', short: 'cannot install locally', status: ok ? 'pass' : 'fail',
      detail: ok ? `${p.engineers} field engineers, ${p.responseHours}h response.` : p.install ? `Only ${p.engineers} engineers — too thin for installed equipment.` : 'Sales-only partner — fails the essential installation check.',
    })
  } else {
    checks.push({ id: 'install', label: 'Can install & service locally', status: 'na', detail: 'Not required: your own team supports installations.' })
  }

  checks.push({
    id: 'budget', label: 'Fits your entry budget', short: 'over budget', status: p.minCommitLakh <= cap ? 'pass' : 'fail',
    detail: `Minimum commitment ₹${p.minCommitLakh}L vs your cap of ₹${cap}L.`,
  })

  checks.push({
    id: 'conflict', label: 'No competing principal', short: 'competing brand', status: p.conflict ? 'fail' : 'pass',
    detail: p.conflict || 'No competing brand found in this product category.',
  })

  const open = p.evidence.filter((e) => e.status !== 'verified').map((e) => ({ partner: p.name, fact: e.fact, source: e.source }))
  p.references.filter((r) => r.status !== 'verified').forEach((r) => open.push({ partner: p.name, fact: `Reference: ${r.label}`, source: 'Reference list' }))

  const eligible = !checks.some((c) => c.status === 'fail')
  return { checks, eligible, open }
}

export function scorePartner(p, a, topClusters) {
  const model = serviceModel(a)
  const cap = budgetCap(a)
  const covered = topClusters.slice(0, 2).filter((c) => p.clusters.includes(c.id)).length / 2
  const sub = {
    reach: clamp(p.industries[a.industry] * 0.75 + covered * 25 - (p.type === 'Service contractor' ? 30 : 0)),
    technical: clamp(Math.min(100, p.engineers * 5) * 0.8 + (p.calibration ? 20 : 0)),
    cost: clamp(100 - (p.marginPct + p.serviceFeePct) * 1.6 - (p.minCommitLakh / cap) * 25),
    speed: clamp(100 - (p.responseHours - 8) * 1.6),
    japan: clamp(25 + p.japanPrincipals * 12),
  }
  const pr = a.priorities || DEFAULT_PRIORITIES
  const w = { ...pr, technical: pr.technical * (model === 'B' ? 1.6 : 0.5) }
  const total = Object.values(w).reduce((s, v) => s + v, 0)
  const score = round(Object.keys(sub).reduce((s, k) => s + sub[k] * w[k], 0) / total)
  return { sub, score, coverage: covered }
}

export function evaluate(a) {
  const clusters = rankClusters(a)
  const partners = PARTNERS.map((p) => {
    const c = checkPartner(p, a)
    const s = scorePartner(p, a, clusters)
    return { ...p, ...c, ...s }
  })
  // Clean passes first, then passes with a warning (e.g. service-only firms), then exclusions.
  const tier = (p) => (p.eligible ? (p.checks.some((c) => c.status === 'warn') ? 1 : 2) : 0)
  partners.sort((x, y) => tier(y) - tier(x) || y.score - x.score)
  return { model: serviceModel(a), clusters, partners }
}

// ---------- Cost scenario ----------
export const COST_DEFAULTS = { units: 6, unitPrice: 12, freightPct: 5, dutyPct: 11, tripCost: 3.2, targetPct: 25 }

export function costModel(p, a, params) {
  const model = serviceModel(a)
  const { units, unitPrice, freightPct, dutyPct, tripCost, targetPct } = params
  const exWorks = units * unitPrice
  const landing = exWorks * (freightPct + dutyPct) / 100
  const trips = model === 'A' || !p.install ? units * 1.5 : 0
  const travel = trips * tripCost
  const training = model === 'B' ? 4 : 1.5
  const m = p.marginPct / 100
  const f = model === 'B' ? p.serviceFeePct / 100 : 0
  const base = exWorks + landing + travel + training
  // Price per unit so the principal keeps targetPct on top of its own costs after partner margin and service fee.
  const priceUnit = (base * (1 + targetPct / 100)) / (units * Math.max(0.05, 1 - m - f))
  const revenue = priceUnit * units
  const parts = [
    { id: 'exworks', label: 'Ex-works product', value: exWorks },
    { id: 'landing', label: 'Freight, duty & taxes', value: landing },
    { id: 'margin', label: 'Partner margin', value: revenue * m },
    { id: 'service', label: model === 'B' ? 'Partner service fee' : 'Engineer travel', value: model === 'B' ? revenue * f + travel : travel },
    { id: 'training', label: 'Training & demo', value: training },
    { id: 'profit', label: 'Your margin', value: base * (targetPct / 100) },
  ]
  return { parts, priceUnit, revenue, trips, model }
}

// ---------- Analyst narrative (bilingual) ----------
const SUB_LABEL = { reach: 'customer access', technical: 'technical capability', cost: 'cost to serve', speed: 'speed to pilot', japan: 'Japan experience' }
const SUB_LABEL_JA = { reach: '顧客アクセス', technical: '技術力', cost: 'コスト', speed: '対応スピード', japan: '日本企業との実績' }

export function analyse(p, a, clusters, partners = []) {
  const pairWith = partners.find((x) => x.type === 'Distributor' && x.checks.find((c) => c.id === 'industry').status === 'pass' && x.checks.every((c) => c.id === 'install' || c.status !== 'fail'))
  const model = serviceModel(a)
  const ranked = Object.entries(p.sub).sort((x, y) => y[1] - x[1])
  const best = ranked.slice(0, 2).map(([k]) => k)
  const weak = ranked[ranked.length - 1][0]
  const fails = p.checks.filter((c) => c.status === 'fail')
  const topRegion = clusters[0]
  const regions = Object.keys(p.presence).map((s) => STATE_NAMES[s])
  const inTop = p.clusters.includes(topRegion.id)
  const verdict = !p.eligible ? 'exclude' : p.score >= 70 ? 'lead' : p.score >= 55 ? 'backup' : 'watch'

  const verdictText = {
    lead: 'Lead candidate for the pilot',
    backup: 'Credible backup option',
    watch: 'Keep on the watch list',
    exclude: 'Fails an essential check',
  }[verdict]
  const verdictJa = { lead: 'パイロットの第一候補', backup: '有力な代替候補', watch: '継続観察', exclude: '必須条件を満たさない' }[verdict]

  const strengths = best.map((k) => `${cap(SUB_LABEL[k])} is a relative strength (${round(p.sub[k])}/100).`)
  if (inTop) strengths.push(`Already active in ${topRegion.name}, your highest-ranked region.`)
  if (p.japanPrincipals >= 3) strengths.push(`Has worked with ${p.japanPrincipals} Japanese principals — fewer cultural onboarding costs.`)

  const risks = fails.map((f) => f.detail)
  if (p.type === 'Service contractor' && pairWith) risks.push(`Cannot sell on its own — pair it with ${pairWith.name} for sales reach.`)
  risks.push(`Weakest dimension: ${SUB_LABEL[weak]} (${round(p.sub[weak])}/100).`)
  if (model === 'A' && !p.install) risks.push('Every installation depends on engineers flying from Japan; budget for travel and slower response.')
  if (p.lastVerified < '2026-04') risks.push(`Profile last verified ${p.lastVerified} — refresh before contracting.`)

  const verify = p.open.map((o) => `${o.fact} (${o.source})`)
  if (!verify.length) verify.push('All listed facts are verified; confirm commercial terms in writing.')

  const negotiation = model === 'B'
    ? `Anchor on a service SLA (≤${Math.min(p.responseHours, 24)}h on-site), engineer certification on your equipment, and a service fee tied to uptime.`
    : `Anchor on demo targets per quarter, exclusivity limited to ${regions.slice(0, 2).join(' and ')}, and a margin step-down after year one.`

  const summary = `${p.name} scores ${p.score}/100 for an entry into ${industryLabel(a.industry).toLowerCase()} under service model ${model} (${MODEL_COPY[model].title.toLowerCase()}). ${verdictText}. ${p.eligible ? `Its edge is ${SUB_LABEL[best[0]]} and ${SUB_LABEL[best[1]]}` : `It fails: ${fails.map((f) => f.label.toLowerCase()).join(', ')}`}; active in ${regions.slice(0, 3).join(', ')}.`

  const ja = {
    summary: `${p.name}は、${INDUSTRIES.find((i) => i.id === a.industry).ja}分野・サービスモデル${model}（${MODEL_COPY[model].ja}）で${p.score}点。判定：${verdictJa}。${p.eligible ? `強みは${SUB_LABEL_JA[best[0]]}と${SUB_LABEL_JA[best[1]]}。` : `不適合項目：${fails.length}件。`}未確認事項${p.open.length}件はパイロット前に確認が必要です。`,
  }

  return { verdict, verdictText, summary, strengths, risks, verify, negotiation, ja }
}

const cap = (s) => s[0].toUpperCase() + s.slice(1)

// ---------- Pilot plan ----------
export function buildPlan(a, shortlist, clusters) {
  const model = serviceModel(a)
  const weeks = TIMINGS.find((t) => t.id === a.timing).weeks
  const k = weeks / 26
  const w = (n) => Math.max(1, round(n * k))
  const region = clusters[0]
  const lead = shortlist[0]
  const steps = [
    { from: 0, to: w(2), owner: 'HQ', title: 'Confirm shortlist & send bilingual intro brief', detail: `Approach ${shortlist.map((p) => p.name).join(', ') || 'your shortlisted partners'} with a one-page brief generated by TsunaGo.` },
    { from: w(1), to: w(5), owner: 'TsunaGo', title: 'Verify open facts & call references', detail: 'Close every "claimed" or "pending" item before any term sheet.' },
    { from: w(3), to: w(8), owner: 'Expert', title: 'Expert review: classification, duties, standards, contract', detail: 'Customs classification, applicable standards and certification, distributor agreement and tax registration are reviewed by qualified advisers.' },
    model === 'B'
      ? { from: w(6), to: w(10), owner: 'Partner', title: 'Agree service SLA & certify partner engineers', detail: `Target on-site response ≤${lead ? Math.min(lead.responseHours, 24) : 24}h; remote training plus one on-site certification visit.` }
      : { from: w(6), to: w(10), owner: 'HQ', title: 'Plan engineer travel & remote support desk', detail: 'Fix a visit calendar and a Japanese–English remote support channel.' },
    { from: w(9), to: w(14), owner: 'Partner', title: `Ship demo unit to ${region.name}`, detail: 'Joint demos with 3–5 target buyers; record objections and price feedback.' },
    { from: w(14), to: weeks, owner: 'Partner', title: 'Run paid pilot with 2–3 customers', detail: 'Track demos, quotes, response time and service tickets monthly.' },
    { from: weeks - w(2), to: weeks, owner: 'HQ', title: 'Review gate: scale, adjust or switch partner', detail: 'Decide using the KPIs below — not on relationship alone.' },
  ]
  const kpis = [
    { label: 'Qualified demos', target: '≥ 8' },
    { label: 'Quotes issued', target: '≥ 4' },
    { label: model === 'B' ? 'On-site response' : 'Remote fix rate', target: model === 'B' ? '≤ 24h' : '≥ 70%' },
    { label: 'Partner follow-through', target: '≥ 90% actions on time' },
  ]
  return { steps, weeks, kpis, region, model }
}
