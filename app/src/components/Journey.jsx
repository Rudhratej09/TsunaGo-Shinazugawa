import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useI18n } from '../i18n.jsx'

// The India-entry journey, one stage per part of the JETRO problem statement.
// `done(state)` decides the check mark; `needsProfile` locks items until a profile is chosen.
export const JOURNEY = [
  {
    stage: 'Start', short: 'Start', num: '0', items: [
      { route: 'profile', label: 'Company profile', tab: 'Profile', done: (s) => !!s.answers.profile },
      { route: 'needs', label: 'Requirements', tab: 'Requirements', needsProfile: true, done: (s) => s.visited.needs },
    ],
  },
  {
    stage: 'Understand the market', short: 'Market', num: '1', items: [
      { route: 'market', label: 'Market & regions', needsProfile: true, done: (s) => s.visited.market },
    ],
  },
  {
    stage: 'Find & verify partners', short: 'Partners', num: '2', items: [
      { route: 'partners', label: 'Compare & shortlist partners', tab: 'Compare & shortlist', needsProfile: true, done: (s) => s.shortlist.length > 0 },
      { route: 'scout', label: 'Partner Scout (AI agent)', tab: '✦ Partner Scout', done: (s) => s.visited.scout, optional: true },
      { route: 'analyze', label: 'Analyze a brochure', tab: 'Analyze a brochure', done: (s) => s.visited.analyze, optional: true },
    ],
  },
  {
    stage: 'Localize product & pricing', short: 'Localize & price', num: '3', items: [
      { route: 'advisor', label: 'AI Advisor: localization, pricing & entry model', done: (s) => s.advisorStarted },
    ],
  },
  {
    stage: 'Regulation & compliance', short: 'Compliance', num: '4', items: [
      { route: 'compliance', label: 'Compliance roadmap', done: (s) => s.visited.compliance },
      { route: 'compliance', key: 'signoff', label: 'Professional sign-off', done: (s) => s.signedOff, optional: true },
    ],
  },
  { stage: 'Culture & negotiation', short: 'Culture', num: '5', soon: true, items: [] },
  {
    stage: 'Pilot & long-term operations', short: 'Pilot & operations', num: '6', items: [
      { route: 'plan', label: 'Pilot plan', needsProfile: true, done: (s) => s.visited.plan },
    ],
  },
]

export const stageOf = (route) => JOURNEY.find((g) => g.items.some((i) => i.route === route))

export function progress(state) {
  const core = JOURNEY.flatMap((g) => g.items).filter((i) => !i.optional)
  const done = core.filter((i) => i.done(state)).length
  const next = core.find((i) => !i.done(state) && !(i.needsProfile && !state.answers.profile))
  return { done, total: core.length, next }
}

// Stage tabs under the header, plus a second row when a stage has several pages.
export function StageTabs({ route, go, state }) {
  const { t } = useI18n()
  const current = stageOf(route)
  const subs = current ? current.items.filter((i) => i.tab) : []
  return (
    <div className="stage-tabs">
      <nav className="st-row" aria-label={t('Your India entry plan')}>
        {JOURNEY.map((g) => {
          const first = g.items[0]
          const locked = g.soon || (first?.needsProfile && !state.answers.profile)
          const complete = g.items.length > 0 && g.items.filter((i) => !i.optional).every((i) => i.done(state))
          return (
            <button key={g.num} className={`st ${current === g ? 'on' : ''} ${g.soon ? 'soon' : ''}`} disabled={locked}
              title={g.soon ? t('coming next') : locked ? t('Choose a company profile first') : t(g.stage)}
              onClick={() => go(first.route)}>
              <span className={`st-num ${complete ? 'done' : ''}`}>{complete ? '✓' : g.num}</span>{t(g.short)}
            </button>
          )
        })}
      </nav>
      {subs.length > 1 && (
        <nav className="st-sub" aria-label={t(current.stage)}>
          {subs.map((i) => (
            <button key={i.route} className={route === i.route ? 'on' : ''} disabled={i.needsProfile && !state.answers.profile} onClick={() => go(i.route)}>
              {t(i.tab)}{i.optional && <em> · {t('optional')}</em>}
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}

// The full checklist, in a drawer that only opens on request.
export function ChecklistDrawer({ open, onClose, route, go, state }) {
  const { t } = useI18n()
  const { done, total, next } = progress(state)
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="j-backdrop" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="j-drawer" role="dialog" aria-label={t('Your India entry plan')}
            initial={{ x: 380 }} animate={{ x: 0 }} exit={{ x: 380 }} transition={{ type: 'spring', stiffness: 320, damping: 34 }}>
            <div className="j-head">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div className="mini">{t('Your India entry plan')}</div>
                <button className="link small" onClick={onClose} aria-label={t('Close')}>✕</button>
              </div>
              <div className="j-progress"><motion.i animate={{ width: `${(done / total) * 100}%` }} /></div>
              <div className="small muted">{t('{n} of {m} steps done', { n: done, m: total })}</div>
            </div>
            {JOURNEY.map((g) => (
              <div key={g.stage} className={`j-stage ${g.soon ? 'soon' : ''}`}>
                <div className="j-stage-name"><span className="j-num">{g.num}</span>{t(g.stage)}{g.soon && <span className="j-soon">{t('coming next')}</span>}</div>
                {g.items.map((i) => {
                  const locked = i.needsProfile && !state.answers.profile
                  const isDone = i.done(state)
                  return (
                    <button key={i.key || i.route} className={`j-item ${route === i.route && !i.key ? 'on' : ''} ${isDone ? 'done' : ''} ${next === i ? 'next' : ''}`}
                      disabled={locked} title={locked ? t('Choose a company profile first') : undefined}
                      onClick={() => { onClose(); go(i.route) }}>
                      <span className="j-check" aria-hidden="true">{isDone ? '✓' : ''}</span>
                      <span>{t(i.label)}{i.optional && <em className="j-opt"> · {t('optional')}</em>}</span>
                      {next === i && <span className="j-next">{t('next')}</span>}
                    </button>
                  )
                })}
              </div>
            ))}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
