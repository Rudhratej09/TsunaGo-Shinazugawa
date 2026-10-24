// Rules engine for the compliance roadmap: pick the steps that apply, schedule them on
// their dependencies, find the critical path and total the costs.
import { STEPS, CHANGES } from '../data/compliance.js'

const mid = ([a, b]) => Math.round((a + b) / 2)

export function ownerFor(step, input) {
  if (step.owner !== 'importer') return step.owner
  return input.mode === 'export' || input.mode === 'lo' ? 'Indian partner' : 'Your Indian entity'
}

export function buildRoadmap(input) {
  const steps = STEPS.filter((s) => s.when(input)).map((s) => ({ ...s, owner: ownerFor(s, input) }))
  const ids = new Set(steps.map((s) => s.id))
  steps.forEach((s) => { s.deps = s.deps.filter((d) => ids.has(d)) })

  // Earliest start / finish for min, likely and max durations (steps are listed after their deps).
  const byId = Object.fromEntries(steps.map((s) => [s.id, s]))
  const finish = { min: {}, likely: {}, max: {} }
  for (const s of steps.filter((x) => !x.recurring)) {
    for (const k of ['min', 'likely', 'max']) {
      const d = k === 'min' ? s.days[0] : k === 'max' ? s.days[1] : mid(s.days)
      const start = Math.max(0, ...s.deps.map((x) => finish[k][x]))
      finish[k][s.id] = start + d
      if (k === 'likely') { s.start = start; s.dur = d }
    }
  }
  const total = (k) => Math.max(0, ...Object.values(finish[k]))

  // Critical path: walk back from the latest-finishing step through the dep that finishes last.
  const critical = new Set()
  let cur = steps.filter((s) => !s.recurring).reduce((a, s) => (!a || finish.likely[s.id] > finish.likely[a.id] ? s : a), null)
  while (cur) {
    critical.add(cur.id)
    cur = cur.deps.map((d) => byId[d]).reduce((a, d) => (!a || finish.likely[d.id] > finish.likely[a.id] ? d : a), null)
  }
  steps.forEach((s) => { s.critical = critical.has(s.id) })

  const sum = (list, field) => list.reduce(([a, b], s) => [a + s[field][0], b + s[field][1]], [0, 0])
  const once = steps.filter((s) => !s.recurring)
  const annual = steps.filter((s) => s.recurring)
  const cost = (list) => {
    const gov = sum(list, 'gov')
    const pro = sum(list, 'pro')
    const min = gov[0] + pro[0]
    const max = gov[1] + pro[1]
    return { gov, pro, min, max, likely: Math.round((min + max) / 2) }
  }

  const tags = new Set(['all', input.mode, input.category, input.landBorder && 'landBorder', input.personalData && 'personalData'])
  const changes = CHANGES.filter((c) => c.tags.some((t) => tags.has(t)))
  const statusCount = steps.reduce((m, s) => ({ ...m, [s.status]: (m[s.status] || 0) + 1 }), {})

  return {
    steps,
    days: { min: total('min'), likely: total('likely'), max: total('max') },
    oneTime: cost(once),
    annual: cost(annual),
    changes,
    statusCount,
  }
}

// Landed cost of one shipment: BCD on the assessable value, social welfare surcharge on BCD,
// IGST on the value plus both duties.
export function landedDuty({ value, bcd, sws = 10, igst }) {
  const b = value * bcd / 100
  const w = b * sws / 100
  const g = (value + b + w) * igst / 100
  return { bcd: b, sws: w, igst: g, total: b + w + g, landed: value + b + w + g }
}

export function toCSV(steps, lang = 'en') {
  const head = ['Phase', 'Step', 'Authority', 'Owner', 'Days min', 'Days max', 'Gov fee min (INR)', 'Gov fee max (INR)', 'Professional fee min (INR)', 'Professional fee max (INR)', 'Deadline', 'Risk', 'Source', 'Verification', 'Annual']
  const q = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const rows = steps.map((s) => [s.phase, s.title[lang], s.authority, s.owner, s.days[0], s.days[1], s.gov[0], s.gov[1], s.pro[0], s.pro[1], s.deadline?.[lang] || '', `${s.risk.sev}: ${s.risk.text[lang]}`, s.src.url, s.status, s.recurring ? 'yes' : 'no'])
  return '﻿' + [head, ...rows].map((r) => r.map(q).join(',')).join('\n')
}
