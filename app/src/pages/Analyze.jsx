import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SAMPLES } from '../data/samples.js'
import { extractBrochure, findQuote, toPartner } from '../lib/ai.js'
import { evaluate, MODEL_COPY } from '../lib/engine.js'
import { STATE_NAMES } from '../lib/geo.js'
import { useI18n } from '../i18n.jsx'
import { GoogleButton, useAuth } from '../auth.jsx'

const STEPS = ['Reading the brochure', 'Extracting capability facts', 'Linking each fact to its sentence', 'Scoring against your requirements']
const CHECK_NAME = { industry: 'Customer access', install: 'Installation', budget: 'Budget', conflict: 'Conflicts', technical: 'Technical', speed: 'Speed', japan: 'Japan exp.' }

// Source text with every quoted span highlighted; hovering a fact lights up its sentence.
function Highlighted({ text, facts, active, setActive }) {
  const spans = facts
    .map((f, i) => ({ i, at: findQuote(text, f.quote) }))
    .filter((s) => s.at)
    .sort((a, b) => a.at[0] - b.at[0])
  const parts = []
  let pos = 0
  for (const s of spans) {
    if (s.at[0] < pos) continue
    parts.push(text.slice(pos, s.at[0]))
    parts.push(
      <mark key={s.i} className={active === s.i ? 'on' : ''} onMouseEnter={() => setActive(s.i)} onMouseLeave={() => setActive(null)}>
        {text.slice(s.at[0], s.at[1])}<sup>{s.i + 1}</sup>
      </mark>,
    )
    pos = s.at[1]
  }
  parts.push(text.slice(pos))
  return <div className="source">{parts}</div>
}

