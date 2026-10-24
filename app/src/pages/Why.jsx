import { motion } from 'framer-motion'
import { JP_PRESENCE } from '../data/catalog.js'
import { STATE_NAMES } from '../lib/geo.js'
import { useI18n } from '../i18n.jsx'

const USPS = [
  ['Connected, not static', 'A report answers once. TsunaGo is a decision model: flip one requirement and partner fit, region rank, price and plan all recompute.'],
  ['Evidence on every claim', 'Each fact shows its source, date and status: verified, claimed or pending. Unknowns become tasks, not hidden assumptions.'],
  ['Hard checks before scores', 'Essential checks (installation, budget, conflicts, customer access) exclude a partner outright. No weighted average can hide a deal-breaker.'],
  ['Bilingual by default', 'The whole interface and every analyst summary switch between English and Japanese, so HQ in Japan reads the same reasoning as the India team.'],
  ['Pilot, then sustain', 'The output is a dated pilot plan with owners and review-gate KPIs, and TsunaGo keeps tracking partner follow-through after launch.'],
  ['Experts where it matters', 'Legal, tax and customs stay with qualified advisers. TsunaGo hands them a structured brief, so paid expert hours go further.'],
]

const QA = [
  {
    q: 'Why not just hire a consultant or ask JETRO?',
    a: [
      'We complement both. Consultants deliver a fixed snapshot; TsunaGo keeps the decision model live, so SMEs can test "what if we need local installation?" in seconds instead of commissioning a new study.',
      'For JETRO, TsunaGo handles the repetitive first-pass screening, so advisers spend their time on the judgement calls. Every SME arrives with a structured brief, evidence and open questions already listed.',
    ],
  },
  {
    q: 'Where exactly is the AI?',
    a: [
      'Live, in the Analyze page: paste any partner brochure and Claude extracts a structured profile, copying the exact sentence behind every fact. TsunaGo then checks each quote against the source text and flags any it cannot find, so the AI cannot quietly invent a capability.',
      'Ranking itself is transparent rules and math: essential checks, then weighted scores the SME controls. Open the Evidence tab on any partner to see quote → fact → check.',
    ],
  },
  {
    q: 'How does it make money?',
    a: [
      'Free self-serve screening, distributed through JETRO and chambers of commerce. A fixed-fee assisted assessment adds expert review and verified references. Partners pay only to be verified, never to be ranked: ranking stays independent, and that independence is what we sell.',
    ],
  },
  {
    q: 'Why should anyone trust the partner data?',
    a: [
      'Every profile carries a last-verified date and per-fact status. Facts the partner only claims are flagged and turned into pre-pilot checks. Data that has not been re-verified recently loses weight, and pilot outcomes feed back into the partner record.',
    ],
  },
  {
    q: 'Who is liable if a recommendation is wrong?',
    a: [
      'TsunaGo is decision support, not legal or tax advice. Its outputs are options with reasons and unknowns, and every regulated step in the plan is assigned to an expert reviewer.',
    ],
  },
  {
    q: 'Can it scale beyond one sector?',
    a: [
      'The engine is sector-agnostic: industries, checks and cost drivers are data. We start narrow (industrial and inspection equipment) to validate quality, then add sectors and regions as curated data grows.',
    ],
  },
]

const COMPARE = [
  ['Time to a first shortlist', 'Weeks, per study', 'Depends on adviser load', 'Minutes, then verification'],
  ['Re-runs when needs change', 'New engagement', 'New meeting', 'Instant'],
  ['Evidence trail per fact', 'Varies', 'Varies', 'Always: source · date · status'],
  ['Cost to the SME', 'High', 'Low, but capacity-limited', 'Free screen · fixed-fee assisted'],
  ['Ongoing partner tracking', 'Rare', 'Ad hoc', 'Built-in review-gate KPIs'],
]

export default function Why({ go }) {
  const { t } = useI18n()
  return (
    <div className="page">
      <div className="eyebrow">{t('For SMEs, JETRO and judges')}</div>
      <h1 className="h1" style={{ fontSize: 'clamp(30px,4vw,48px)' }}>{t('Why TsunaGo')}</h1>
      <p className="lede">{t("A first-time entrant doesn't lack information. It lacks a way to connect it. TsunaGo turns scattered research into one decision, with reasons.")}</p>

      <div className="grid box usp" style={{ marginTop: 36 }}>
        {USPS.map(([title, d], i) => (
          <motion.div className="cell" key={title} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }}>
            <span className="num">0{i + 1}</span><h4>{t(title)}</h4><p>{t(d)}</p>
          </motion.div>
        ))}
      </div>

      <h2 className="h2" style={{ marginTop: 64 }}>{t('How TsunaGo compares')}</h2>
      <p className="small muted">{t('Positioning hypotheses to validate in user testing with SMEs and JETRO advisers.')}</p>
      <div className="box" style={{ overflowX: 'auto' }}>
        <table className="compare">
          <thead><tr><th /><th>{t('Consultant study')}</th><th>{t('Ad-hoc desk research')}</th><th>TsunaGo</th></tr></thead>
          <tbody>{COMPARE.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 3 ? 'us' : ''}>{t(c)}</td>)}</tr>)}</tbody>
        </table>
      </div>

      <h2 className="h2" style={{ marginTop: 64 }}>{t('Questions we expect')}</h2>
      <hr className="rule" style={{ margin: '12px 0 0' }} />
      {QA.map(({ q, a }) => (
        <div className="qa" key={q}>
          <h4>{t(q)}</h4>
          <div>{a.map((p) => <p key={p}>{t(p)}</p>)}</div>
        </div>
      ))}

      <h2 className="h2" style={{ marginTop: 64 }}>{t('Data behind the prototype')}</h2>
      <div className="box" style={{ overflowX: 'auto' }}>
        <table className="compare">
          <thead><tr><th>{t('Data')}</th><th>{t('Source')}</th><th>{t('Status')}</th></tr></thead>
          <tbody>
            <tr>
              <td>{t('Japanese companies in India: {c} companies, {e} establishments; by state: {s}', { c: JP_PRESENCE.totalCompanies.toLocaleString(), e: JP_PRESENCE.totalEstablishments.toLocaleString(), s: Object.entries(JP_PRESENCE.states).map(([s, v]) => `${t(STATE_NAMES[s])} ${v.companies}`).join(', ') })}</td>
              <td><a href={JP_PRESENCE.url} target="_blank" rel="noreferrer">{JP_PRESENCE.source}</a></td>
              <td>{t('Sourced. Drives the Japan-ecosystem index')}</td>
            </tr>
            <tr><td>{t('Partner extraction from brochures')}</td><td>{t('Claude (live), with every quote checked against the source text')}</td><td>{t('Live AI · demo samples cached offline')}</td></tr>
            <tr><td>{t('Cluster demand, logistics, talent, cost indices')}</td><td>{t('Team estimates')}</td><td>{t('Illustrative · to be replaced')}</td></tr>
            <tr><td>{t('Partner companies')}</td><td>{t('Fictional profiles built to test the logic')}</td><td>{t('Illustrative')}</td></tr>
          </tbody>
        </table>
      </div>

      <div className="box cell" style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow">{t('Validate')}</div>
          <p style={{ margin: '8px 0 0', maxWidth: 640 }}>{t('Pilot test: run TsunaGo next to manual research for the same SMEs and compare speed, quality and evidence coverage. Then test the assisted-assessment fee.')}</p>
        </div>
        <button className="btn" onClick={() => go('profile')}>{t('Try the flow →')}</button>
      </div>
    </div>
  )
}
