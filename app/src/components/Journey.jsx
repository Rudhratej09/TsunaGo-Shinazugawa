import { useState } from 'react'
import { motion } from 'framer-motion'
import { useI18n } from '../i18n.jsx'

// The India-entry journey, one stage per part of the JETRO problem statement.
// `done(state)` decides the check mark; `needsProfile` locks items until a profile is chosen.
export const JOURNEY = [
  {
    stage: 'Start', num: '0', items: [
      { route: 'profile', label: 'Company profile', done: (s) => !!s.answers.profile },
      { route: 'needs', label: 'Requirements', needsProfile: true, done: (s) => s.visited.needs },
    ],
  },
  {
    stage: 'Understand the market', num: '1', items: [
      { route: 'market', label: 'Market & regions', needsProfile: true, done: (s) => s.visited.market },
    ],
  },
  {
    stage: 'Find & verify partners', num: '2', items: [
      { route: 'partners', label: 'Compare & shortlist partners', needsProfile: true, done: (s) => s.shortlist.length > 0 },
      { route: 'scout', label: 'Partner Scout (AI agent)', done: (s) => s.visited.scout, optional: true },
      { route: 'analyze', label: 'Analyze a brochure', done: (s) => s.visited.analyze, optional: true },
    ],
  },
  { stage: 'Localize product & pricing', num: '3', soon: true, items: [] },
  {
    stage: 'Regulation & compliance', num: '4', items: [
      { route: 'compliance', label: 'Compliance roadmap', done: (s) => s.visited.compliance },
      { route: 'compliance', key: 'signoff', label: 'Professional sign-off', done: (s) => s.signedOff, optional: true },
    ],
  },
  { stage: 'Culture & negotiation', num: '5', soon: true, items: [] },
  {
    stage: 'Pilot & long-term operations', num: '6', items: [
      { route: 'plan', label: 'Pilot plan', needsProfile: true, done: (s) => s.visited.plan },
    ],
  },
]

export default function Journey({ route, go, state }) {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const items = JOURNEY.flatMap((g) => g.items)
  const core = items.filter((i) => !i.optional)
  const doneCount = core.filter((i) => i.done(state)).length
  const next = core.find((i) => !i.done(state) && !(i.needsProfile && !state.answers.profile))

  const nav = (
    <nav className="journey" aria-label={t('Your India entry plan')}>
      <div className="j-head">
        <div className="mini">{t('Your India entry plan')}</div>
        <div className="j-progress"><motion.i animate={{ width: `${(doneCount / core.length) * 100}%` }} /></div>
        <div className="small muted">{t('{n} of {m} steps done', { n: doneCount, m: core.length })}</div>
      </div>
      {JOURNEY.map((g) => (
        <div key={g.stage} className={`j-stage ${g.soon ? 'soon' : ''}`}>
          <div className="j-stage-name"><span className="j-num">{g.num}</span>{t(g.stage)}{g.soon && <span className="j-soon">{t('coming next')}</span>}</div>
          {g.items.map((i) => {
            const locked = i.needsProfile && !state.answers.profile
            const done = i.done(state)
            const on = route === i.route && !i.key
            return (
              <button key={i.key || i.route} className={`j-item ${on ? 'on' : ''} ${done ? 'done' : ''} ${next === i ? 'next' : ''}`}
                disabled={locked} title={locked ? t('Choose a company profile first') : undefined}
                onClick={() => { setOpen(false); go(i.route) }}>
                <span className="j-check" aria-hidden="true">{done ? '✓' : ''}</span>
                <span>{t(i.label)}{i.optional && <em className="j-opt"> · {t('optional')}</em>}</span>
                {next === i && <span className="j-next">{t('next')}</span>}
              </button>
            )
          })}
        </div>
      ))}
      <div className="j-tools">
        <div className="mini">{t('Ask anytime')}</div>
        <button className={`j-item ${route === 'advisor' ? 'on' : ''}`} onClick={() => { setOpen(false); go('advisor') }}>
          <span className="j-check" aria-hidden="true">✦</span><span>{t('AI Advisor')}</span>
        </button>
      </div>
    </nav>
  )

  return (
    <aside className={`j-side ${open ? 'open' : ''}`}>
      <button className="j-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
        {t('Your India entry plan')} · {doneCount}/{core.length} {open ? '▴' : '▾'}
      </button>
      {nav}
    </aside>
  )
}
