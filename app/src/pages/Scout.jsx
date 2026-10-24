import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import IndiaMap from '../components/IndiaMap.jsx'
import { CLUSTERS } from '../data/catalog.js'
import { CITY_COORDS } from '../data/samples.js'
import { SCOUT_DEMO } from '../data/scoutDemo.js'
import { evaluate } from '../lib/engine.js'
import { draftFor, liveSource, replaySource, runScout, scoutStatus } from '../lib/scout.js'
import { useI18n } from '../i18n.jsx'
import { GoogleButton, useAuth } from '../auth.jsx'

const GOALS = [
  'We make coordinate measuring machines (CMM) for automotive parts plants. We cannot install or service them ourselves in India, our budget is limited, and we want a paying pilot customer within six months.',
  '当社は電子部品の外観検査装置メーカーです。インドに拠点はなく、据付と保守を任せられる現地パートナーを1年以内に見つけたいです。',
]

const digits = (s) => String(s || '').replace(/\D/g, '')
// wa.me needs the full international number; Indian numbers written locally get +91.
const waNumber = (phone) => {
  const d = digits(phone).replace(/^0+/, '')
  return d.length === 10 ? '91' + d : d
}

function Step({ item, t, lang }) {
  const icon = item.status === 'run' ? <span className="spin">✿</span> : item.status === 'error' ? '!' : item.status === 'skip' ? '–' : '✓'
  return (
    <motion.div className={`tl ${item.status}`} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}>
      <span className="tl-dot">{icon}</span>
      <div>
        {item.kind === 'plan' && (
          <>
            <b>{item.round === 2 ? t('Planning a second search round') : t('Understanding your goal')}</b>
            {item.plan && <p>{lang === 'ja' ? item.plan.reasoning_ja : item.plan.reasoning}</p>}
          </>
        )}
        {item.kind === 'search' && (
          <>
            <b>{t('Searching the web')}</b>
            <div className="chips">{(item.queries || []).map((q) => <span key={q} className="tag">{q}</span>)}</div>
            {item.status === 'done' && (
              <p>{t('{n} company websites to read', { n: item.candidates.length })}
                {item.skipped?.length > 0 && <> · <span className="muted">{t('skipped {n} directory listings (IndiaMART, Justdial…) by policy', { n: item.skipped.length })}</span></>}
              </p>
            )}
          </>
        )}
        {item.kind === 'read' && (
          <>
            <b>{item.status === 'run' ? t('Reading {d}', { d: item.candidate.domain }) : item.candidate.domain}</b>
            {item.status === 'done' && <p>✓ {item.partner.name} · {t(item.partner.type)} · {t('{a}/{b} quotes found on the site', { a: item.partner.quotesFound, b: item.partner.quotesTotal })}</p>}
            {(item.status === 'skip' || item.status === 'error') && <p className="muted">{item.reason}</p>}
          </>
        )}
        {item.kind === 'score' && <><b>{t('Scoring with the TsunaGo engine')}</b><p>{t('{e} of {n} candidates pass every essential check', { e: item.eligible, n: item.total })}</p></>}
        {item.kind === 'reflect' && <><b>{t('Not enough strong matches — searching again')}</b><p className="muted">{item.feedback}</p></>}
        {item.kind === 'draft' && (
          <>
            <b>{t('Drafting a bilingual introduction')}</b>
            {item.status === 'done' && <p>{t('Ready for {p}', { p: item.partner.name })}</p>}
            {item.status === 'error' && <p className="muted">{item.reason}</p>}
          </>
        )}
      </div>
    </motion.div>
  )
}

