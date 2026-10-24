import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import IndiaMap from './IndiaMap.jsx'
import { Radar, ScoreRing, StackedBar } from './Charts.jsx'
import { CLUSTERS, JP_PRESENCE } from '../data/catalog.js'
import { analyse, COST_DEFAULTS, costModel, industryLabel, MODEL_COPY } from '../lib/engine.js'
import { STATE_NAMES } from '../lib/geo.js'

const SUB = { reach: 'Customer access', technical: 'Technical', cost: 'Cost to serve', speed: 'Speed', japan: 'Japan exp.' }
const STATUS = { verified: 'Verified', claimed: 'Claimed', pending: 'Pending' }
const CHECK_NAME = { industry: 'Customer access', install: 'Installation & service', budget: 'Budget fit', conflict: 'Competing principals', technical: 'Technical score', speed: 'Speed score', japan: 'Japan experience' }

export default function SidePanel({ item, answers, result, onClose, shortlist, toggleShortlist }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      {item && (
        <>
          <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="panel" role="dialog" aria-modal="true" aria-label={item.data.name}
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'tween', duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
            {item.kind === 'partner'
              ? <PartnerView key={item.data.id} p={item.data} answers={answers} result={result} onClose={onClose}
                  starred={shortlist.includes(item.data.id)} onStar={() => toggleShortlist(item.data.id)} />
              : <RegionView key={item.data.id} c={item.data} answers={answers} result={result} onClose={onClose} />}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

function Head({ eyebrow, title, children, onClose, tabs, tab, setTab }) {
  return (
    <div className="panel-head">
      <button className="x" onClick={onClose} aria-label="Close panel">✕</button>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="panel-title">{title}</h2>
      {children}
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
    </div>
  )
}

function PartnerView({ p, answers, result, onClose, starred, onStar }) {
  const [tab, setTab] = useState('Analysis')
  const [lang, setLang] = useState('en')
  const [params, setParams] = useState(COST_DEFAULTS)
  const ai = useMemo(() => analyse(p, answers, result.clusters, result.partners), [p, answers, result])
  const cost = useMemo(() => costModel(p, answers, params), [p, answers, params])
  const radar = Object.fromEntries(Object.entries(p.sub).map(([k, v]) => [k, { label: SUB[k], value: v }]))
  const clusters = CLUSTERS.filter((c) => p.clusters.includes(c.id))

  return (
    <>
      <Head eyebrow={`${p.type} · ${p.hq.city}`} title={p.name} onClose={onClose} tabs={['Analysis', 'Regions', 'Costs', 'Evidence']} tab={tab} setTab={setTab}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className={`verdict ${ai.verdict}`}>{ai.verdictText}</span>
          <span className="tag">{p.aiExtracted ? `✦ AI-extracted ${p.lastVerified} · unverified` : `Verified ${p.lastVerified}`}</span>
          <button className={`tag ${starred ? 'sakura' : 'ink'}`} style={{ cursor: 'pointer' }} onClick={onStar}>
            {starred ? '✿ Shortlisted' : '+ Add to shortlist'}
          </button>
        </div>
      </Head>
      <div className="panel-body">
        {tab === 'Analysis' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="kpis">
              <ScoreRing value={p.score} tone={p.eligible ? '#111' : '#b8323f'} />
              <div>
                {Object.entries(p.sub).map(([k, v]) => (
                  <div className="subscore" key={k}>
                    <span>{SUB[k]}</span>
                    <div className="bar"><motion.i initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.9 }} /></div>
                    <em>{Math.round(v)}</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai">
              <span className="ai-tag">✿ AI analyst summary</span>
              <div className="lang">
                <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
                <button className={lang === 'ja' ? 'on' : ''} onClick={() => setLang('ja')}>日本語</button>
              </div>
              <p style={{ marginTop: 14, fontFamily: lang === 'ja' ? 'var(--jp)' : undefined, fontSize: lang === 'ja' ? 15 : undefined }}>
                {lang === 'en' ? ai.summary : ai.ja.summary}
              </p>
              <h5>Why it fits</h5>
              <ul>{ai.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
              <h5>Watch-outs</h5>
              <ul>{ai.risks.map((s) => <li key={s}>{s}</li>)}</ul>
              <h5>Negotiation angle</h5>
              <ul><li>{ai.negotiation}</li></ul>
              <div className="src">Generated from the evidence tab · every claim traces to a dated source.</div>
            </div>

            <h3 className="h3" style={{ marginTop: 28 }}>Essential checks · model {result.model}</h3>
            <div className="checks">
              {p.checks.map((c) => (
                <div className="check" key={c.id}>
                  <span className={`pip ${c.status}`} style={{ marginTop: 5 }} />
                  <div><b>{c.label}</b> <span className="muted small">· {c.status === 'na' ? 'not required' : c.status}</span><p>{c.detail}</p></div>
                </div>
              ))}
            </div>

            <h3 className="h3" style={{ marginTop: 28 }}>Capability profile</h3>
            <div style={{ display: 'grid', placeItems: 'center', marginTop: 8 }}><Radar data={radar} size={260} /></div>
          </motion.div>
        )}

        {tab === 'Regions' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="map-wrap">
              <IndiaMap presence={p.presence} hq={p.hq} clusters={CLUSTERS} highlightClusters={p.clusters} animateKey={p.id} height={460} />
              <div className="map-legend">
                <span><i style={{ background: '#f3b4c4' }} />Sakura density = regional presence</span>
                <span><i style={{ background: '#b8323f', transform: 'rotate(45deg) scale(.8)' }} />Headquarters</span>
                <span><i style={{ border: '1px solid #111', borderRadius: '50%' }} />Industrial cluster</span>
              </div>
            </div>
            <h3 className="h3" style={{ marginTop: 22 }}>Coverage by state</h3>
            <div style={{ marginTop: 8 }}>
              {Object.entries(p.presence).sort((a, b) => b[1] - a[1]).map(([s, v]) => (
                <div className="subscore" key={s}>
                  <span>{STATE_NAMES[s]}</span>
                  <div className="bar sakura"><motion.i initial={{ width: 0 }} animate={{ width: `${v * 100}%` }} /></div>
                  <em>{Math.round(v * 100)}</em>
                </div>
              ))}
            </div>
            <h3 className="h3" style={{ marginTop: 22 }}>Clusters served</h3>
            {clusters.map((c) => {
              const rank = result.clusters.findIndex((x) => x.id === c.id) + 1
              return (
                <div className="check" key={c.id}>
                  <span className="num">#{rank}</span>
                  <div><b>{c.name}</b> <span className="muted small">· region rank {rank} of {result.clusters.length}</span><p>{c.note}</p></div>
                </div>
              )
            })}
          </motion.div>
        )}

        {tab === 'Costs' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="muted small" style={{ marginTop: 0 }}>
              Editable 12-month pilot scenario for <b>{industryLabel(answers.industry).toLowerCase()}</b> under model {cost.model} — {MODEL_COPY[cost.model].title.toLowerCase()}. Values in ₹ lakh.
            </p>
            {[
              ['units', 'Pilot units', 1, 20, 1, (v) => v],
              ['unitPrice', 'Ex-works price / unit', 2, 40, 0.5, (v) => `₹${v}L`],
              ['freightPct', 'Freight & insurance', 0, 15, 0.5, (v) => `${v}%`],
              ['dutyPct', 'Duty & taxes (assumed)', 0, 40, 0.5, (v) => `${v}%`],
              ['tripCost', 'Engineer trip from Japan', 0.5, 8, 0.1, (v) => `₹${v.toFixed(1)}L`],
              ['targetPct', 'Your target margin', 0, 60, 1, (v) => `${v}%`],
            ].map(([k, label, min, max, step, fmt]) => (
              <div className="slider" key={k}>
                <span>{label}</span>
                <input type="range" min={min} max={max} step={step} value={params[k]} aria-label={label}
                  onChange={(e) => setParams({ ...params, [k]: +e.target.value })} />
                <output>{fmt(params[k])}</output>
              </div>
            ))}
            <hr className="hair" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div className="stat"><span>Required list price / unit</span><b>₹{cost.priceUnit.toFixed(1)}L</b></div>
              <div className="stat" style={{ textAlign: 'right' }}><span>Pilot revenue</span><b>₹{cost.revenue.toFixed(0)}L</b></div>
            </div>
            <div style={{ marginTop: 18 }}><StackedBar parts={cost.parts} /></div>
            <p className="small muted" style={{ marginTop: 18 }}>
              {cost.trips > 0
                ? `Includes ${cost.trips.toFixed(0)} engineer trips from Japan because ${p.install ? 'your own team handles support' : 'this partner cannot install'}.`
                : `No engineer travel: ${p.name} installs locally for a ${p.serviceFeePct}% service fee.`}
              {' '}Duty and tax rates are placeholders — confirm classification with a customs broker (expert-reviewed step).
            </p>
          </motion.div>
        )}

        {tab === 'Evidence' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="muted small" style={{ marginTop: 0 }}>How each recommendation is built: source text → extracted fact → the check it feeds.</p>
            {p.evidence.map((e, i) => (
              <div key={i}>
                <div className="chain">
                  <div><small>{e.source} · {e.date}</small><q>{e.quote}</q></div>
                  <span>→</span>
                  <div><small>Extracted fact</small>{e.fact}</div>
                  <span>→</span>
                  <div style={{ background: e.status === 'verified' ? '#fff' : 'var(--sakura-soft)' }}>
                    <small>Feeds check</small>{CHECK_NAME[e.check] || e.check}<div className="src">{STATUS[e.status]}</div>
                  </div>
                </div>
              </div>
            ))}
            <h3 className="h3" style={{ marginTop: 24 }}>References</h3>
            {p.references.map((r) => (
              <div className="check" key={r.label}>
                <span className={`pip ${r.status === 'verified' ? 'pass' : r.status === 'claimed' ? 'warn' : 'na'}`} style={{ marginTop: 5 }} />
                <div><b>{r.label}</b><p>{STATUS[r.status]}</p></div>
              </div>
            ))}
            <h3 className="h3" style={{ marginTop: 24 }}>To verify before the pilot</h3>
            <ul style={{ fontSize: 15.5, paddingLeft: 18 }}>{ai.verify.map((v) => <li key={v}>{v}</li>)}</ul>
          </motion.div>
        )}
      </div>
    </>
  )
}

function RegionView({ c, answers, result, onClose }) {
  const [tab, setTab] = useState('Analysis')
  const rank = result.clusters.findIndex((x) => x.id === c.id) + 1
  const backers = result.partners.filter((p) => p.clusters.includes(c.id))
  const presence = { [c.state]: 1 }
  backers.forEach((p) => { presence[p.hq.state] = Math.max(presence[p.hq.state] || 0, 0.35) })
  const radar = {
    demand: { label: 'Demand', value: c.parts.demand }, japan: { label: 'Japan eco.', value: c.japan },
    logistics: { label: 'Logistics', value: c.logistics }, talent: { label: 'Talent', value: c.talent }, cost: { label: 'Cost', value: c.cost },
    support: { label: 'Partners', value: c.parts.support },
  }
  const ind = industryLabel(answers.industry).toLowerCase()
  const eligible = backers.filter((b) => b.eligible)

  return (
    <>
      <Head eyebrow={`Region · rank ${rank} of ${result.clusters.length}`} title={c.name} onClose={onClose} tabs={['Analysis', 'Partners']} tab={tab} setTab={setTab}>
        <span className="tag">{STATE_NAMES[c.state]}</span>
      </Head>
      <div className="panel-body">
        {tab === 'Analysis' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="kpis">
              <ScoreRing value={c.score} label="Region fit" />
              <Radar data={radar} size={240} />
            </div>
            <div className="ai">
              <span className="ai-tag">✿ AI analyst summary</span>
              <p>{c.name} ranks #{rank} for {ind}. {c.note} {eligible.length
                ? `${eligible.length} partner${eligible.length > 1 ? 's' : ''} here pass${eligible.length > 1 ? '' : 'es'} every essential check under model ${result.model}.`
                : `No partner here passes every essential check under model ${result.model} — treat it as a second-wave region.`}</p>
              {c.japanSource ? (
                <div className="src">
                  Japan ecosystem {c.japan}/100 = {c.japanSource.companies} Japanese companies in {c.japanSource.states.map((s) => STATE_NAMES[s]).join(' + ')}
                  {' '}(of {JP_PRESENCE.totalCompanies.toLocaleString()} in India) · <a href={JP_PRESENCE.url} target="_blank" rel="noreferrer">{JP_PRESENCE.source}</a>
                  {!c.japanSource.checked && ' · figure pending check against the PDF'}. Other indices are illustrative.
                </div>
              ) : (
                <div className="src">No sourced company count for this state yet — the Japan index here is illustrative.</div>
              )}
            </div>
            <div className="map-wrap" style={{ marginTop: 22 }}>
              <IndiaMap presence={presence} clusters={CLUSTERS} highlightClusters={[c.id]} animateKey={c.id} height={380} />
            </div>
          </motion.div>
        )}
        {tab === 'Partners' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {backers.length === 0 && <p className="muted">No partners in the dataset cover this cluster yet.</p>}
            {backers.map((p) => (
              <div className="check" key={p.id}>
                <span className={`pip ${p.eligible ? 'pass' : 'fail'}`} style={{ marginTop: 5 }} />
                <div><b>{p.name}</b> <span className="muted small">· {p.type} · fit {p.score}</span>
                  <p>{p.eligible ? 'Passes all essential checks.' : p.checks.filter((x) => x.status === 'fail').map((x) => x.detail).join(' ')}</p></div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  )
}

