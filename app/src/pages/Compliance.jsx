import { Fragment, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { CATEGORIES, CHECKED_ON, MODE_COMPARE, MODES, PHASES, SAMPLE } from '../data/compliance.js'
import { buildRoadmap, landedDuty, toCSV } from '../lib/compliance.js'
import { STATE_NAMES } from '../lib/geo.js'
import { useI18n } from '../i18n.jsx'

const STATUS = {
  official: 'Official source',
  secondary: 'Secondary sources agree',
  conflict: 'Sources conflict — verify',
  general: 'General guidance — verify',
}
const SHORT = { official: 'Official', secondary: 'Secondary', conflict: 'Verify!', general: 'General' }
const CAT_FROM_INDUSTRY = { auto: 'none', electronics: 'electronics', machinery: 'machinery', pharma: 'drug', food: 'food' }
const TABS = [['roadmap', 'Roadmap'], ['timeline', 'Timeline'], ['modes', 'Entry modes'], ['duty', 'Duty calculator'], ['changes', 'Rule changes']]

const store = {
  get(k, f) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f } catch { return f } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable: keep in memory */ } },
}

function fromAnswers(a) {
  return {
    company: '', industry: a.industry, category: CAT_FROM_INDUSTRY[a.industry] || 'none',
    mode: a.presence === 'none' && a.budget === 'limited' ? 'export' : 'sub',
    state: 'mh', landBorder: false, headcount: a.presence === 'none' ? 0 : 5, expats: 0, personalData: false, revenueCr: 2,
  }
}

function Seg({ value, options, onChange, lang }) {
  const { t } = useI18n()
  return (
    <div className="seg" role="radiogroup">
      {options.map((o) => <button key={String(o.id)} role="radio" aria-checked={value === o.id} className={value === o.id ? 'on' : ''} onClick={() => onChange(o.id)}>{o.ja && lang === 'ja' ? o.ja : t(o.label)}</button>)}
    </div>
  )
}
const YESNO = [{ id: true, label: 'Yes' }, { id: false, label: 'No' }]

