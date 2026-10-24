import { useState } from 'react'
import { motion } from 'framer-motion'
import { COACH_EXAMPLE, MEETING_CHECKLIST, PLAYBOOK, SITUATIONS } from '../data/culture.js'
import { serviceModel } from '../lib/engine.js'
import { vget, vset } from '../lib/ventures.js'
import { useI18n } from '../i18n.jsx'
import { GoogleButton } from '../auth.jsx'


async function callCulture(action, body) {
  const res = await fetch(`/api/culture?action=${action}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.message || `Error ${res.status}`), { code: data.error })
  return data
}

function ErrorBox({ error, lang }) {
  if (!error) return null
  return (
    <div className="chat-error" style={{ margin: '12px 0 0' }}>
      {error.message}
      {error.code === 'signin_required' && <div style={{ marginTop: 8 }}><GoogleButton lang={lang} /></div>}
    </div>
  )
}

function Playbook({ t, L, lang, go }) {
  return (
    <>
      <div className="box" style={{ marginTop: 24, overflowX: 'auto' }}>
        <table className="roadmap playbook">
          <thead><tr><th>{t('Topic')}</th><th>🇯🇵 {t('Common in Japan')}</th><th>🇮🇳 {t('Common in India')}</th><th>{t('What to do')}</th></tr></thead>
          <tbody>
            {PLAYBOOK.map((r) => (
              <tr key={r.topic.en}>
                <th>{L(r.topic)}</th><td>{L(r.japan)}</td><td>{L(r.india)}</td><td className="do">{L(r.action)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="two" style={{ marginTop: 20 }}>
        <div className="box">
          <div className="list-head"><span className="h3">{t('Before every meeting')}</span></div>
          <ul className="checklist cell">{MEETING_CHECKLIST.map((c) => <li key={c.en}>{L(c)}</li>)}</ul>
        </div>
        <div className="box">
          <div className="list-head"><span className="h3">{t('Put it into practice')}</span></div>
          <div className="cell">
            <p style={{ marginTop: 0 }}>{t('Paste a message you are about to send and the coach rewrites it for an Indian counterpart, with a Japanese back-translation.')}</p>
            <button className="btn" onClick={() => go('coach')}>{t('Open the message coach →')}</button>
            <p>{t('Preparing for a partner meeting? Get their likely asks, your give-and-get concessions and phrases to use.')}</p>
            <button className="btn ghost" onClick={() => go('negotiate')}>{t('Prepare a negotiation →')}</button>
          </div>
        </div>
      </div>
      <p className="small muted" style={{ marginTop: 14 }}>{lang === 'ja' ? '一般的な商習慣に基づく目安です。人や企業によって異なります。' : 'General guidance from common business practice. People and companies vary — use these as conversation starters, not rules.'}</p>
    </>
  )
}

function Coach({ t, lang, partners }) {
  const [form, setForm] = useState(() => vget('coach-form', { message: '', situation: 'first', counterpart: '' }))
  const [out, setOut] = useState(() => vget('coach', null))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const set = (p) => setForm((f) => { const n = { ...f, ...p }; vset('coach-form', n); return n })
  const run = async () => {
    setBusy(true); setError(null)
    try {
      const r = await callCulture('coach', { ...form, lang })
      setOut(r); vset('coach', r)
    } catch (e) { setError(e) } finally { setBusy(false) }
  }
  return (
    <div className="two" style={{ marginTop: 24 }}>
      <div className="box">
        <div className="list-head"><span className="h3">{t('Your message')}</span>
          <button className="link small" onClick={() => set({ message: lang === 'ja' ? COACH_EXAMPLE.ja : COACH_EXAMPLE.en, situation: 'delay' })}>{t('Use an example')}</button></div>
        <div className="cell">
          <label className="pf"><span className="mini">{t('Situation')}</span></label>
          <div className="seg" style={{ flexWrap: 'wrap' }}>
            {SITUATIONS.map((s) => <button key={s.id} className={form.situation === s.id ? 'on' : ''} onClick={() => set({ situation: s.id })}>{lang === 'ja' ? s.ja : t(s.label)}</button>)}
          </div>
          <label className="pf"><span className="mini">{t('Who it is for')}</span>
            <input className="input" list="coach-partners" value={form.counterpart} placeholder={t('e.g. MD of a Pune distributor')} onChange={(e) => set({ counterpart: e.target.value })} />
            <datalist id="coach-partners">{partners.map((p) => <option key={p.id} value={`${p.name} (${p.type}, ${p.hq.city})`} />)}</datalist>
          </label>
          <label className="pf"><span className="mini">{t('Message (Japanese or English)')}</span>
            <textarea className="input" rows={8} value={form.message} onChange={(e) => set({ message: e.target.value })} placeholder={t('Paste the email or WhatsApp message you plan to send…')} />
          </label>
          <button className="btn" style={{ marginTop: 12 }} disabled={busy || form.message.trim().length < 5} onClick={run}>{busy ? t('Rewriting…') : t('Coach this message ✦')}</button>
          <ErrorBox error={error} lang={lang} />
        </div>
      </div>
      <div className="box">
        <div className="list-head"><span className="h3">{t('Ready to send')}</span>{out?.model && <span className="small muted">{out.model}</span>}</div>
        {!out ? <div className="cell muted">{t('The improved message, a Japanese back-translation and what changed will appear here.')}</div> : (
          <motion.div className="cell" key={out.rewritten} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="mini">{t('English, for your counterpart')}</div>
            <pre className="msg-out">{out.rewritten}</pre>
            <button className="link small" onClick={() => navigator.clipboard?.writeText(out.rewritten)}>{t('Copy')}</button>
            <div className="mini" style={{ marginTop: 14 }}>{t('Japanese back-translation')}</div>
            <pre className="msg-out jp-out">{out.back_translation}</pre>
            {out.risks?.length > 0 && <>
              <div className="mini" style={{ marginTop: 14 }}>{t('How the original could be misread')}</div>
              <ul className="evidence">{out.risks.map((r, i) => <li key={i}><b style={{ fontWeight: 500 }}>{r.risk}</b> — {r.fix}</li>)}</ul>
            </>}
            <div className="mini">{t('What changed')}</div>
            <ul className="evidence">{out.changes?.map((c, i) => <li key={i}><b style={{ fontWeight: 500 }}>{c.what}</b> — {c.why}</li>)}</ul>
            {out.tone_note && <p className="small muted" style={{ marginBottom: 0 }}>{out.tone_note}</p>}
          </motion.div>
        )}
      </div>
    </div>
  )
}

function Negotiate({ t, lang, partners, answers }) {
  const [form, setForm] = useState(() => vget('negotiate-form', { partner: '', product: answers.product || '', terms: '', position: '' }))
  const [out, setOut] = useState(() => vget('negotiate', null))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const set = (p) => setForm((f) => { const n = { ...f, ...p }; vset('negotiate-form', n); return n })
  const run = async () => {
    setBusy(true); setError(null)
    try {
      const r = await callCulture('negotiate', { ...form, model: serviceModel(answers), lang })
      setOut(r); vset('negotiate', r)
    } catch (e) { setError(e) } finally { setBusy(false) }
  }
  const TERMS = ['Exclusivity', 'Distributor margin', 'Minimum order', 'Payment terms', 'Demo units', 'Service SLA']
  const toggleTerm = (x) => {
    const list = form.terms.split(',').map((s) => s.trim()).filter(Boolean)
    set({ terms: (list.includes(x) ? list.filter((s) => s !== x) : [...list, x]).join(', ') })
  }
  return (
    <>
      <div className="box" style={{ marginTop: 24 }}>
        <div className="grid form" style={{ marginTop: 0 }}>
          <div className="field"><label>{t('Partner')}</label>
            {partners.length > 0 ? (
              <select className="input" value={form.partner} onChange={(e) => set({ partner: e.target.value })}>
                <option value="">{t('Choose from your shortlist…')}</option>
                {partners.map((p) => <option key={p.id} value={`${p.name} — ${p.type}, ${p.hq.city}`}>{p.name}</option>)}
              </select>
            ) : <input className="input" value={form.partner} placeholder={t('Partner name and type')} onChange={(e) => set({ partner: e.target.value })} />}
          </div>
          <div className="field"><label>{t('Product')}</label><input className="input" value={form.product} onChange={(e) => set({ product: e.target.value })} placeholder={t('e.g. Coordinate measuring machines')} /></div>
          <div className="field" style={{ gridColumn: '1 / -1', borderRight: 0 }}><label>{t('What is on the table')}</label>
            <div className="seg" style={{ flexWrap: 'wrap', marginBottom: 8 }}>
              {TERMS.map((x) => <button key={x} className={form.terms.includes(x) ? 'on' : ''} onClick={() => toggleTerm(x)}>{t(x)}</button>)}
            </div>
            <input className="input" value={form.terms} onChange={(e) => set({ terms: e.target.value })} placeholder={t('Or type the terms')} />
          </div>
          <div className="field" style={{ gridColumn: '1 / -1', borderRight: 0, borderBottom: 0 }}><label>{t('Your limits (optional)')}</label>
            <textarea className="input" rows={2} value={form.position} onChange={(e) => set({ position: e.target.value })} placeholder={t('e.g. margin up to 18%, exclusivity in 2 states max, no credit on first order')} />
          </div>
        </div>
        <div className="cell" style={{ borderTop: '1px solid var(--hair)' }}>
          <button className="btn" disabled={busy || !form.terms.trim()} onClick={run}>{busy ? t('Preparing…') : t('Prepare my negotiation ✦')}</button>
          {partners.length === 0 && <span className="small muted" style={{ marginLeft: 12 }}>{t('Tip: shortlist partners in stage 2 to pick them here.')}</span>}
          <ErrorBox error={error} lang={lang} />
        </div>
      </div>

      {out && (
        <motion.div key={out.summary} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="box" style={{ marginTop: 20 }}><div className="cell"><div className="mini">{t('What this negotiation is about')}</div><p style={{ marginBottom: 0 }}>{out.summary}</p></div></div>
          <div className="box" style={{ marginTop: 20, overflowX: 'auto' }}>
            <div className="list-head"><span className="h3">{t('What they are likely to ask')}</span><span className="small muted">{out.model}</span></div>
            <table className="roadmap"><thead><tr><th>{t('Their ask')}</th><th>{t('Why')}</th><th>{t('Your response')}</th></tr></thead>
              <tbody>{out.likely_asks.map((a, i) => <tr key={i}><th>{a.ask}</th><td>{a.why}</td><td className="do">{a.response}</td></tr>)}</tbody></table>
          </div>
          <div className="two" style={{ marginTop: 20 }}>
            <div className="box">
              <div className="list-head"><span className="h3">{t('Concession ladder')}</span><span className="small muted">{t('give only to get')}</span></div>
              <ol className="ladder cell">{out.concessions.map((c, i) => <li key={i}><span className="give">{t('Give')}: {c.give}</span><span className="get">{t('Get')}: {c.get}</span></li>)}</ol>
              <div className="cell" style={{ borderTop: '1px solid var(--hair-2)' }}>
                <div className="mini">{t('Red lines')}</div>
                <ul className="evidence">{out.red_lines.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            </div>
            <div className="box">
              <div className="list-head"><span className="h3">{t('Phrases to use')}</span></div>
              <div className="cell">{out.phrases.map((p, i) => (
                <div key={i} className="phrase"><b>“{p.en}”</b><span className="jp-out">{p.ja}</span><span className="small muted">{p.use}</span></div>
              ))}</div>
              <div className="cell" style={{ borderTop: '1px solid var(--hair-2)' }}>
                <div className="mini">{t('Prepare before the meeting')}</div>
                <ul className="evidence">{out.before_meeting.map((r, i) => <li key={i}>{r}</li>)}</ul>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </>
  )
}

export default function Culture({ view, answers, result, shortlist, go }) {
  const { t, lang } = useI18n()
  const L = (x) => (x && typeof x === 'object' ? x[lang] : x)
  const partners = result.partners.filter((p) => shortlist.includes(p.id))
  const titles = { culture: 'Japan ↔ India business playbook', coach: 'Message coach', negotiate: 'Negotiation prep' }
  return (
    <div className="page">
      <div className="eyebrow">{t('Stage 5 · Culture & negotiation')}</div>
      <h1 className="h2">{t(titles[view])}</h1>
      <p className="muted" style={{ maxWidth: 820 }}>
        {view === 'culture' && t('Most Japan–India deals stall on misunderstandings, not products: a soft "we will consider it", a first price treated as final, a silence read as a no. Each row ends in something concrete to do.')}
        {view === 'coach' && t('Paste a message in Japanese or English. The coach makes it clear and polite for an Indian counterpart, explains what changed, and gives you a Japanese back-translation to check the meaning.')}
        {view === 'negotiate' && t('Pick a partner and what is on the table. Get their likely asks, a give-and-get concession ladder, your red lines and phrases to use in the room.')}
      </p>
      {view === 'culture' && <Playbook t={t} L={L} lang={lang} go={go} />}
      {view === 'coach' && <Coach t={t} lang={lang} partners={partners} />}
      {view === 'negotiate' && <Negotiate t={t} lang={lang} partners={partners} answers={answers} />}
    </div>
  )
}
