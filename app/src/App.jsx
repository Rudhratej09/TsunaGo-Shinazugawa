import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sakura from './components/Sakura.jsx'
import Intro from './components/Intro.jsx'
import { BRAND } from './brand.js'
import SidePanel from './components/SidePanel.jsx'
import { ChecklistDrawer, progress, StageTabs } from './components/Journey.jsx'
import Home from './pages/Home.jsx'
import { NeedsStep, ProfileStep } from './pages/Setup.jsx'
import Options from './pages/Options.jsx'
import Plan from './pages/Plan.jsx'
import Why from './pages/Why.jsx'
import Analyze from './pages/Analyze.jsx'
import Scout from './pages/Scout.jsx'
import Advisor from './pages/Advisor.jsx'
import Compliance from './pages/Compliance.jsx'
import Culture from './pages/Culture.jsx'
import { PROFILES } from './data/catalog.js'
import { DEFAULT_PRIORITIES, evaluate } from './lib/engine.js'
import { LangProvider } from './i18n.jsx'
import { GoogleButton, useAuth, UserMenu } from './auth.jsx'
import { translate } from './i18n-core.js'

const STEPS = [
  ['profile', 'Profile'],
  ['needs', 'Requirements'],
  ['options', 'Options'],
  ['plan', 'Pilot plan'],
]
const ROUTES = ['home', 'why', 'analyze', 'scout', 'advisor', 'compliance', 'market', 'partners', 'culture', 'coach', 'negotiate', ...STEPS.map((s) => s[0])]
// Pages without the journey sidebar.
const LANDING = ['home', 'why']

const initialAnswers = () => {
  const p = PROFILES[1]
  return { profile: null, ...p.defaults, priorities: { ...DEFAULT_PRIORITIES } }
}

const readLang = () => {
  try {
    return localStorage.getItem('tsunago-lang') === 'ja' ? 'ja' : 'en'
  } catch {
    return 'en'
  }
}

const readRoute = () => {
  const r = window.location.hash.replace('#/', '')
  if (r === 'options') return 'market' // old links
  return ROUTES.includes(r) ? r : 'home'
}

