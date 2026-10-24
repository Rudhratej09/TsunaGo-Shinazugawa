import { BUDGETS, CLUSTERS, INDUSTRIES, PARTNERS, TIMINGS } from '../data/catalog.js'
import { STATE_NAMES } from './geo.js'
import { en, msg } from '../i18n-core.js'

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

// A custom budget is entered in INR lakh; presets carry their own cap.
export const budgetCap = (a) => (a.budget === 'custom' ? Math.max(0, Number(a.budgetLakh) || 0) : BUDGETS.find((b) => b.id === a.budget).capLakh)
export const budgetLabel = (a) => (a.budget === 'custom' ? `₹${Number(a.budgetLakh) || 0} lakh (custom)` : BUDGETS.find((b) => b.id === a.budget).label)
export const industryLabel = (id) => INDUSTRIES.find((i) => i.id === id).label

export function rankClusters(a, all = PARTNERS) {
  const model = serviceModel(a)
  const limited = budgetCap(a) <= 40
  return CLUSTERS.map((c) => {
    const backers = all.filter((p) => p.clusters.includes(c.id) && checkPartner(p, a).eligible)
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
    checks.push({ id: 'industry', label: 'Sells to your customers', short: 'service-only', status: 'warn', detailT: msg('Service-only firm: pair it with a sales channel.') })
  } else {
    checks.push({
      id: 'industry', label: 'Sells to your customers', short: 'weak customer access', status: ind >= 55 ? 'pass' : 'fail',
      detailT: msg(ind >= 55 ? 'Strong customer access in {ind} ({n}/100).' : 'Weak customer access in {ind} ({n}/100).', { ind: industryLabel(a.industry), n: ind }),
    })
  }

  if (model === 'B') {
    const ok = p.install && p.engineers >= 5
    checks.push({
      id: 'install', label: 'Can install & service locally', short: 'no local install', status: ok ? 'pass' : 'fail',
      detailT: ok ? msg('{n} field engineers, {h}h response.', { n: p.engineers, h: p.responseHours })
        : p.install ? msg('Only {n} engineers — too thin for installed equipment.', { n: p.engineers })
          : msg('Sales-only partner — fails the essential installation check.'),
    })
  } else {
    checks.push({ id: 'install', label: 'Can install & service locally', status: 'na', detailT: msg('Not required: your own team supports installations.') })
  }

  checks.push({
    id: 'budget', label: 'Fits your entry budget', short: 'over budget', status: p.minCommitLakh <= cap ? 'pass' : 'fail',
    detailT: msg('Minimum commitment ₹{m}L vs your cap of ₹{c}L.', { m: p.minCommitLakh, c: cap }),
  })

  checks.push({
    id: 'conflict', label: 'No competing principal', short: 'competing brand', status: p.conflict ? 'fail' : 'pass',
    detailT: msg(p.conflict || 'No competing brand found in this product category.'),
  })

  const open = p.evidence.filter((e) => e.status !== 'verified').map((e) => ({ partner: p.name, fact: e.fact, source: e.source }))
  p.references.filter((r) => r.status !== 'verified').forEach((r) => open.push({ partner: p.name, fact: `Reference: ${r.label}`, source: 'Reference list' }))
  ;(p.unknowns || []).forEach((u) => open.push({ partner: p.name, fact: u, source: 'Not stated in brochure' }))

  for (const c of checks) c.detail = en(c.detailT)
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

export function evaluate(a, extra = []) {
  const all = [...PARTNERS, ...extra.filter((x) => !PARTNERS.some((p) => p.id === x.id))]
  const clusters = rankClusters(a, all)
  const partners = all.map((p) => {
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

  // Bullet points are msg() objects so the panel can render them in either language.
  const strengths = best.map((k) => msg('{d} is a relative strength ({n}/100).', { d: cap(SUB_LABEL[k]), n: round(p.sub[k]) }))
  if (inTop) strengths.push(msg('Already active in {r}, your highest-ranked region.', { r: topRegion.name }))
  if (p.japanPrincipals >= 3) strengths.push(msg('Has worked with {n} Japanese principals — fewer cultural onboarding costs.', { n: p.japanPrincipals }))

  const risks = fails.map((f) => f.detailT)
  if (p.type === 'Service contractor' && pairWith) risks.push(msg('Cannot sell on its own — pair it with {p} for sales reach.', { p: pairWith.name }))
  risks.push(msg('Weakest dimension: {d} ({n}/100).', { d: SUB_LABEL[weak], n: round(p.sub[weak]) }))
  if (model === 'A' && !p.install) risks.push(msg('Every installation depends on engineers flying from Japan; budget for travel and slower response.'))
  if (p.lastVerified < '2026-04') risks.push(msg('Profile last verified {d} — refresh before contracting.', { d: p.lastVerified }))

  const verify = p.open.map((o) => msg('{f} ({s})', { f: o.fact, s: o.source }))
  if (!verify.length) verify.push(msg('All listed facts are verified; confirm commercial terms in writing.'))

  const negotiation = model === 'B'
    ? msg('Anchor on a service SLA (≤{h}h on-site), engineer certification on your equipment, and a service fee tied to uptime.', { h: Math.min(p.responseHours, 24) })
    : msg('Anchor on demo targets per quarter, exclusivity limited to {r}, and a margin step-down after year one.', { r: regions.slice(0, 2).join(' / ') })

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
  // Titles/details are i18n templates; `vars` fills their {placeholders}.
  const names = shortlist.map((p) => p.name).join(', ')
  const sla = lead ? Math.min(lead.responseHours, 24) : 24
  const steps = [
    { from: 0, to: w(2), owner: 'HQ', title: 'Confirm shortlist & send bilingual intro brief', detail: names ? 'Approach {names} with a one-page brief generated by TsunaGo.' : 'Approach your shortlisted partners with a one-page brief generated by TsunaGo.', vars: { names } },
    { from: w(1), to: w(5), owner: 'TsunaGo', title: 'Verify open facts & call references', detail: 'Close every "claimed" or "pending" item before any term sheet.' },
    { from: w(3), to: w(8), owner: 'Expert', title: 'Expert review: classification, duties, standards, contract', detail: 'Customs classification, applicable standards and certification, distributor agreement and tax registration are reviewed by qualified advisers.' },
    model === 'B'
      ? { from: w(6), to: w(10), owner: 'Partner', title: 'Agree service SLA & certify partner engineers', detail: 'Target on-site response ≤{sla}h; remote training plus one on-site certification visit.', vars: { sla } }
      : { from: w(6), to: w(10), owner: 'HQ', title: 'Plan engineer travel & remote support desk', detail: 'Fix a visit calendar and a Japanese–English remote support channel.' },
    { from: w(9), to: w(14), owner: 'Partner', title: 'Ship demo unit to {region}', detail: 'Joint demos with 3–5 target buyers; record objections and price feedback.', vars: { region: region.name } },
    { from: w(14), to: weeks, owner: 'Partner', title: 'Run paid pilot with 2–3 customers', detail: 'Track demos, quotes, response time and service tickets monthly.' },
    { from: weeks - w(2), to: weeks, owner: 'HQ', title: 'Review gate: scale, adjust or switch partner', detail: 'Decide using the KPIs below — not on relationship alone.' },
  ]
  const kpis = [
    { label: 'Qualified demos', target: '≥ 8' },
    { label: 'Quotes issued', target: '≥ 4' },
    { label: model === 'B' ? 'On-site response' : 'Remote fix rate', target: model === 'B' ? '≤ 24h' : '≥ 70%' },
    { label: 'Partner follow-through', target: '≥ 90%' },
  ]
  return { steps, weeks, kpis, region, model }
}
