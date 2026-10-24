import { useState } from 'react'
import { LayoutGroup, motion } from 'framer-motion'
import IndiaMap from '../components/IndiaMap.jsx'
import Market from '../components/Market.jsx'
import { CLUSTERS, DATASET_NOTE } from '../data/catalog.js'
import { industryLabel, MODEL_COPY } from '../lib/engine.js'
import { useI18n } from '../i18n.jsx'

const FILTERS = ['All', 'Distributor', 'Integrator', 'JV candidate', 'Service contractor']

export default function Options({ answers, set, result, open, selected, shortlist, toggleShortlist, go, view }) {
  const { t, lang } = useI18n()
  const [filter, setFilter] = useState('All')
  const [showOut, setShowOut] = useState(true)
  const { model, clusters, partners } = result
  const eligible = partners.filter((p) => p.eligible)
  const list = partners.filter((p) => (filter === 'All' || p.type === filter) && (showOut || p.eligible))
  const openChecks = eligible.slice(0, 3).reduce((n, p) => n + p.open.length, 0)
  const regionPresence = Object.fromEntries(clusters.slice(0, 3).map((c, i) => [c.state, 1 - i * 0.3]))

  // Flip the service model the way slide 4 does: same SME, different requirement.
  const flipModel = (m) => set(m === 'B' ? { localInstall: true, ownService: false } : { localInstall: false, ownService: true })

  return (
    <div className="page">
      <div className="results-head">
        <div>
          <div className="eyebrow">{view === 'market' ? t('Stage 1 · Understand the market') : t('Stage 2 · Find & verify partners')}</div>
          <h1 className="h2">{view === 'market' ? t('India market & regions') : t('Your entry options')} {lang === 'en' && <span className="jp" style={{ fontSize: '0.6em' }}>{view === 'market' ? '市場と地域' : '参入オプション'}</span>}</h1>
          <p className="muted" style={{ margin: 0 }}>{(answers.customIndustry?.trim() ? `${answers.customIndustry.trim()} (${t('data')}: ${t(industryLabel(answers.industry))})` : t(industryLabel(answers.industry)))} · {t(MODEL_COPY[model].route)}. {t('Click any region or partner for full analytics.')}</p>
        </div>
        <div>
          <div className="small muted" style={{ marginBottom: 6, letterSpacing: '.12em', textTransform: 'uppercase', fontSize: 13 }}>{t('What if… service model')}</div>
          <div className="toggle">
            <button className={model === 'A' ? 'on' : ''} onClick={() => flipModel('A')}>{t('A · Our team supports')}</button>
            <button className={model === 'B' ? 'on' : ''} onClick={() => flipModel('B')}>{t('B · Need local installation')}</button>
          </div>
        </div>
      </div>


      {view === 'market' ? <Market answers={answers} model={model} onContinue={() => go('partners')} /> : <>
      <div className="grid box summary-strip">
        <div className="cell stat"><span>{t('Top region')}</span><b>{t(clusters[0].name).split(/ – |・/)[0]}</b></div>
        <div className="cell stat"><span>{t('Partners passing checks')}</span><b>{eligible.length} / {partners.length}</b></div>
        <div className="cell stat"><span>{t('Lead partner fit')}</span><b>{eligible[0]?.score ?? '—'}</b></div>
        <div className="cell stat"><span>{t('Open checks (top 3)')}</span><b>{openChecks}</b></div>
      </div>

      <LayoutGroup>
        <div className="two">
          <div>
            <div className="box">
              <div className="list-head"><span className="h3">{t('Regions')}</span><span className="small muted">{t('Fit for {x}', { x: t(industryLabel(answers.industry)) })}</span></div>
              {clusters.map((c, i) => (
                <motion.button layout key={c.id} className={`row region-row ${selected === c.id ? 'on' : ''}`} onClick={() => open('region', c)}>
                  <span className="rank">{i + 1}</span>
                  <span><span className="name">{t(c.name)}</span><span className="meta">{t(c.backers.length === 1 ? '{n} eligible partner' : '{n} eligible partners', { n: c.backers.length })}</span></span>
                  <div className="bar sakura"><motion.i layout style={{ width: `${c.score}%` }} /></div>
                  <span className="score">{c.score}</span>
                </motion.button>
              ))}
            </div>
            <div className="map-wrap" style={{ marginTop: 20 }}>
              <IndiaMap presence={regionPresence} clusters={CLUSTERS} highlightClusters={clusters.slice(0, 3).map((c) => c.id)} animateKey={`top-${model}-${answers.industry}`} height={400} />
              <div className="map-legend"><span><i style={{ background: '#f3b4c4' }} />{t('Top-3 regions for this profile')}</span></div>
            </div>
          </div>

          <div className="box">
            <div className="list-head" style={{ flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}><span className="h3">{t('Partners')}</span>
                <button className="link small" onClick={() => go('analyze')}>{t('+ Analyze a new one with AI ✦')}</button></span>
              <div className="seg">
                {FILTERS.map((f) => <button key={f} className={filter === f ? 'on' : ''} onClick={() => setFilter(f)} style={{ padding: '5px 10px', fontSize: 14 }}>{t(f)}</button>)}
              </div>
            </div>
            <div className="section-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{t('Checks: industry · install · budget · conflict')}</span>
              <button className="link small" onClick={() => setShowOut(!showOut)}>{showOut ? t('Hide excluded') : t('Show excluded')}</button>
            </div>
            {list.map((p, i) => (
              <motion.div layout key={p.id} transition={{ type: 'spring', stiffness: 260, damping: 30 }} style={{ position: 'relative' }}>
                <button className={`row partner-row ${selected === p.id ? 'on' : ''} ${p.eligible ? '' : 'out'}`} onClick={() => open('partner', p)}>
                  <span className="rank">{p.eligible ? i + 1 : '–'}</span>
                  <span>
                    <span className="name">{p.name}</span>
                    <span className="meta">{p.aiExtracted && <span style={{ color: 'var(--sakura-deep)' }}>✦ {t('AI-extracted')} · </span>}{t(p.type)} · {p.hq.city}{!p.eligible && <span style={{ color: 'var(--shu)' }}> · {t(p.checks.find((c) => c.status === 'fail').short)} ✕</span>}</span>
                  </span>
                  <div className="bar hide-sm"><motion.i layout style={{ width: `${p.score}%`, background: p.eligible ? undefined : 'var(--shu)' }} /></div>
                  <span className="pips hide-sm">{p.checks.map((c) => <span key={c.id} className={`pip ${c.status}`} title={`${t(c.label)}: ${t(c.status)}`} />)}</span>
                  <span className="score">{p.score}</span>
                  <span />
                </button>
                <button className={`star ${shortlist.includes(p.id) ? 'on' : ''}`} onClick={() => toggleShortlist(p.id)}
                  aria-label={shortlist.includes(p.id) ? t('Remove from shortlist') : t('Add to shortlist')}
                  style={{ position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)' }}>✿</button>
              </motion.div>
            ))}
            <div className="section-label" style={{ borderTop: '1px solid var(--hair)', borderBottom: 0, textTransform: 'none', letterSpacing: 0 }}>
              ● {t('pass')} &nbsp; <span style={{ color: 'var(--shu)' }}>●</span> {t('fail')} &nbsp; ◌ {t('not required')} · ✿ {t('add to pilot shortlist')}
            </div>
          </div>
        </div>
      </LayoutGroup>
      </>}

      <div style={{ marginTop: 28, display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className="btn ghost" onClick={() => go('needs')}>{t('← Requirements')}</button>
        <span className="small muted" style={{ maxWidth: 460 }}>{view === 'partners' && t(DATASET_NOTE)}</span>
        {view === 'partners' && <button className="btn" onClick={() => go('plan')}>{t('Plan the first pilot →')}</button>}
      </div>
    </div>
  )
}
