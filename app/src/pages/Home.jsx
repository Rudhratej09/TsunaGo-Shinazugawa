import { motion } from 'framer-motion'
import { BRAND } from '../brand.js'
import { useI18n } from '../i18n.jsx'

const FLOW = [
  ['Choose your profile', 'Product · sector · starting point'],
  ['Set your priorities', 'Budget · partner · service · timing'],
  ['Compare entry options', 'Reasons · evidence · open checks'],
  ['Plan the first pilot', 'Owners · milestones · next steps'],
]

export default function Home({ go, intro = 'done' }) {
  const { t } = useI18n()
  const shown = intro !== 'playing'
  const fade = (i) => ({
    initial: { opacity: 0, y: 16 },
    animate: shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { delay: 0.25 + i * 0.08, duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  })
  return (
    <div className="page">
      <section className="hero">
        <div>
          <motion.div className="eyebrow" {...fade(0)}>{t('India market entry · Japanese SMEs')}</motion.div>
          <motion.h1 className="h1" {...fade(1)}>{t('Plan your India entry with evidence.')}</motion.h1>
          <motion.p className="lede" {...fade(2)}>
            {t('Pick a profile, answer six questions, and compare regions and partners side by side. Each recommendation shows why it was made and what still needs checking.')}
          </motion.p>
          <motion.div style={{ display: 'flex', gap: 12, marginTop: 30, flexWrap: 'wrap' }} {...fade(3)}>
            <button className="btn" onClick={() => go('profile')}>{t('Start →')}</button>
            <button className="btn ghost" onClick={() => go('why')}>{t('Why TsunaGo')}</button>
          </motion.div>
        </div>
        {/* The intro animation lands the logo exactly on this element. */}
        <img data-logo-target className="hero-logo" src={BRAND.logo} alt={BRAND.name}
          style={{ opacity: intro === 'done' ? 1 : 0 }} />
      </section>

      <motion.div className="grid box flow" {...fade(4)}>
        {FLOW.map(([title, d], i) => (
          <div className="cell" key={title}>
            <span className="num">0{i + 1}</span>
            <h4>{t(title)}</h4>
            <p>{t(d)}</p>
          </div>
        ))}
      </motion.div>
    </div>
  )
}