const readStore = (key, fallback) => {
  try {
    const v = localStorage.getItem(key)
    return v ? JSON.parse(v) : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [route, setRoute] = useState(readRoute)
  const [answers, setAnswers] = useState(() => ({ ...initialAnswers(), ...readStore('tsunago-answers', {}) }))
  const [panel, setPanel] = useState(null)
  const [shortlist, setShortlist] = useState(() => readStore('tsunago-shortlist', []))
  const [customPartners, setCustomPartners] = useState([])
  const [checklist, setChecklist] = useState(false)
  const [petals, setPetals] = useState(() => readStore('tsunago-petals', true))
  const togglePetals = () => setPetals((on) => {
    try {
      localStorage.setItem('tsunago-petals', JSON.stringify(!on))
    } catch {
      // storage unavailable: the toggle still works for this visit
    }
    return !on
  })
  const closeChecklist = useCallback(() => setChecklist(false), [])
  // Keep the plan across reloads (answers and shortlist live only in this browser).
  useEffect(() => {
    try {
      localStorage.setItem('tsunago-answers', JSON.stringify(answers))
      localStorage.setItem('tsunago-shortlist', JSON.stringify(shortlist))
    } catch {
      // storage unavailable: the plan still works for this visit
    }
  }, [answers, shortlist])

  // Steps opened so far, for the journey checklist.
  const [visited, setVisited] = useState(() => ({ ...readStore('tsunago-visited', {}), [readRoute()]: true }))
  const markVisited = useCallback((r) => setVisited((v) => {
    if (v[r]) return v
    const next = { ...v, [r]: true }
    try {
      localStorage.setItem('tsunago-visited', JSON.stringify(next))
    } catch {
      // storage unavailable: the checklist still works for this visit
    }
    return next
  }), [])
  const auth = useAuth()
  const [lang, setLangState] = useState(readLang)
  const setLang = (l) => {
    setLangState(l)
    try {
      localStorage.setItem('tsunago-lang', l)
    } catch {
      // Storage can be unavailable (private mode); the toggle still works for this visit.
    }
  }
  const t = (x, v) => translate(lang, x, v)

  useEffect(() => {
    document.documentElement.lang = lang
    // On <body> so the side panel and intro (outside .app) pick up the Japanese fonts too.
    document.body.classList.toggle('lang-ja', lang === 'ja')
  }, [lang])
  // Play the opening animation only when the site is opened on the home page.
  const [intro, setIntro] = useState(() =>
    BRAND.intro && readRoute() === 'home' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'playing' : 'done')

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute())
      markVisited(readRoute())
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [markVisited])

  const go = useCallback((r) => {
    window.location.hash = '/' + r
    setRoute(r)
    markVisited(r)
    setPanel(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [markVisited])

  const result = useMemo(() => evaluate(answers, customPartners), [answers, customPartners])

  // Keep an open panel in sync when answers change (e.g. flipping service model A/B).
  const livePanel = useMemo(() => {
    if (!panel) return null
    const list = panel.kind === 'partner' ? result.partners : result.clusters
    const data = list.find((x) => x.id === panel.id)
    return data ? { kind: panel.kind, data } : null
  }, [panel, result])

  const set = (patch) => setAnswers((a) => ({ ...a, ...patch }))
  const pick = (p) => setAnswers((a) => ({ ...a, ...p.defaults, profile: p.id }))
  const open = (kind, data) => setPanel({ kind, id: data.id })
  const toggleShortlist = (id) => setShortlist((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const journeyState = { answers, visited, shortlist, signedOff: !!readStore('tsunago-compliance-signoff', {}).done, advisorStarted: readStore('tsunago-advisor-chat', []).length > 0, coached: !!readStore('tsunago-coach', null), negotiated: !!readStore('tsunago-negotiate', null) }
  const inPlan = !LANDING.includes(route)
  const prog = progress(journeyState)

  const props = { answers, set, go, result, open, selected: panel?.id, shortlist, toggleShortlist }

  return (
    <LangProvider value={{ lang, setLang }}>
      {petals && <Sakura density={route === 'home' ? 34 : 16} />}
      <div className="app">
        <header className="top">
          <button className="brand" onClick={() => go('home')} aria-label={`${BRAND.name} home`}><img src={BRAND.logo} alt={BRAND.name} /></button>
          <nav className="steps" aria-label={t('Site')}>
            {LANDING.includes(route) && <button onClick={() => go(answers.profile ? 'market' : 'profile')}>{answers.profile ? t('Continue my plan →') : t('Start')}</button>}
            <button className={`why-btn ${route === 'why' ? 'on' : ''}`} onClick={() => go('why')}>{t('Why TsunaGo')}</button>
            <button className={`petal-btn ${petals ? '' : 'off'}`} onClick={togglePetals} aria-pressed={petals} title={petals ? t('Turn petals off') : t('Turn petals on')}>✿</button>
            <button className="checklist-btn" onClick={() => setChecklist(true)} aria-haspopup="dialog">
              ☑ <span className="cl-label">{t('Checklist')}</span> <b>{prog.done}/{prog.total}</b>
            </button>
            <span className="lang-switch" role="group" aria-label="Language">
              <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')}>EN</button>
              <button className={lang === 'ja' ? 'on' : ''} onClick={() => setLang('ja')}>日本語</button>
            </span>
          </nav>
          {auth.enabled && (
            <div className="auth-slot">
              {auth.user ? <UserMenu t={t} /> : <GoogleButton lang={lang} size="small" />}
            </div>
          )}
        </header>

        {inPlan && <StageTabs route={route} go={go} state={journeyState} />}
        <AnimatePresence mode="wait">
          <motion.main key={route} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }} style={{ flex: 1, minWidth: 0 }}>
            {route === 'home' && <Home go={go} intro={intro} />}
            {route === 'why' && <Why go={go} />}
            {route === 'scout' && (
              <Scout answers={answers} set={set} open={open} go={go}
                addPartners={(list) => setCustomPartners((cur) => [...cur.filter((x) => !list.some((p) => p.id === x.id)), ...list])} />
            )}
            {route === 'advisor' && <Advisor answers={answers} go={go} />}
            {route === 'compliance' && <Compliance answers={answers} result={result} shortlist={shortlist} go={go} />}
            {['culture', 'coach', 'negotiate'].includes(route) && <Culture view={route} answers={answers} result={result} shortlist={shortlist} go={go} />}
            {route === 'analyze' && (
              <Analyze answers={answers} customPartners={customPartners} open={open} go={go}
                addPartner={(p) => setCustomPartners((list) => [...list.filter((x) => x.id !== p.id), p])} />
            )}
            {route === 'profile' && <ProfileStep answers={answers} pick={pick} go={go} />}
            {route === 'needs' && (answers.profile ? <NeedsStep {...props} /> : <ProfileStep answers={answers} pick={pick} go={go} />)}
            {(route === 'market' || route === 'partners') && (answers.profile ? <Options {...props} view={route} /> : <ProfileStep answers={answers} pick={pick} go={go} />)}
            {route === 'plan' && (answers.profile ? <Plan {...props} /> : <ProfileStep answers={answers} pick={pick} go={go} />)}
          </motion.main>
        </AnimatePresence>

        <footer className="foot">
          <span>{t('TEAM SHINAZUGAWA · Thapar × JETRO Hackathon')}</span>
          <span>{t('Prototype · partner profiles are fictional · map data © svg-maps (CC BY 4.0)')}</span>
        </footer>
      </div>

      {intro !== 'done' && (
        <Intro onReveal={() => setIntro((s) => (s === 'playing' ? 'revealing' : s))} onDone={() => setIntro('done')} />
      )}
      <ChecklistDrawer open={checklist} onClose={closeChecklist} route={route} go={go} state={journeyState} />
      <SidePanel item={livePanel} answers={answers} result={result} onClose={() => setPanel(null)} shortlist={shortlist} toggleShortlist={toggleShortlist} />
    </LangProvider>
  )
}
