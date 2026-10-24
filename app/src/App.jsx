import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Sakura from './components/Sakura.jsx'
import Intro from './components/Intro.jsx'
import { BRAND } from './brand.js'
import SidePanel from './components/SidePanel.jsx'
import Home from './pages/Home.jsx'
import { NeedsStep, ProfileStep } from './pages/Setup.jsx'
import Options from './pages/Options.jsx'
import Plan from './pages/Plan.jsx'
import Why from './pages/Why.jsx'
import { PROFILES } from './data/catalog.js'
import { DEFAULT_PRIORITIES, evaluate } from './lib/engine.js'

const STEPS = [
  ['profile', 'Profile'],
  ['needs', 'Requirements'],
  ['options', 'Options'],
  ['plan', 'Pilot plan'],
]
const ROUTES = ['home', 'why', ...STEPS.map((s) => s[0])]

const initialAnswers = () => {
  const p = PROFILES[1]
  return { profile: null, ...p.defaults, priorities: { ...DEFAULT_PRIORITIES } }
}

const readRoute = () => {
  const r = window.location.hash.replace('#/', '')
  return ROUTES.includes(r) ? r : 'home'
}

export default function App() {
  const [route, setRoute] = useState(readRoute)
  const [answers, setAnswers] = useState(initialAnswers)
  const [panel, setPanel] = useState(null)
  const [shortlist, setShortlist] = useState([])
  // Play the opening animation only when the site is opened on the home page.
  const [intro, setIntro] = useState(() =>
    BRAND.intro && readRoute() === 'home' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'playing' : 'done')

  useEffect(() => {
    const onHash = () => setRoute(readRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const go = useCallback((r) => {
    window.location.hash = '/' + r
    setRoute(r)
    setPanel(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const result = useMemo(() => evaluate(answers), [answers])

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
  const reached = answers.profile ? 4 : 1
  const stepIndex = STEPS.findIndex((s) => s[0] === route)

  const props = { answers, set, go, result, open, selected: panel?.id, shortlist, toggleShortlist }

  return (
    <>
      <Sakura density={route === 'home' ? 34 : 16} />
      <div className="app">
        <header className="top">
          <button className="brand" onClick={() => go('home')} aria-label={`${BRAND.name} home`}><img src={BRAND.logo} alt={BRAND.name} /></button>
          <nav className="steps" aria-label="Steps">
            {STEPS.map(([id, label], i) => (
              <button key={id} className={route === id ? 'on' : ''} disabled={i >= reached} onClick={() => go(id)}>
                <i>{i + 1}</i>{label}
              </button>
            ))}
            <button className={route === 'why' ? 'on' : ''} onClick={() => go('why')} style={{ marginLeft: 12, borderLeft: '1px solid var(--hair)' }}>Why TsunaGo</button>
          </nav>
        </header>

        {stepIndex >= 0 && (
          <div style={{ height: 1, background: 'var(--hair-2)' }}>
            <motion.div style={{ height: 1, background: 'var(--sakura-deep)' }} animate={{ width: `${((stepIndex + 1) / STEPS.length) * 100}%` }} />
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.main key={route} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }} style={{ flex: 1 }}>
            {route === 'home' && <Home go={go} intro={intro} />}
            {route === 'why' && <Why go={go} />}
            {route === 'profile' && <ProfileStep answers={answers} pick={pick} go={go} />}
            {route === 'needs' && (answers.profile ? <NeedsStep {...props} /> : <ProfileStep answers={answers} pick={pick} go={go} />)}
            {route === 'options' && (answers.profile ? <Options {...props} /> : <ProfileStep answers={answers} pick={pick} go={go} />)}
            {route === 'plan' && (answers.profile ? <Plan {...props} /> : <ProfileStep answers={answers} pick={pick} go={go} />)}
          </motion.main>
        </AnimatePresence>

        <footer className="foot">
          <span>TEAM SHINAZUGAWA · Thapar × JETRO Hackathon</span>
          <span>Prototype · partner profiles are fictional · map data © svg-maps (CC BY 4.0)</span>
        </footer>
      </div>

      {intro !== 'done' && (
        <Intro onReveal={() => setIntro((s) => (s === 'playing' ? 'revealing' : s))} onDone={() => setIntro('done')} />
      )}
      <SidePanel item={livePanel} answers={answers} result={result} onClose={() => setPanel(null)} shortlist={shortlist} toggleShortlist={toggleShortlist} />
    </>
  )
}
