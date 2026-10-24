import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import IndiaMap from './IndiaMap.jsx'
import { Radar, ScoreRing, StackedBar } from './Charts.jsx'
import { CLUSTERS, JP_PRESENCE } from '../data/catalog.js'
import { analyse, COST_DEFAULTS, costModel, industryLabel, MODEL_COPY } from '../lib/engine.js'
import { STATE_NAMES } from '../lib/geo.js'
import { useI18n } from '../i18n.jsx'

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
  const { t: tr } = useI18n()
  return (
    <div className="panel-head">
      <button className="x" onClick={onClose} aria-label={tr('Close panel')}>✕</button>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="panel-title">{title}</h2>
      {children}
      <div className="tabs" role="tablist">
        {tabs.map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} className={tab === t ? 'on' : ''} onClick={() => setTab(t)}>{tr(t)}</button>
        ))}
      </div>
    </div>
  )
}

function PartnerView({ p, answers, result, onClose, starred, onStar }) {
  const { t, tm, lang: uiLang } = useI18n()
  const [tab, setTab] = useState('Analysis')
  const [lang, setLang] = useState(uiLang)
  const [params, setParams] = useState(COST_DEFAULTS)
  const ai = useMemo(() => analyse(p, answers, result.clusters, result.partners), [p, answers, result])
  const cost = useMemo(() => costModel(p, answers, params), [p, answers, params])
  const radar = Object.fromEntries(Object.entries(p.sub).map(([k, v]) => [k, { label: t(SUB[k]), value: v }]))
  const clusters = CLUSTERS.filter((c) => p.clusters.includes(c.id))

  return (
    <>
      <Head eyebrow={`${t(p.type)} · ${p.hq.city}`} title={p.name} onClose={onClose} tabs={['Analysis', 'Regions', 'Costs', 'Evidence']} tab={tab} setTab={setTab}>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span className={`verdict ${ai.verdict}`}>{t(ai.verdictText)}</span>
          <span className="tag">{p.aiExtracted ? t('✦ AI-extracted {d} · unverified', { d: p.lastVerified }) : t('Verified {d}', { d: p.lastVerified })}</span>
          <button className={`tag ${starred ? 'sakura' : 'ink'}`} style={{ cursor: 'pointer' }} onClick={onStar}>
            {starred ? t('✿ Shortlisted') : t('+ Add to shortlist')}
          </button>
        </div>
      </Head>
      <div className="panel-body">
        {tab === 'Analysis' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="kpis">
              <ScoreRing value={p.score} tone={p.eligible ? '#111' : '#b8323f'} label={t('Fit score')} />
              <div>
                {Object.entries(p.sub).map(([k, v]) => (
                  <div className="subscore" key={k}>
                    <span>{t(SUB[k])}</span>
                    <div className="bar"><motion.i initial={{ width: 0 }} animate={{ width: `${v}%` }} transition={{ duration: 0.9 }} /></div>
                    <em>{Math.round(v)}</em>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai">
              <span className="ai-tag">✿ {t('AI analyst summary')}</span>
              <div className="lang">
                <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
                <button className={lang === 'ja' ? 'on' : ''} onClick={() => setLang('ja')}>日本語</button>
              </div>
              <p style={{ marginTop: 14, fontFamily: lang === 'ja' ? 'var(--jp)' : undefined, fontSize: lang === 'ja' ? 15 : undefined }}>
                {lang === 'en' ? ai.summary : ai.ja.summary}
              </p>
              <h5>{t('Why it fits')}</h5>
              <ul>{ai.strengths.map((m, i) => <li key={i}>{tm(m)}</li>)}</ul>
              <h5>{t('Watch-outs')}</h5>
              <ul>{ai.risks.map((m, i) => <li key={i}>{tm(m)}</li>)}</ul>
              <h5>{t('Negotiation angle')}</h5>
              <ul><li>{tm(ai.negotiation)}</li></ul>
              <div className="src">{t('Generated from the evidence tab · every claim traces to a dated source.')}</div>
            </div>

            <h3 className="h3" style={{ marginTop: 28 }}>{t('Essential checks · model {m}', { m: result.model })}</h3>
            <div className="checks">
              {p.checks.map((c) => (
                <div className="check" key={c.id}>
                  <span className={`pip ${c.status}`} style={{ marginTop: 5 }} />
                  <div><b>{t(c.label)}</b> <span className="muted small">· {c.status === 'na' ? t('not required') : t(c.status)}</span><p>{tm(c.detailT)}</p></div>
                </div>
              ))}
            </div>

            <h3 className="h3" style={{ marginTop: 28 }}>{t('Capability profile')}</h3>
            <div style={{ display: 'grid', placeItems: 'center', marginTop: 8 }}><Radar data={radar} size={260} /></div>
          </motion.div>
        )}

        {tab === 'Regions' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="map-wrap">
              <IndiaMap presence={p.presence} hq={p.hq} clusters={CLUSTERS} highlightClusters={p.clusters} animateKey={p.id} height={460} />
              <div className="map-legend">
                <span><i style={{ background: '#f3b4c4' }} />{t('Sakura density = regional presence')}</span>
                <span><i style={{ background: '#b8323f', transform: 'rotate(45deg) scale(.8)' }} />{t('Headquarters')}</span>
                <span><i style={{ border: '1px solid #111', borderRadius: '50%' }} />{t('Industrial cluster')}</span>
              </div>
            </div>
            <h3 className="h3" style={{ marginTop: 22 }}>{t('Coverage by state')}</h3>
            <div style={{ marginTop: 8 }}>
              {Object.entries(p.presence).sort((a, b) => b[1] - a[1]).map(([s, v]) => (
                <div className="subscore" key={s}>
                  <span>{t(STATE_NAMES[s])}</span>
                  <div className="bar sakura"><motion.i initial={{ width: 0 }} animate={{ width: `${v * 100}%` }} /></div>
                  <em>{Math.round(v * 100)}</em>
                </div>
              ))}
            </div>
            <h3 className="h3" style={{ marginTop: 22 }}>{t('Clusters served')}</h3>
            {clusters.map((c) => {
              const rank = result.clusters.findIndex((x) => x.id === c.id) + 1
              return (
                <div className="check" key={c.id}>
                  <span className="num">#{rank}</span>
                  <div><b>{t(c.name)}</b> <span className="muted small">· {t('region rank {r} of {n}', { r: rank, n: result.clusters.length })}</span><p>{t(c.note)}</p></div>
                </div>
              )
            })}
          </motion.div>
        )}

        {tab === 'Costs' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="muted small" style={{ marginTop: 0 }}>
              {t('Editable 12-month pilot scenario for {ind} under model {m} ({title}). Values in ₹ lakh.', { ind: industryLabel(answers.industry), m: cost.model, title: MODEL_COPY[cost.model].title })}
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
                <span>{t(label)}</span>
                <input type="range" min={min} max={max} step={step} value={params[k]} aria-label={t(label)}
                  onChange={(e) => setParams({ ...params, [k]: +e.target.value })} />
                <output>{fmt(params[k])}</output>
              </div>
            ))}
            <hr className="hair" />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
              <div className="stat"><span>{t('Required list price / unit')}</span><b>₹{cost.priceUnit.toFixed(1)}L</b></div>
              <div className="stat" style={{ textAlign: 'right' }}><span>{t('Pilot revenue')}</span><b>₹{cost.revenue.toFixed(0)}L</b></div>
            </div>
            <div style={{ marginTop: 18 }}><StackedBar parts={cost.parts.map((x) => ({ ...x, label: t(x.label) }))} /></div>
            <p className="small muted" style={{ marginTop: 18 }}>
              {cost.trips > 0
                ? t('Includes {n} engineer trips from Japan because {why}.', { n: cost.trips.toFixed(0), why: p.install ? 'your own team handles support' : 'this partner cannot install' })
                : t('No engineer travel: {p} installs locally for a {f}% service fee.', { p: p.name, f: p.serviceFeePct })}
              {' '}{t('Duty and tax rates are placeholders — confirm classification with a customs broker (expert-reviewed step).')}
            </p>
          </motion.div>
        )}

        {tab === 'Evidence' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="muted small" style={{ marginTop: 0 }}>{t('How each recommendation is built: source text → extracted fact → the check it feeds.')}</p>
            {p.evidence.map((e, i) => (
              <div key={i}>
                <div className="chain">
                  <div><small>{t(e.source)} · {e.date}</small><q>{e.quote}</q></div>
                  <span>→</span>
                  <div><small>{t('Extracted fact')}</small>{e.fact}</div>
                  <span>→</span>
                  <div style={{ background: e.status === 'verified' ? '#fff' : 'var(--sakura-soft)' }}>
                    <small>{t('Feeds check')}</small>{t(CHECK_NAME[e.check] || e.check)}<div className="src">{t(STATUS[e.status])}</div>
                  </div>
                </div>
              </div>
            ))}
            <h3 className="h3" style={{ marginTop: 24 }}>{t('References')}</h3>
            {p.references.map((r) => (
              <div className="check" key={r.label}>
                <span className={`pip ${r.status === 'verified' ? 'pass' : r.status === 'claimed' ? 'warn' : 'na'}`} style={{ marginTop: 5 }} />
                <div><b>{r.label}</b><p>{t(STATUS[r.status])}</p></div>
              </div>
            ))}
            <h3 className="h3" style={{ marginTop: 24 }}>{t('To verify before the pilot')}</h3>
            <ul style={{ fontSize: 15.5, paddingLeft: 18 }}>{ai.verify.map((m, i) => <li key={i}>{tm(m)}</li>)}</ul>
          </motion.div>
        )}
      </div>
    </>
  )
}

