import { motion } from 'framer-motion'

const USPS = [
  ['Connected, not static', 'A report answers once. TsunaGo is a decision model: flip one requirement and partner fit, region rank, price and plan all recompute.'],
  ['Evidence on every claim', 'Each fact shows its source, date and status: verified, claimed or pending. Unknowns become tasks, not hidden assumptions.'],
  ['Hard checks before scores', 'Essential checks (installation, budget, conflicts, customer access) exclude a partner outright. No weighted average can hide a deal-breaker.'],
  ['Bilingual by default', 'Summaries in English and Japanese, so HQ decision-makers in Japan read the same reasoning as the India team.'],
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
      'In three narrow, checkable steps: (1) reading brochures, partner records and official sources to extract capability facts; (2) retrieving the passage that backs each fact; (3) writing the bilingual analyst summary from those facts only.',
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
  return (
    <div className="page">
      <div className="eyebrow">Why TsunaGo</div>
      <h1 className="h1" style={{ fontSize: 'clamp(30px,4vw,48px)' }}>Built to answer the hard questions</h1>
      <p className="lede">A first-time entrant doesn't lack information. It lacks a way to connect it. TsunaGo turns scattered research into one decision, with reasons.</p>

      <div className="grid box usp" style={{ marginTop: 36 }}>
        {USPS.map(([t, d], i) => (
          <motion.div className="cell" key={t} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: (i % 3) * 0.08 }}>
            <span className="num">0{i + 1}</span><h4>{t}</h4><p>{d}</p>
          </motion.div>
        ))}
      </div>

      <h2 className="h2" style={{ marginTop: 64 }}>How TsunaGo compares</h2>
      <p className="small muted">Positioning hypotheses to validate in user testing with SMEs and JETRO advisers.</p>
      <div className="box" style={{ overflowX: 'auto' }}>
        <table className="compare">
          <thead><tr><th /><th>Consultant study</th><th>Ad-hoc desk research</th><th>TsunaGo</th></tr></thead>
          <tbody>{COMPARE.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i} className={i === 3 ? 'us' : ''}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>

      <h2 className="h2" style={{ marginTop: 64 }}>Questions we expect</h2>
      <hr className="rule" style={{ margin: '12px 0 0' }} />
      {QA.map(({ q, a }) => (
        <div className="qa" key={q}>
          <h4>{q}</h4>
          <div>{a.map((p) => <p key={p}>{p}</p>)}</div>
        </div>
      ))}

      <div className="box cell" style={{ marginTop: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="eyebrow">Validate</div>
          <p style={{ margin: '8px 0 0', maxWidth: 640 }}>Pilot test: run TsunaGo next to manual research for the same SMEs and compare speed, quality and evidence coverage. Then test the assisted-assessment fee.</p>
        </div>
        <button className="btn" onClick={() => go('profile')}>Try the flow →</button>
      </div>
    </div>
  )
}
