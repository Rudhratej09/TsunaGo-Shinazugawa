import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { BUDGETS, INDUSTRIES, PRESENCE, TIMINGS } from '../data/catalog.js'
import { scoutStatus } from '../lib/scout.js'
import { useI18n } from '../i18n.jsx'
import { GoogleButton, useAuth } from '../auth.jsx'

const FIELDS = [
  ['companyName', 'Company name', 'e.g. Acme Precision KK'],
  ['homeCountry', 'Home country', 'Japan'],
  ['stage', 'Size and stage', 'e.g. 120 staff, exporting to ASEAN'],
  ['products', 'Product(s) and use cases', 'What you sell and what customers use it for'],
  ['usp', 'Measurable advantage (USP)', 'e.g. ±0.5 µm repeatability, 40% lower running cost'],
  ['price', 'Current price', 'e.g. ¥12M per unit (Japan list)'],
  ['unitCost', 'Approximate unit cost', 'e.g. ¥7–8M'],
  ['customers', 'Current customers and markets', 'Who buys today, where'],
  ['buyerType', 'Likely Indian buyer type', ''],
  ['investment', 'Investment ceiling', ''],
  ['modify', 'Willingness to modify the product', 'e.g. software and labels yes, hardware no'],
  ['capacity', 'Manufacturing capacity and minimum order', ''],
  ['ip', 'IP and exclusivity constraints', 'e.g. patents in JP only; existing Asia distributor'],
  ['contacts', 'Existing India contacts or distributors', ''],
  ['timeline', 'Timeline and risk tolerance', ''],
  ['notes', 'Other notes from TsunaGo', ''],
]
const COMMANDS = ['give me the brief', 'show assumptions', 'what would change your answer?', 'go deeper on pricing']
const START = 'Start the session: read my SME profile and give your opening message.'

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem(key)
      return v ? JSON.parse(v) : fallback
    } catch {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Storage can be unavailable (private mode); the session still works in memory.
    }
  },
}

// Seed the profile from the answers given in TsunaGo's guided flow.
function profileFromAnswers(a) {
  const label = (list, id) => list.find((x) => x.id === id)?.label || ''
  return {
    homeCountry: 'Japan',
    products: a.product || '',
    buyerType: `${label(INDUSTRIES, a.industry)} manufacturers (B2B)`,
    investment: label(BUDGETS, a.budget),
    contacts: label(PRESENCE, a.presence),
    timeline: label(TIMINGS, a.timing),
    notes: `Needs local installation: ${a.localInstall ? 'yes' : 'no'}. Own service team for India: ${a.ownService ? 'yes' : 'no'}.`,
  }
}

const EV = { F: 'verified fact', U: 'user-supplied', E: 'estimate', H: 'hypothesis' }

function Markdown({ text }) {
  const html = useMemo(() => {
    const raw = marked.parse(text, { gfm: true, breaks: false })
    const safe = DOMPurify.sanitize(raw, { FORBID_TAGS: ['img', 'style', 'form', 'input'] })
    return safe
      .replace(/<a /g, '<a target="_blank" rel="noreferrer" ')
      .replace(/\[(F|U|E|H)\]/g, (_, k) => `<span class="ev ev-${k}" title="${EV[k]}">${k}</span>`)
  }, [text])
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />
}