function DraftModal({ partner, draft, onClose, t, lang }) {
  const [l, setLState] = useState(lang)
  const [subject, setSubject] = useState(lang === 'ja' ? draft.subject_ja : draft.subject_en)
  const [body, setBody] = useState(lang === 'ja' ? draft.body_ja : draft.body_en)
  const [copied, setCopied] = useState(false)
  const setL = (next) => {
    setLState(next)
    setSubject(next === 'ja' ? draft.subject_ja : draft.subject_en)
    setBody(next === 'ja' ? draft.body_ja : draft.body_en)
  }
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  const c = partner.contact || {}
  const mail = c.email ? `mailto:${c.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : null
  const wa = c.phone ? `https://wa.me/${waNumber(c.phone)}?text=${encodeURIComponent(`${subject}\n\n${body}`)}` : null
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${subject}\n\n${body}`)
      setCopied(true)
    } catch {
      setCopied(false)
    }
  }
  return (
    <>
      <motion.div className="scrim" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <div className="modal-wrap">
      <motion.div className="modal" role="dialog" aria-modal="true" aria-label={t('Message to {p}', { p: partner.name })}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}>
        <div className="list-head">
          <span className="h3">{t('Message to {p}', { p: partner.name })}</span>
          <div className="lang-switch" style={{ marginLeft: 'auto' }}>
            <button className={l === 'en' ? 'on' : ''} onClick={() => setL('en')}>EN</button>
            <button className={l === 'ja' ? 'on' : ''} onClick={() => setL('ja')}>日本語</button>
          </div>
          <button className="x-small" onClick={onClose} aria-label={t('Close panel')}>✕</button>
        </div>
        <div className="cell">
          <label className="mini">{t('Subject')}</label>
          <input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} />
          <label className="mini" style={{ marginTop: 12 }}>{t('Message')}</label>
          <textarea className="input" rows={12} value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="contact-line">
            {c.email && <span>✉ {c.email} <em>{t('verified on their site')}</em></span>}
            {c.phone && <span>☏ {c.phone} <em>{t('verified on their site')}</em></span>}
            {!c.email && !c.phone && <span className="muted">{t('No contact details were found on the site — use their contact page.')}</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
            {mail && <a className="btn" href={mail}>{t('Open in email')}</a>}
            {wa && <a className="btn ghost" href={wa} target="_blank" rel="noreferrer">{t('WhatsApp')}</a>}
            {c.contact_url && <a className="btn ghost" href={c.contact_url} target="_blank" rel="noreferrer">{t('Contact page')}</a>}
            <button className="btn ghost" onClick={copy}>{copied ? t('✓ Copied') : t('Copy')}</button>
          </div>
          <p className="small muted" style={{ marginBottom: 0 }}>{t('Nothing is sent automatically. You review, edit and send it yourself, using only contacts the company publishes.')}</p>
        </div>
      </motion.div>
      </div>
    </>
  )
}

export default function Scout({ answers, set, addPartners, open, go }) {
  const { t, lang } = useI18n()
  const auth = useAuth()
  const [goal, setGoal] = useState(GOALS[0])
  const [status, setStatus] = useState(null)
  const [running, setRunning] = useState(false)
  const [items, setItems] = useState([])
  const [found, setFound] = useState([])
  const [runAnswers, setRunAnswers] = useState(null)
  const [log, setLog] = useState(null)
  const [error, setError] = useState('')
  const [drafts, setDrafts] = useState({})
  const [drafting, setDrafting] = useState(null)
  const [modal, setModal] = useState(null)
  const [mode, setMode] = useState('live')
  const sourceRef = useRef(null)
  const fileRef = useRef(null)

  useEffect(() => {
    scoutStatus().then(setStatus)
  }, [])

  const upsert = (key, item) => setItems((list) => {
    const i = list.findIndex((x) => x.key === key)
    if (i < 0) return [...list, { ...item, key }]
    const next = [...list]
    next[i] = { ...next[i], ...item, key }
    return next
  })

  const start = async (source) => {
    sourceRef.current = source
    setMode(source.live ? 'live' : source.simulated ? 'simulated' : 'replay')
    setRunning(true)
    setItems([])
    setFound([])
    setDrafts({})
    setError('')
    setLog(null)
    const g = source.live ? goal : (source.goal || goal)
    try {
      const out = await runScout({
        goal: g,
        source,
        baseAnswers: answers,
        emit: (ev) => {
          if (ev.type === 'step') {
            upsert(ev.id, ev)
            if (ev.kind === 'plan' && ev.status === 'done' && ev.answers) setRunAnswers(ev.answers)
            if (ev.kind === 'draft' && ev.draft) setDrafts((d) => ({ ...d, [ev.partner.id]: ev.draft }))
          } else {
            upsert('read-' + ev.candidate.domain, { ...ev, kind: 'read' })
            if (ev.status === 'done') setFound((f) => [...f, ev.partner])
          }
        },
      })
      setLog(out.log)
      set(out.answers)
      addPartners(out.partners)
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(false)
    }
  }

  const runLive = () => start(liveSource)
  const runSimulated = () => {
    setGoal(SCOUT_DEMO.goal)
    start({ ...replaySource(SCOUT_DEMO), goal: SCOUT_DEMO.goal })
  }
  const loadRun = async (file) => {
    try {
      const run = JSON.parse(await file.text())
      if (!run.plan || !run.search || !Array.isArray(run.reads)) throw new Error('bad')
      setGoal(run.goal || goal)
      start({ ...replaySource(run), goal: run.goal })
    } catch {
      setError(t('That file is not a saved Partner Scout run.'))
    }
  }
  const saveRun = () => {
    const blob = new Blob([JSON.stringify({ ...log, drafts: { ...log.drafts, ...Object.fromEntries(found.filter((p) => drafts[p.id]).map((p) => [p.website, drafts[p.id]])) } }, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `partner-scout-run-${new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const scored = useMemo(() => {
    if (!found.length) return []
    const r = evaluate(runAnswers || answers, found)
    return r.partners.filter((p) => p.scouted)
  }, [found, runAnswers, answers])

  const openDraft = async (p) => {
    if (drafts[p.id]) return setModal({ partner: p, draft: drafts[p.id] })
    setDrafting(p.id)
    try {
      const d = await draftFor(sourceRef.current || liveSource, p, log?.plan?.product, evaluate(runAnswers || answers, found).model)
      setDrafts((x) => ({ ...x, [p.id]: d }))
      setModal({ partner: p, draft: d })
    } catch (e) {
      setError(e.message)
    } finally {
      setDrafting(null)
    }
  }

  const configured = status?.model && status?.search
  const presence = Object.fromEntries(scored.flatMap((p) => Object.entries(p.presence)).map(([s, v]) => [s, Math.min(1, v)]))
  const markers = scored.map((p) => {
    const c = p.hq.lon != null ? [p.hq.lon, p.hq.lat] : CITY_COORDS[(p.hq.city || '').toLowerCase()]
    return { id: p.id, lon: c?.[0], lat: c?.[1], label: p.name.split(' ').slice(0, 2).join(' '), ok: p.eligible }
  })

  return (
    <div className="page">
      <div className="eyebrow">{t('AI agent')}</div>
      <h1 className="h2">{t('Partner Scout')}</h1>
      <p className="small" style={{ marginTop: -4 }}>
        <button className="link small" onClick={() => go('analyze')}>{t('Have a brochure already? Analyze it directly →')}</button>
      </p>
      <p className="muted" style={{ maxWidth: 820 }}>
        {t('Describe your product and goal. The agent plans a search, reads Indian companies’ own websites, checks every claim against the page, scores each company with the TsunaGo engine, and drafts a bilingual introduction you can send yourself.')}
      </p>

      <div className="box" style={{ marginTop: 22 }}>
        <div className="list-head">
          <span className="h3">{t('Your goal')}</span>
          <span className="small muted">
            {status == null ? '…' : configured
              ? t('Live · model: {m} · search: {s}', { m: status.model, s: status.search })
              : t('Live mode not configured (needs free GROQ_API_KEY and TAVILY_API_KEY) — the simulated run works offline.')}
          </span>
        </div>
        <textarea className="source goal" value={goal} onChange={(e) => setGoal(e.target.value)} disabled={running} aria-label={t('Your goal')} />
        <div className="list-foot">
          <div className="seg">
            {GOALS.map((g, i) => <button key={i} onClick={() => setGoal(g)} disabled={running} style={{ padding: '5px 10px', fontSize: 14 }}>{i === 0 ? t('Example (EN)') : t('Example (日本語)')}</button>)}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => e.target.files[0] && loadRun(e.target.files[0])} />
            <button className="btn ghost" disabled={running} onClick={() => fileRef.current.click()}>{t('Replay saved run')}</button>
            <button className="btn ghost" disabled={running} onClick={runSimulated}>{t('Simulated run')}</button>
            {configured && auth.enabled && !auth.user ? (
              <span className="signin-gate"><span className="small muted">{t('Sign in to run live')}</span><GoogleButton lang={lang} /></span>
            ) : (
              <button className="btn" disabled={running || !configured || goal.trim().length < 10} onClick={runLive}>{running ? t('Scouting…') : t('Run Partner Scout ✦')}</button>
            )}
          </div>
        </div>
      </div>
      {error && <p style={{ color: 'var(--shu)' }}>{error}</p>}

      {(items.length > 0 || running) && (
        <div className="scout">
          <div className="box">
            <div className="list-head">
              <span className="h3">{t('Agent steps')}</span>
              {mode !== 'live' && <span className="tag">{mode === 'simulated' ? t('Simulated · fictional companies') : t('Replay of a saved run')}</span>}
            </div>
            <div className="timeline">{items.map((it) => <Step key={it.key} item={it} t={t} lang={lang} />)}</div>
            {log && <div className="list-foot"><span className="small muted">{t('Save this run to replay it offline on stage.')}</span><button className="btn ghost" onClick={saveRun}>{t('Save run')}</button></div>}
          </div>

          <div>
            <div className="map-wrap">
              <IndiaMap presence={presence} clusters={CLUSTERS} markers={markers} animateKey={`scout-${scored.length}`} height={360} />
              <div className="map-legend">
                <span><i style={{ background: '#d76f8c', borderRadius: '50%' }} />{t('Passes all checks')}</span>
                <span><i style={{ border: '1.5px solid #b8323f', borderRadius: '50%' }} />{t('Excluded')}</span>
              </div>
            </div>
            <AnimatePresence>
              {scored.map((p) => (
                <motion.div key={p.id} className="box scout-card" layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="scout-card-head">
                    <div>
                      <b className="name">{p.name}</b>
                      <div className="meta">{t(p.type)} · {p.hq.city || '—'} · <a href={p.website} target="_blank" rel="noreferrer">{p.domain}</a></div>
                    </div>
                    <span className="score" style={{ color: p.eligible ? undefined : 'var(--shu)' }}>{p.score}</span>
                  </div>
                  <div className="scout-card-row">
                    <span className="pips">{p.checks.map((c) => <span key={c.id} className={`pip ${c.status}`} title={`${t(c.label)}: ${t(c.status)}`} />)}</span>
                    <span className="small">{p.eligible ? t('Passes all checks') : `${t('Excluded')}: ${p.checks.filter((c) => c.status === 'fail').map((c) => t(c.short)).join(', ')}`}</span>
                    <span className="small muted">{t('{a}/{b} quotes found on the site', { a: p.quotesFound, b: p.quotesTotal })}</span>
                    <span className="small muted">{p.contact.email || p.contact.phone ? t('Contact verified on site') : t('No published contact found')}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button className="btn ghost small-btn" onClick={() => open('partner', p)}>{t('Open full analysis')}</button>
                    <button className={`btn small-btn ${p.eligible ? '' : 'ghost'}`} disabled={drafting === p.id} onClick={() => openDraft(p)}>
                      {drafting === p.id ? t('Drafting…') : drafts[p.id] ? t('View message ✉') : t('Draft message ✉')}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      <AnimatePresence>
        {modal && <DraftModal key={modal.partner.id} partner={modal.partner} draft={modal.draft} onClose={() => setModal(null)} t={t} lang={lang} />}
      </AnimatePresence>
    </div>
  )
}
