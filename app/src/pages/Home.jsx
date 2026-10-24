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
        <motion.div className="eyebrow" {...fade(0)}>India market entry · Japanese SMEs</motion.div>
        <motion.h1 className="h1" {...fade(1)}>Plan your India entry<br />with evidence.</motion.h1>
        <motion.p className="lede" {...fade(2)}>
          Pick a profile, answer six questions, and compare regions and partners side by side.
          Each recommendation shows why it was made and what still needs checking.
        </motion.p>
        <motion.div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }} {...fade(3)}>
          <button className="btn" onClick={() => go('profile')}>Start →</button>
          <button className="btn ghost" onClick={() => go('why')}>Why TsunaGo</button>
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