export default function Advisor({ answers, go }) {
  const { t, lang } = useI18n()
  const auth = useAuth()
  const [profile, setProfile] = useState(() => ({ ...profileFromAnswers(answers), ...store.get('tsunago-advisor-profile', {}) }))
  const [messages, setMessages] = useState(() => store.get('tsunago-advisor-chat', []))
  const [input, setInput] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [status, setStatus] = useState(null)
  const [editing, setEditing] = useState(() => store.get('tsunago-advisor-chat', []).length === 0)
  const endRef = useRef(null)

  useEffect(() => {
    scoutStatus().then(setStatus)
  }, [])
  useEffect(() => store.set('tsunago-advisor-profile', profile), [profile])
  useEffect(() => {
    store.set('tsunago-advisor-chat', messages)
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, busy])

  const send = async (content, { hidden = false } = {}) => {
    const text = content.trim()
    if (!text || busy) return
    const next = [...messages, { role: 'user', content: text, hidden }]
    setMessages(next)
    setInput('')
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next.map(({ role, content: c }) => ({ role, content: c })), profile, lang }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError({ code: data.error, message: data.message || `Advisor error (${res.status}).` })
        // Let the user retry the same turn.
        setMessages(messages)
        if (!hidden) setInput(text)
        return
      }
      setMessages([...next, { role: 'assistant', content: data.reply, sources: data.sources || [], model: data.model, searched: data.searched, ms: data.ms }])
    } catch {
      setError({ message: t('Could not reach the advisor. Check your connection and try again.') })
      setMessages(messages)
    } finally {
      setBusy(false)
    }
  }

  const start = () => {
    setEditing(false)
    send(START, { hidden: true })
  }
  const reset = () => {
    setMessages([])
    setError(null)
    setEditing(true)
  }
  const download = (m) => {
    const blob = new Blob([m.content], { type: 'text/markdown;charset=utf-8' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `tsunago-advisor-${(profile.companyName || 'brief').replace(/[^\w-]+/g, '-').toLowerCase()}.md`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const configured = status?.model
  const needSignIn = auth.enabled && !auth.user
  const filled = FIELDS.filter(([k]) => (profile[k] || '').trim()).length

  return (
    <div className="page">
      <div className="eyebrow">{t('Stage 3 · Localize product & pricing')}</div>
      <h1 className="h2">{t('India entry Advisor')}</h1>
      <p className="muted" style={{ maxWidth: 820 }}>
        {t('A senior market-entry advisor for your company: go / no-go screen, localization, price waterfall, entry model and partner profile, validation plan, and a decision brief. Every claim is tagged as a verified fact, your input, an estimate or a hypothesis.')}
      </p>

      <div className="advisor">
        <div className="box profile-card">
          <div className="list-head">
            <span className="h3">{t('Your SME profile')}</span>
            <span className="small muted">{t('{n}/{m} filled', { n: filled, m: FIELDS.length })}</span>
          </div>
          {editing ? (
            <div className="cell">
              <p className="small muted" style={{ marginTop: 0 }}>{t('Leave anything you don’t know blank — the advisor will ask or assume, and say which.')}</p>
              {FIELDS.map(([k, label, ph]) => (
                <label key={k} className="pf">
                  <span className="mini">{t(label)}</span>
                  <textarea className="input" rows={k === 'products' || k === 'usp' || k === 'notes' ? 2 : 1} value={profile[k] || ''} placeholder={ph}
                    onChange={(e) => setProfile((p) => ({ ...p, [k]: e.target.value }))} />
                </label>
              ))}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                {messages.length === 0
                  ? <button className="btn" disabled={busy || !configured || needSignIn} onClick={start}>{t('Start advisory session ✦')}</button>
                  : <button className="btn" onClick={() => setEditing(false)}>{t('Done')}</button>}
                <button className="btn ghost" onClick={() => setProfile(profileFromAnswers(answers))}>{t('Reset from TsunaGo answers')}</button>
              </div>
              {messages.length > 0 && <p className="small muted">{t('Changes apply to the next message you send.')}</p>}
            </div>
          ) : (
            <div className="cell">
              <dl className="pf-view">
                {FIELDS.filter(([k]) => (profile[k] || '').trim()).map(([k, label]) => (
                  <div key={k}><dt>{t(label)}</dt><dd>{profile[k]}</dd></div>
                ))}
              </dl>
              <button className="link small" onClick={() => setEditing(true)}>{t('Edit profile')}</button>
            </div>
          )}
        </div>

        <div className="box chat">
          <div className="list-head">
            <span className="h3">{t('Advisor')}</span>
            <span className="small muted">
              {status == null ? '…' : configured
                ? (status.search ? t('Live · model: {m} · web search on', { m: status.model }) : t('Live · model: {m} · web search off', { m: status.model }))
                : t('Not configured — needs GROQ_API_KEY (free) on the server.')}
            </span>
          </div>
          <div className="thread">
            {messages.length === 0 && !busy && (
              <div className="empty">
                <p>{t('Fill in what you know, then start the session. The advisor reads your profile first and asks only what matters most.')}</p>
                <p className="small muted">{t('Partner candidates come from the Partner Scout tab; the advisor helps you define and vet them.')}</p>
                <button className="link small" onClick={() => go('scout')}>{t('Open Partner Scout →')}</button>
              </div>
            )}
            {messages.map((m, i) => m.hidden ? (
              <div key={i} className="sys-line">✦ {t('Session started with your SME profile')}</div>
            ) : m.role === 'user' ? (
              <motion.div key={i} className="msg user" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>{m.content}</motion.div>
            ) : (
              <motion.div key={i} className="msg bot" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
                <Markdown text={m.content} />
                {m.sources?.length > 0 && (
                  <details className="srcs">
                    <summary className="small muted">{t('{n} sources searched', { n: m.sources.length })}</summary>
                    <ul>{m.sources.map((s, j) => <li key={j}><a href={s.url} target="_blank" rel="noreferrer">{s.title || s.url}</a> <span className="muted">· {s.date}</span></li>)}</ul>
                  </details>
                )}
                <div className="msg-foot">
                  <span>{m.searched ? t('web search on') : t('no web search')} · {m.model}</span>
                  <button className="link small" onClick={() => download(m)}>{t('Download .md')}</button>
                </div>
              </motion.div>
            ))}
            {busy && <div className="msg bot thinking"><span className="spin">✿</span> {t('Thinking and checking sources…')}</div>}
            <div ref={endRef} />
          </div>
          {error && (
            <div className="chat-error">
              {error.message}
              {error.code === 'signin_required' && <div style={{ marginTop: 8 }}><GoogleButton lang={lang} /></div>}
            </div>
          )}
          {messages.length > 0 && (
            <>
              <div className="chips cmd">
                {COMMANDS.map((c) => <button key={c} className="tag" disabled={busy} onClick={() => send(t(c))}>{t(c)}</button>)}
              </div>
              <form className="composer" onSubmit={(e) => { e.preventDefault(); send(input) }}>
                <textarea className="input" rows={2} value={input} placeholder={t('Answer the advisor or ask anything… (Enter to send, Shift+Enter for a new line)')}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) } }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <button className="btn" type="submit" disabled={busy || !input.trim()}>{t('Send')}</button>
                  <button className="btn ghost small-btn" type="button" disabled={busy} onClick={reset}>{t('New session')}</button>
                </div>
              </form>
            </>
          )}
          {needSignIn && messages.length === 0 && (
            <div className="cell signin-gate"><span className="small muted">{t('Sign in to use the live advisor')}</span><GoogleButton lang={lang} /></div>
          )}
        </div>
      </div>
      <p className="small muted" style={{ marginTop: 16 }}>{t('Decision support, not legal, tax or customs advice. The advisor names the professional to consult where it matters.')}</p>
    </div>
  )
}