function RegionView({ c, answers, result, onClose }) {
  const { t, tm } = useI18n()
  const [tab, setTab] = useState('Analysis')
  const rank = result.clusters.findIndex((x) => x.id === c.id) + 1
  const backers = result.partners.filter((p) => p.clusters.includes(c.id))
  const presence = { [c.state]: 1 }
  backers.forEach((p) => { presence[p.hq.state] = Math.max(presence[p.hq.state] || 0, 0.35) })
  const radar = {
    demand: { label: t('Demand'), value: c.parts.demand }, japan: { label: t('Japan eco.'), value: c.japan },
    logistics: { label: t('Logistics'), value: c.logistics }, talent: { label: t('Talent'), value: c.talent }, cost: { label: t('Cost'), value: c.cost },
    support: { label: t('Partners'), value: c.parts.support },
  }
  const ind = industryLabel(answers.industry)
  const eligible = backers.filter((b) => b.eligible)

  return (
    <>
      <Head eyebrow={t('Region · rank {r} of {n}', { r: rank, n: result.clusters.length })} title={t(c.name)} onClose={onClose} tabs={['Analysis', 'Partners']} tab={tab} setTab={setTab}>
        <span className="tag">{t(STATE_NAMES[c.state])}</span>
      </Head>
      <div className="panel-body">
        {tab === 'Analysis' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="kpis">
              <ScoreRing value={c.score} label={t('Region fit')} />
              <Radar data={radar} size={240} />
            </div>
            <div className="ai">
              <span className="ai-tag">✿ {t('AI analyst summary')}</span>
              <p>{t('{c} ranks #{r} for {ind}.', { c: c.name, r: rank, ind })} {t(c.note)} {eligible.length
                ? t(eligible.length > 1 ? '{n} partners here pass every essential check under model {m}.' : '{n} partner here passes every essential check under model {m}.', { n: eligible.length, m: result.model })
                : t('No partner here passes every essential check under model {m} — treat it as a second-wave region.', { m: result.model })}</p>
              {c.japanSource ? (
                <div className="src">
                  {t('Japan ecosystem {v}/100 = {n} Japanese companies in {s} (of {total} in India)', { v: c.japan, n: c.japanSource.companies, s: c.japanSource.states.map((x) => t(STATE_NAMES[x])).join(' + '), total: JP_PRESENCE.totalCompanies.toLocaleString() })}
                  {' '}· <a href={JP_PRESENCE.url} target="_blank" rel="noreferrer">{t(JP_PRESENCE.source)}</a>
                  {!c.japanSource.checked && ` · ${t('figure pending check against the PDF')}`}. {t('Other indices are illustrative.')}
                </div>
              ) : (
                <div className="src">{t('No sourced company count for this state yet — the Japan index here is illustrative.')}</div>
              )}
            </div>
            <div className="map-wrap" style={{ marginTop: 22 }}>
              <IndiaMap presence={presence} clusters={CLUSTERS} highlightClusters={[c.id]} animateKey={c.id} height={380} />
            </div>
          </motion.div>
        )}
        {tab === 'Partners' && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            {backers.length === 0 && <p className="muted">{t('No partners in the dataset cover this cluster yet.')}</p>}
            {backers.map((p) => (
              <div className="check" key={p.id}>
                <span className={`pip ${p.eligible ? 'pass' : 'fail'}`} style={{ marginTop: 5 }} />
                <div><b>{p.name}</b> <span className="muted small">· {t(p.type)} · {t("fit {n}", { n: p.score })}</span>
                  <p>{p.eligible ? t('Passes all essential checks.') : p.checks.filter((x) => x.status === 'fail').map((x) => tm(x.detailT)).join(' ')}</p></div>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </>
  )
}