export default function Analyze({ answers, customPartners, addPartner, open, go }) {
  const { t, tm, lang } = useI18n()
  const auth = useAuth()
  const [text, setText] = useState(SAMPLES[0].text)
  const [state, setState] = useState('idle') // idle | running | done | error
  const [step, setStep] = useState(0)
  const [out, setOut] = useState(null)
  const [error, setError] = useState('')
  const [active, setActive] = useState(null)

  useEffect(() => {
    if (state !== 'running') return
    const t = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 1400)
    return () => clearInterval(t)
  }, [state])

  const run = async () => {
    setStep(0)
    setState('running')
    setError('')
    setOut(null)
    const started = Date.now()
    try {
      const res = await extractBrochure(text)
      // Keep the cached path from flashing past: let the steps read for a moment.
      const wait = Math.max(0, 2600 - (Date.now() - started))
      await new Promise((r) => setTimeout(r, res.source === 'cached' ? wait : 0))
      setOut({ ...res, partner: toPartner(res.data, text), text })
      setState('done')
    } catch (e) {
      setError(e.message)
      setState('error')
    }
  }

  const scored = useMemo(() => {
    if (!out) return null
    const others = customPartners.filter((p) => p.id !== out.partner.id)
    const r = evaluate(answers, [...others, out.partner])
    const i = r.partners.findIndex((p) => p.id === out.partner.id)
    return { p: r.partners[i], rank: i + 1, total: r.partners.length, model: r.model }
  }, [out, answers, customPartners])

  const added = out && customPartners.some((p) => p.id === out.partner.id)
  const facts = out?.data.facts || []
  const found = facts.filter((f) => findQuote(out.text, f.quote)).length

  return (
    <div className="page">
      <div className="eyebrow">{t('AI partner analysis')}</div>
      <h1 className="h2">{t('Analyze a new partner')}</h1>
      <p className="muted" style={{ maxWidth: 760 }}>
        {t("Paste a distributor or integrator brochure. Claude extracts the facts that matter, quotes the sentence behind each one, and TsunaGo scores the company against your requirements. Quotes that can't be found word-for-word in the source are flagged.")}
      </p>

      <div className="analyze">
        <div className="box">
          <div className="list-head">
            <span className="h3">{t('Source')}</span>
            <div className="seg">
              {SAMPLES.map((s) => (
                <button key={s.id} className={text === s.text ? 'on' : ''} style={{ padding: '5px 10px', fontSize: 14 }}
                  onClick={() => { setText(s.text); setState('idle'); setOut(null) }}>{t(s.label)}</button>
              ))}
              <button style={{ padding: '5px 10px', fontSize: 14 }} onClick={() => { setText(''); setState('idle'); setOut(null) }}>{t('Paste your own')}</button>
            </div>
          </div>
          {state === 'done' ? (
            <Highlighted text={out.text} facts={facts} active={active} setActive={setActive} />
          ) : (
            <textarea className="source" value={text} onChange={(e) => setText(e.target.value)} disabled={state === 'running'}
              placeholder={t('Paste brochure or website text here…')} aria-label={t('Brochure text')} />
          )}
          <div className="list-foot">
            <span className="small muted">{t('{n} characters · sample companies are fictional', { n: text.length.toLocaleString() })}</span>
            {state === 'done'
              ? <button className="btn ghost" onClick={() => setState('idle')}>{t('Edit text')}</button>
              : <button className="btn" onClick={run} disabled={state === 'running' || text.trim().length < 40}>
                  {state === 'running' ? t('Analyzing…') : t('Analyze with AI ✦')}
                </button>}
          </div>
        </div>

        <div className="box">
          <AnimatePresence mode="wait">
            {state === 'idle' && (
              <motion.div key="idle" className="cell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <span className="h3">{t("What you'll get")}</span>
                <ul className="plain">
                  <li>{t('A structured partner profile: type, regions, engineers, installation ability, terms')}</li>
                  <li>{t('Each fact linked to the exact sentence it came from')}</li>
                  <li>{t('Essential checks and a fit score for your service model')}</li>
                  <li>{t("A list of what the brochure doesn't say, so it can be checked before the pilot")}</li>
                </ul>
              </motion.div>
            )}
            {state === 'running' && (
              <motion.div key="run" className="cell" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                {STEPS.map((s, i) => (
                  <div key={s} className={`step ${i < step ? 'done' : i === step ? 'now' : ''}`}>
                    <span className="step-dot">{i < step ? '✓' : i === step ? <span className="spin">✿</span> : ''}</span>{t(s)}
                  </div>
                ))}
              </motion.div>
            )}
            {state === 'error' && (
              <motion.div key="err" className="cell" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span className="h3" style={{ color: 'var(--shu)' }}>{t("Couldn't analyze this text")}</span>
                <p>{error}</p>
                <p className="small muted">{t('The two sample brochures always work, even offline. For your own text, the server needs a model key such as the free GROQ_API_KEY (see README).')}</p>
                {auth.enabled && !auth.user && <div style={{ marginTop: 12 }}><GoogleButton lang={lang} /></div>}
              </motion.div>
            )}
            {state === 'done' && scored && (
              <motion.div key="done" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <div className="cell" style={{ borderBottom: '1px solid var(--ink)' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                    <span className={`tag ${out.source === 'live' ? 'ink' : ''}`}>
                      {out.source === 'live' ? `${t('Live')} · ${out.model} · ${(out.ms / 1000).toFixed(1)}s` : t('Offline demo cache')}
                    </span>
                    <span className="tag sakura">{t('{a}/{b} quotes found in source', { a: found, b: facts.length })}</span>
                  </div>
                  <h2 className="panel-title" style={{ margin: '4px 0' }}>{out.partner.name}</h2>
                  <div className="muted">{t(out.partner.type)} · {out.partner.hq.city} · {Object.keys(out.partner.presence).map((s) => t(STATE_NAMES[s])).join(', ')}</div>
                  <div className="ai-score">
                    <div className="stat"><span>{t('Fit score')}</span><b style={{ color: scored.p.eligible ? undefined : 'var(--shu)' }}>{scored.p.score}</b></div>
                    <div className="stat"><span>{t('Rank')}</span><b>{scored.rank} / {scored.total}</b></div>
                    <div className="stat"><span>{t('Model {m}', { m: scored.model })}</span><b style={{ fontSize: 18, lineHeight: 1.3, paddingTop: 8 }}>{scored.p.eligible ? t('Passes all checks') : t('Excluded')}</b></div>
                  </div>
                  <div className="checks">
                    {scored.p.checks.map((c) => (
                      <div className="check" key={c.id}>
                        <span className={`pip ${c.status}`} style={{ marginTop: 6 }} />
                        <div><b>{t(c.label)}</b><p>{tm(c.detailT)}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="cell" style={{ borderBottom: '1px solid var(--hair)' }}>
                  <span className="h3">{t('Extracted facts')}</span>
                  {facts.map((f, i) => {
                    const ok = !!findQuote(out.text, f.quote)
                    return (
                      <div key={i} className={`fact ${active === i ? 'on' : ''}`} onMouseEnter={() => setActive(i)} onMouseLeave={() => setActive(null)}>
                        <span className="num">{i + 1}</span>
                        <div>
                          <b>{lang === 'ja' && f.fact_ja ? f.fact_ja : f.fact}</b> <span className="muted small">→ {t(CHECK_NAME[f.check])}</span>
                          <p className={ok ? '' : 'bad'}>{ok ? t('✓ quote found in source') : t('⚠ quote not found verbatim — treat as unverified')}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="cell">
                  <span className="h3">{t('Not stated · verify before the pilot')}</span>
                  <ul className="plain">{(lang === 'ja' && out.data.unknowns_ja?.length ? out.data.unknowns_ja : out.data.unknowns).map((u) => <li key={u}>{u}</li>)}</ul>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
                    <button className="btn" disabled={added} onClick={() => addPartner(out.partner)}>{added ? t('✓ Added to partner list') : t('Add to partner list')}</button>
                    {added && <button className="btn ghost" onClick={() => open('partner', out.partner)}>{t('Open full analysis')}</button>}
                    {added && answers.profile && <button className="link" onClick={() => go('partners')}>{t('See it ranked in Options →')}</button>}
                  </div>
                  <p className="small muted" style={{ marginTop: 10 }}>{t('Scored for: {m}. Change your requirements and the score updates.', { m: MODEL_COPY[scored.model].title })}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
