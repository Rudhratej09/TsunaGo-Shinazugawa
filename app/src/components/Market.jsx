import { useState } from 'react'
import { motion } from 'framer-motion'
import IndiaMap from './IndiaMap.jsx'
import { CHECKED_ON, marketFor } from '../data/market.js'
import { JP_PRESENCE } from '../data/catalog.js'
import { STATE_NAMES } from '../lib/geo.js'
import { industryLabel } from '../lib/engine.js'
import { useI18n } from '../i18n.jsx'

const FACTORS = [
  ['buyers', 'Relevant buyer base'],
  ['japan', 'Japanese business ecosystem'],
  ['demand', 'Demand for your product'],
  ['service', 'Service practicality'],
]

function Rating({ r, lang, onOpen, open }) {
  const { t } = useI18n()
  return (
    <button className={`rating r-${r.rating.replace(/\s/g, '-').toLowerCase()} ${open ? 'on' : ''}`} onClick={onOpen} title={r.why[lang]}>
      {t(r.rating)}
    </button>
  )
}

export default function Market({ answers, model, onContinue }) {
  const { t, lang } = useI18n()
  const m = marketFor(answers.industry, { needsService: model === 'B' })
  const [cell, setCell] = useState(null)
  const [srcOpen, setSrcOpen] = useState(false)
  const [mapState, setMapState] = useState(null)
  const pick = (state, key) => {
    setMapState(state)
    setCell(cell && cell.state === state && cell.key === key ? null : { state, key })
  }
  const focusState = (id) => {
    setCell(null)
    setMapState(mapState === id ? null : id)
  }
  const focusRow = mapState && m.rows.find((r) => r.state === mapState)
  const detail = cell && m.rows.find((r) => r.state === cell.state)[cell.key]
  const names = m.suggested.map((s) => t(STATE_NAMES[s]))
  const presence = Object.fromEntries(m.rows.map((r) => [r.state, m.suggested.includes(r.state) ? 1 : 0.45]))
  const sector = (answers.customIndustry?.trim() ? `${answers.customIndustry.trim()} (${t('data')}: ${t(industryLabel(answers.industry))})` : t(industryLabel(answers.industry)))

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div className="market">
        <div className="box">
          <div className="list-head"><span className="h3">{t('India market')}</span><span className="small muted">{sector}</span></div>
          <div className="cell">
            <p style={{ marginTop: 0 }}>{m.overview[lang]}</p>
            <div className="mini">{t('Demand signals')}</div>
            <ul className="evidence">
              {m.signals.map((s, i) => <li key={i}>{s[lang]} <a href={s.src.url} target="_blank" rel="noreferrer" className="src">{s.src.date}</a></li>)}
            </ul>
            <div className="mini">{t('Main barriers')}</div>
            <ul className="evidence">{m.barriers.map((b, i) => <li key={i}>{b[lang]}</li>)}</ul>
          </div>
        </div>

        <div className="box">
          <div className="list-head"><span className="h3">{t('Target customer')}</span><span className="tag">{t('hypothesis · validate')}</span></div>
          <div className="cell">
            {answers.product && <p style={{ marginTop: 0 }}><span className="mini">{t('Your product')}</span><br />{answers.product}</p>}
            <p style={{ marginTop: 0 }}><span className="mini">{t('Who buys')}</span><br /><b style={{ fontWeight: 500 }}>{m.buyer.who[lang]}</b></p>
            <p><span className="mini">{t('Who decides')}</span><br />{m.buyer.roles[lang]}</p>
            <p style={{ marginBottom: 0 }}><span className="mini">{t('Partner they need')}</span><br />
              {model === 'B'
                ? t('An integrator or service contractor with engineers in {s} who can install and maintain your product for these buyers.', { s: names.join(' · ') })
                : t('A distributor with sales reach into these buyers in {s}; your own team handles technical support.', { s: names.join(' · ') })}
            </p>
          </div>
        </div>
      </div>

      <div className="two" style={{ marginTop: 20 }}>
        <div className="box">
          <div className="list-head">
            <span className="h3">{t('Regional comparison')}</span>
            <button className="link small" onClick={() => setSrcOpen(!srcOpen)}>{srcOpen ? t('Hide sources') : t('View sources')}</button>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="compare-states">
              <thead><tr><th />{m.rows.map((r) => <th key={r.state} className={`${m.suggested.includes(r.state) ? 'pick' : ''} ${mapState === r.state ? 'sel' : ''}`}><button className="th-btn" onClick={() => focusState(r.state)}>{t(STATE_NAMES[r.state])}</button></th>)}</tr></thead>
              <tbody>
                {FACTORS.map(([key, label]) => (
                  <tr key={key}>
                    <th>{t(label)}</th>
                    {m.rows.map((r) => <td key={r.state}><Rating r={r[key]} lang={lang} open={cell?.state === r.state && cell?.key === key} onOpen={() => pick(r.state, key)} /></td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="cell why-box">
            {detail ? (
              <>
                <div className="mini">{t(STATE_NAMES[cell.state])} · {t(FACTORS.find((f) => f[0] === cell.key)[1])}</div>
                <p style={{ margin: '4px 0' }}>{detail.why[lang]}</p>
                {detail.src && <a className="small" href={detail.src.url} target="_blank" rel="noreferrer">{detail.src.title} · {detail.src.date}</a>}
              </>
            ) : <span className="small muted">{t('Click any rating to see why, with its source and date.')}</span>}
          </div>
          {srcOpen && (
            <div className="cell">
              <ul className="evidence small">
                {[...new Map(m.rows.flatMap((r) => [r.buyers.src, r.japan.src]).concat(m.signals.map((s) => s.src)).filter(Boolean).map((s) => [s.url, s])).values()].map((s) => (
                  <li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a> · {s.date}</li>
                ))}
              </ul>
              <p className="small muted" style={{ marginBottom: 0 }}>{t('Sources checked on {d}. "Unknown" means we found no source — it is never filled with a guess.', { d: CHECKED_ON })}</p>
            </div>
          )}
        </div>

        <div className="map-wrap">
          <IndiaMap presence={presence} animateKey={`mkt-${answers.industry}`} height={380} onStateClick={focusState} selected={mapState} />
          <div className="map-legend"><span><i style={{ background: '#f3b4c4' }} />{t('Compared states · darker = suggested')}</span><span className="small muted">{t('Click any state')}</span></div>
          {mapState && (
            <motion.div className="cell state-card" key={mapState} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span className="h3">{t(STATE_NAMES[mapState])}</span>
                <button className="link small" onClick={() => setMapState(null)} aria-label={t('Close')}>✕</button>
              </div>
              {focusRow ? (
                <>
                  {m.suggested.includes(mapState) && <div className="tag sakura" style={{ marginTop: 6 }}>{t('Suggested market')}</div>}
                  <dl className="state-facts">
                    {FACTORS.map(([key, label]) => (
                      <div key={key}><dt>{t(label)} <span className={`rating r-${focusRow[key].rating.replace(/\s/g, '-').toLowerCase()}`}>{t(focusRow[key].rating)}</span></dt>
                        <dd>{focusRow[key].why[lang]}{focusRow[key].src && <> <a href={focusRow[key].src.url} target="_blank" rel="noreferrer" className="src">{focusRow[key].src.date}</a></>}</dd></div>
                    ))}
                  </dl>
                </>
              ) : (
                <>
                  <p className="small" style={{ margin: '8px 0' }}>{t('Not in this comparison: we have no sourced figures for this sector in this state yet, so it stays Unknown rather than guessed.')}</p>
                  {JP_PRESENCE.states[mapState] && <p className="small" style={{ margin: 0 }}>{t('Japanese companies listed here: {n}', { n: JP_PRESENCE.states[mapState].companies })} · <a href={JP_PRESENCE.url} target="_blank" rel="noreferrer">{t('source')}</a></p>}
                </>
              )}
            </motion.div>
          )}
        </div>
      </div>

      <div className="box suggest">
        <div className="cell" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="mini">{t('Suggested markets to investigate')}</div>
            <div className="h3" style={{ marginTop: 4 }}>{names.join(' · ')}</div>
            <div className="small muted">{t('Ranked on buyer base first, then Japanese ecosystem. Product demand stays Unknown until you talk to buyers.')}</div>
          </div>
          <button className="btn" onClick={onContinue}>{t('Continue to partner options →')}</button>
        </div>
      </div>
    </motion.div>
  )
}
