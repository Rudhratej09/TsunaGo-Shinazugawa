import { motion } from 'framer-motion'

const FLOW = [
  ['Choose your profile', 'Product · sector · starting point'],
  ['Set your priorities', 'Budget · partner · service · timing'],
  ['Compare entry options', 'Reasons · evidence · open checks'],
  ['Plan the first pilot', 'Owners · milestones · next steps'],
]

const fade = (i) => ({ initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { delay: 0.1 + i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] } })

export default function Home({ go }) {
  return (
    <div className="page">
      <section className="hero">
        <div>
          <motion.div className="eyebrow" {...fade(0)}>India market entry for Japanese SMEs</motion.div>
          <motion.h1 className="h1" {...fade(1)}>Connect every decision<br />before your first<br />Indian sale.</motion.h1>
          <motion.p className="lede" {...fade(2)}>
            TsunaGo <span className="jp">繋ぐ</span> links region, partner, price and service choices in one model.
            Change one answer and every recommendation, cost and next step updates, with evidence attached.
          </motion.p>
          <motion.div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }} {...fade(3)}>
            <button className="btn" onClick={() => go('profile')}>Begin entry plan →</button>
            <button className="btn ghost" onClick={() => go('why')}>Why TsunaGo</button>
          </motion.div>
        </div>
        <motion.div className="hero-mark" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }}>
          <span className="corner" style={{ top: 14, left: 16 }}>Japan</span>
          <span className="corner" style={{ bottom: 14, right: 16 }}>India</span>
          <span className="corner" style={{ top: 14, right: 16 }}>No. 01</span>
          <span className="kanji">繋</span>
          <svg viewBox="0 0 100 100" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} aria-hidden="true">
            <motion.line x1="6" y1="94" x2="94" y2="6" stroke="#111" strokeWidth="0.25" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.8, delay: 0.4 }} />
          </svg>
        </motion.div>
      </section>

      <motion.div className="grid box flow" {...fade(4)}>
        {FLOW.map(([t, d], i) => (
          <div className="cell" key={t}>
            <span className="num">0{i + 1}</span>
            <h4>{t}</h4>
            <p>{d}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