export default function Compliance({ answers }) {
  const { t, lang } = useI18n()
  const [input, setInput] = useState(() => store.get('tsunago-compliance', fromAnswers(answers)))
  const [cur, setCur] = useState(() => store.get('tsunago-compliance-cur', { ccy: 'INR', rate: 0.57 }))
  const [tab, setTab] = useState('roadmap')
  const [openRow, setOpenRow] = useState(null)
  const [signoff, setSignoff] = useState(() => store.get('tsunago-compliance-signoff', { name: '', firm: '', done: false, date: '' }))
  const [duty, setDuty] = useState({ value: 1000000, bcd: 7.5, cepa: 0, useCepa: false, igst: 18 })
  useEffect(() => store.set('tsunago-compliance', input), [input])
  useEffect(() => store.set('tsunago-compliance-cur', cur), [cur])
  useEffect(() => store.set('tsunago-compliance-signoff', signoff), [signoff])

  const set = (patch) => setInput((i) => ({ ...i, ...patch }))
  const r = useMemo(() => buildRoadmap(input), [input])
  const L = (x) => (x && typeof x === 'object' ? x[lang] : x)

  const money = (inr) => {
    if (cur.ccy === 'JPY') {
      const y = inr / (cur.rate || 1)
      if (lang === 'ja' && y >= 10000) return `¥${Math.round(y / 10000).toLocaleString('ja-JP')}万`
      return y >= 1e6 ? `¥${(y / 1e6).toFixed(1)}M` : `¥${Math.round(y / 1000).toLocaleString('en-US')}k`
    }
    const l = inr / 100000
    return l >= 1 ? `₹${l >= 9.95 ? Math.round(l) : l.toFixed(1)}L` : `₹${Math.round(inr).toLocaleString('en-IN')}`
  }
  const range = ([a, b]) => (a === b ? money(a) : `${money(a)}–${money(b)}`)

  const download = () => {
    const blob = new Blob([toCSV(r.steps, lang)], { type: 'text/csv;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `tsunago-compliance-${input.mode}.csv`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const modeLabel = (id) => { const m = MODES.find((x) => x.id === id); return lang === 'ja' ? m.ja : t(m.label) }
  const maxDay = r.days.likely || 1
  const d = landedDuty({ value: Number(duty.value) || 0, bcd: duty.useCepa ? Number(duty.cepa) || 0 : Number(duty.bcd) || 0, igst: Number(duty.igst) || 0 })
  const dFull = landedDuty({ value: Number(duty.value) || 0, bcd: Number(duty.bcd) || 0, igst: Number(duty.igst) || 0 })

  return (
    <div className="page compliance">
      <div className="eyebrow">{t('Stage 4 · Regulation & compliance')}</div>
      <h1 className="h2">{t('India compliance roadmap')}</h1>
      <p className="muted" style={{ maxWidth: 820 }}>{t('Answer a few questions and TsunaGo builds the steps your entry route needs: who files what, with which authority, in what order, how long it takes and what it costs. Every rule shows its source and how well it is verified.')}</p>
      <div className="disclaimer">{t('Decision support, not legal or tax advice. A chartered accountant or lawyer must review this roadmap before you act on it.')}</div>

      <div className="box" style={{ marginTop: 22 }}>
        <div className="list-head">
          <span className="h3">{t('Your situation')}</span>
          <span style={{ display: 'flex', gap: 14 }}>
            <button className="link small" onClick={() => setInput({ ...SAMPLE })}>{t('Load sample: packaging-machinery maker, Gujarat')}</button>
            <button className="link small" onClick={() => setInput(fromAnswers(answers))}>{t('Reset from TsunaGo answers')}</button>
          </span>
        </div>
        <div className="grid form" style={{ marginTop: 0 }}>
          <div className="field" style={{ gridColumn: '1 / -1', borderRight: 0 }}><label>{t('Entry mode')}</label><Seg value={input.mode} options={MODES} onChange={(v) => set({ mode: v })} lang={lang} /></div>
          <div className="field" style={{ gridColumn: '1 / -1', borderRight: 0 }}><label>{t('Product category')}</label><Seg value={input.category} options={CATEGORIES} onChange={(v) => set({ category: v })} lang={lang} /></div>
          <div className="field"><label>{t('Any Chinese, Hong Kong or other land-border-country owners?')}</label><Seg value={input.landBorder} options={YESNO} onChange={(v) => set({ landBorder: v })} /></div>
          <div className="field"><label>{t('Handle personal data of people in India?')}</label><Seg value={input.personalData} options={YESNO} onChange={(v) => set({ personalData: v })} /></div>
          <div className="field"><label>{t('Main state')}</label>
            <select className="input" value={input.state} onChange={(e) => set({ state: e.target.value })}>
              {Object.entries(STATE_NAMES).sort((a, b) => a[1].localeCompare(b[1])).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}
            </select>
          </div>
          <div className="field nums">
            <label>{t('Staff in India · Japanese expats · revenue (₹ crore / yr)')}</label>
            <span>
              <input className="input" type="number" min="0" value={input.headcount} onChange={(e) => set({ headcount: Math.max(0, +e.target.value) })} aria-label={t('Staff in India')} />
              <input className="input" type="number" min="0" value={input.expats} onChange={(e) => set({ expats: Math.max(0, +e.target.value) })} aria-label={t('Japanese expats')} />
              <input className="input" type="number" min="0" step="0.5" value={input.revenueCr} onChange={(e) => set({ revenueCr: Math.max(0, +e.target.value) })} aria-label={t('Revenue (₹ crore / yr)')} />
            </span>
          </div>
        </div>
      </div>

      <div className="grid box summary-strip" style={{ marginTop: 20 }}>
        <div className="cell stat"><span>{t('Steps')}</span><b>{r.steps.length}</b></div>
        <div className="cell stat"><span>{t('Time to operate')}</span><b>{t('{n} days', { n: r.days.likely })}</b><small className="muted">{t('range {a}–{b}', { a: r.days.min, b: r.days.max })}</small></div>
        <div className="cell stat"><span>{t('One-time cost')}</span><b>{money(r.oneTime.likely)}</b><small className="muted">{range([r.oneTime.min, r.oneTime.max])}</small></div>
        <div className="cell stat"><span>{t('Every year')}</span><b>{money(r.annual.likely)}</b><small className="muted">{range([r.annual.min, r.annual.max])}</small></div>
      </div>

      <div className="cur-bar">
        <div className="seg">
          {['INR', 'JPY'].map((c) => <button key={c} className={cur.ccy === c ? 'on' : ''} onClick={() => setCur({ ...cur, ccy: c })}>{c}</button>)}
        </div>
        {cur.ccy === 'JPY' && (
          <label className="small">{t('₹ per ¥ (enter today\'s rate)')} <input className="input" type="number" step="0.01" min="0.01" value={cur.rate} onChange={(e) => setCur({ ...cur, rate: Math.max(0.01, +e.target.value) })} style={{ width: 90, display: 'inline-block' }} /></label>
        )}
        <span className="small muted">{t('Costs are ranges: government fees plus indicative professional fees. Replace them with 2–3 real quotes.')}</span>
        <span className="verif">
          {Object.keys(STATUS).filter((k) => r.statusCount[k]).map((k) => <span key={k} className={`vs vs-${k}`}>{r.statusCount[k]} · {t(STATUS[k])}</span>)}
        </span>
      </div>

      <div className="seg view-tabs" role="tablist">
        {TABS.map(([id, label]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{t(label)}</button>)}
      </div>

      {tab === 'roadmap' && (
        <div className="box">
          <table className="roadmap">
            <thead><tr><th>{t('Step')}</th><th>{t('Owner')}</th><th>{t('Days')}</th><th>{t('Cost')}</th><th>{t('Risk')}</th><th>{t('Verified')}</th></tr></thead>
            <tbody>
              {PHASES.map((ph) => {
                const list = r.steps.filter((s) => s.phase === ph.id)
                if (!list.length) return null
                return (
                  <Fragment key={ph.id}>
                    <tr className="phase"><td colSpan={6}>{lang === 'ja' ? ph.ja : t(ph.label)}</td></tr>
                    {list.map((s) => (
                      <Fragment key={s.id}>
                        <tr className={`rm-step ${openRow === s.id ? 'on' : ''}`} onClick={() => setOpenRow(openRow === s.id ? null : s.id)}>
                          <td><b>{L(s.title)}</b>{s.critical && <span className="crit" title={t('On the critical path')}>{t('critical')}</span>}{s.recurring && <span className="tag" style={{ marginLeft: 6 }}>{t('yearly')}</span>}<div className="small muted">{s.authority}</div></td>
                          <td>{t(s.owner)}</td>
                          <td>{s.days[0]}–{s.days[1]}</td>
                          <td>{range([s.gov[0] + s.pro[0], s.gov[1] + s.pro[1]])}</td>
                          <td><span className={`sev sev-${s.risk.sev.toLowerCase()}`}>{t(s.risk.sev)}</span></td>
                          <td><span className={`vs vs-${s.status}`} title={t(STATUS[s.status])}>{t(SHORT[s.status])}</span></td>
                        </tr>
                        {openRow === s.id && (
                          <tr className="rm-detail"><td colSpan={6}>
                            <p style={{ marginTop: 0 }}>{L(s.what)}</p>
                            <div className="detail-grid">
                              <div><div className="mini">{t('Documents')}</div><ul>{s.docs.map((x) => <li key={x}>{x}</li>)}</ul></div>
                              <div>
                                <div className="mini">{t('Cost breakdown')}</div>
                                <p>{t('Government fee')}: {range(s.gov)}<br />{t('Professional fee (estimate)')}: {range(s.pro)}</p>
                                {s.deadline && <><div className="mini">{t('Deadline')}</div><p>{L(s.deadline)}</p></>}
                              </div>
                              <div>
                                <div className="mini">{t('If missed')}</div><p>{L(s.risk.text)}</p>
                                <div className="mini">{t('Rule source')}</div>
                                <p><a href={s.src.url} target="_blank" rel="noreferrer">{s.src.title}</a><br /><span className={`vs vs-${s.status}`}>{t(STATUS[s.status])}</span> · {t('checked {d}', { d: CHECKED_ON })}</p>
                                {s.portal && <p><a href={s.portal} target="_blank" rel="noreferrer">{t('Open the portal →')}</a></p>}
                              </div>
                            </div>
                            {s.deps.length > 0 && <p className="small muted" style={{ marginBottom: 0 }}>{t('After')}: {s.deps.map((x) => L(r.steps.find((y) => y.id === x).title)).join(' · ')}</p>}
                          </td></tr>
                        )}
                      </Fragment>
                    ))}
                  </Fragment>
                )
              })}
            </tbody>
          </table>
          {input.revenueCr > 5 && <div className="cell small">{t('Revenue above ₹5 crore: GST e-invoicing applies to your B2B invoices.')}</div>}
        </div>
      )}

      {tab === 'timeline' && (
        <div className="box">
          <div className="list-head"><span className="h3">{t('Set-up timeline')}</span><span className="small muted">{t('Likely durations · pink = critical path · {n} days', { n: r.days.likely })}</span></div>
          <div className="gantt">
            {r.steps.filter((s) => !s.recurring).sort((a, b) => a.start - b.start).map((s) => (
              <div key={s.id} className="g-row">
                <span className="g-label">{L(s.title)}</span>
                <span className="g-track">
                  <motion.i className={s.critical ? 'crit' : ''} initial={{ width: 0 }} animate={{ width: `${(s.dur / maxDay) * 100}%` }} style={{ left: `${(s.start / maxDay) * 100}%` }} title={`${t('day')} ${s.start}–${s.start + s.dur}`} />
                </span>
              </div>
            ))}
            <div className="g-row g-axis"><span /><span className="g-track">{[0, 0.25, 0.5, 0.75, 1].map((f) => <em key={f} style={{ left: `${f * 100}%` }}>{Math.round(f * maxDay)}</em>)}</span></div>
          </div>
          {r.steps.some((s) => s.recurring) && (
            <div className="cell">
              <div className="mini">{t('Every year after set-up')}</div>
              <ul className="evidence">{r.steps.filter((s) => s.recurring).map((s) => <li key={s.id}>{L(s.title)}{s.deadline && <> — <b style={{ fontWeight: 500 }}>{L(s.deadline)}</b></>}</li>)}</ul>
            </div>
          )}
        </div>
      )}

      {tab === 'modes' && (
        <div className="box" style={{ overflowX: 'auto' }}>
          <table className="roadmap modes">
            <thead><tr><th />{MODES.map((m) => <th key={m.id} className={m.id === input.mode ? 'pick' : ''}>{modeLabel(m.id)}</th>)}</tr></thead>
            <tbody>
              {MODE_COMPARE.map((row) => <tr key={row.key}><th>{L(row.label)}</th>{MODES.map((m) => <td key={m.id} className={m.id === input.mode ? 'pick' : ''}>{L(row[m.id])}</td>)}</tr>)}
              <tr><th>{t('Steps in this roadmap')}</th>{MODES.map((m) => { const x = buildRoadmap({ ...input, mode: m.id }); return <td key={m.id} className={m.id === input.mode ? 'pick' : ''}>{x.steps.length} · {t('{n} days', { n: x.days.likely })} · {money(x.oneTime.likely)}</td> })}</tr>
            </tbody>
          </table>
          <div className="cell small muted">{t('General guidance; tax rates link to sources in the roadmap. Click a mode in "Your situation" to rebuild the roadmap.')}</div>
        </div>
      )}

      {tab === 'duty' && (
        <div className="box">
          <div className="list-head"><span className="h3">{t('Import duty on one shipment')}</span><span className="small muted">{t('BCD + social welfare surcharge (10% of BCD) + IGST')}</span></div>
          <div className="grid form" style={{ marginTop: 0 }}>
            <div className="field"><label>{t('Assessable (CIF) value, ₹')}</label><input className="input" type="number" min="0" value={duty.value} onChange={(e) => setDuty({ ...duty, value: e.target.value })} /></div>
            <div className="field"><label>{t('Basic customs duty % for your HS code')}</label><input className="input" type="number" min="0" step="0.5" value={duty.bcd} onChange={(e) => setDuty({ ...duty, bcd: e.target.value })} /></div>
            <div className="field"><label>{t('CEPA preferential BCD %')}</label>
              <span style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <input className="input" type="number" min="0" step="0.5" value={duty.cepa} onChange={(e) => setDuty({ ...duty, cepa: e.target.value })} />
                <label className="small" style={{ whiteSpace: 'nowrap', textTransform: 'none', letterSpacing: 0, margin: 0 }}><input type="checkbox" checked={duty.useCepa} onChange={(e) => setDuty({ ...duty, useCepa: e.target.checked })} /> {t('apply')}</label>
              </span>
            </div>
            <div className="field"><label>{t('IGST %')}</label><input className="input" type="number" min="0" step="1" value={duty.igst} onChange={(e) => setDuty({ ...duty, igst: e.target.value })} /></div>
          </div>
          <table className="roadmap duty">
            <tbody>
              <tr><th>{t('Basic customs duty')}</th><td>{money(d.bcd)}</td></tr>
              <tr><th>{t('Social welfare surcharge')}</th><td>{money(d.sws)}</td></tr>
              <tr><th>{t('IGST (creditable if GST-registered)')}</th><td>{money(d.igst)}</td></tr>
              <tr className="total"><th>{t('Landed cost')}</th><td>{money(d.landed)}</td></tr>
              {duty.useCepa && <tr><th>{t('Saved with CEPA certificate')}</th><td style={{ color: 'var(--pass)' }}>{money(dFull.total - d.total)}</td></tr>}
            </tbody>
          </table>
          <div className="cell small muted">{t('Defaults are examples only. Look up the BCD, CEPA rate and IGST for your exact HS code on the CBIC tariff before quoting a price.')} <a href="https://www.icegate.gov.in" target="_blank" rel="noreferrer">ICEGATE</a></div>
        </div>
      )}

      {tab === 'changes' && (
        <div className="box">
          <div className="list-head"><span className="h3">{t('Rule changes that affect you')}</span><span className="small muted">{t('Filtered by your entry mode, product and answers')}</span></div>
          {r.changes.map((c) => (
            <div key={c.title.en} className="cell change">
              <span className="mini">{c.date}</span>
              <div><b style={{ fontWeight: 500 }}>{L(c.title)}</b> <span className={`vs vs-${c.status}`}>{t(STATUS[c.status])}</span></div>
              <div className="small">{L(c.effect)} <a href={c.src.url} target="_blank" rel="noreferrer">{t('Rule source')}</a></div>
            </div>
          ))}
        </div>
      )}

      <div className="box signoff">
        <div className="list-head"><span className="h3">{t('Professional sign-off')}</span>
          <span className={`vs ${signoff.done ? 'vs-official' : 'vs-conflict'}`}>{signoff.done ? t('Reviewed by {n} on {d}', { n: signoff.name, d: signoff.date }) : t('Not yet reviewed')}</span></div>
        <div className="cell" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <input className="input" style={{ maxWidth: 220 }} placeholder={t('Reviewer name')} value={signoff.name} onChange={(e) => setSignoff({ ...signoff, name: e.target.value, done: false })} />
          <input className="input" style={{ maxWidth: 260 }} placeholder={t('CA / law firm')} value={signoff.firm} onChange={(e) => setSignoff({ ...signoff, firm: e.target.value, done: false })} />
          <button className="btn" disabled={!signoff.name.trim() || !signoff.firm.trim()} onClick={() => setSignoff({ ...signoff, done: true, date: new Date().toISOString().slice(0, 10) })}>{t('Record review')}</button>
          <span style={{ flex: 1 }} />
          <button className="btn ghost" onClick={download}>{t('Download CSV')}</button>
          <button className="btn ghost" onClick={() => window.print()}>{t('Print / PDF')}</button>
        </div>
      </div>
    </div>
  )
}
