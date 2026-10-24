// Prototype dataset. Cluster descriptions are general public knowledge; every index is an
// illustrative 0–100 score for the demo, not a measured statistic. All partner companies are
// FICTIONAL and exist only to demonstrate the matching logic.

export const INDUSTRIES = [
  { id: 'auto', label: 'Automotive components', ja: '自動車部品' },
  { id: 'electronics', label: 'Electronics & EMS', ja: '電子機器' },
  { id: 'machinery', label: 'Machinery & machine tools', ja: '機械・工作機械' },
  { id: 'pharma', label: 'Pharmaceuticals', ja: '医薬品' },
  { id: 'food', label: 'Food processing', ja: '食品加工' },
]

export const PROFILES = [
  {
    id: 'first',
    title: 'First-time exporter',
    ja: '初めての輸出',
    need: 'A first local sales partner',
    blurb: 'Strong product at home, no India contacts yet. Needs a credible first partner and a small pilot.',
    defaults: { industry: 'auto', budget: 'limited', localInstall: false, ownService: true, presence: 'none', timing: '6m' },
  },
  {
    id: 'equipment',
    title: 'Equipment manufacturer',
    ja: '装置メーカー',
    need: 'Installation and after-sales support',
    blurb: 'Inspection or production equipment that must be installed, calibrated and serviced on site.',
    defaults: { industry: 'auto', budget: 'limited', localInstall: true, ownService: false, presence: 'none', timing: '6m' },
  },
  {
    id: 'expander',
    title: 'Regional expander',
    ja: '地域拡大',
    need: 'An additional Indian market',
    blurb: 'Already selling in one Indian region. Wants to know where to grow next and with whom.',
    defaults: { industry: 'electronics', budget: 'moderate', localInstall: true, ownService: true, presence: 'customers', timing: '12m' },
  },
]

export const BUDGETS = [
  { id: 'limited', label: 'Limited initial commitment', capLakh: 40 },
  { id: 'moderate', label: 'Moderate · dedicated pilot budget', capLakh: 90 },
  { id: 'committed', label: 'Committed · multi-year entry', capLakh: 250 },
]

export const TIMINGS = [
  { id: '6m', label: 'Pilot within six months', weeks: 26 },
  { id: '12m', label: 'Pilot within a year', weeks: 52 },
  { id: '18m', label: 'Exploratory · 18 months', weeks: 78 },
]

export const PRESENCE = [
  { id: 'none', label: 'No local operation' },
  { id: 'office', label: 'Liaison office only' },
  { id: 'customers', label: 'Existing customers in one region' },
]

export const PRIORITIES = [
  { id: 'reach', label: 'Customer access', hint: 'Partner already sells to my buyers' },
  { id: 'technical', label: 'Technical capability', hint: 'Install, calibrate, repair locally' },
  { id: 'cost', label: 'Cost to serve', hint: 'Margins, fees and commitments' },
  { id: 'speed', label: 'Speed to pilot', hint: 'Responsiveness and readiness' },
  { id: 'japan', label: 'Japan experience', hint: 'Has worked with Japanese principals' },
]

// Japanese corporate presence by state. Source: Embassy of Japan in India & JETRO,
// "List of Japanese Companies in India" (as of October 2024). `checked: false` marks figures
// transcribed from secondary reporting that still need checking against the PDF.
export const JP_PRESENCE = {
  source: 'Embassy of Japan in India & JETRO, List of Japanese Companies in India (as of Oct 2024)',
  url: 'https://www.in.emb-japan.go.jp/files/100867260.pdf',
  totalCompanies: 1434,
  totalEstablishments: 5205,
  states: {
    hr: { companies: 394, checked: true },
    dl: { companies: 144, checked: true },
    mh: { companies: 248, checked: false },
    ka: { companies: 234, checked: false },
    tn: { companies: 182, checked: false },
    gj: { companies: 40, checked: false },
  },
}

// Each cluster lists the states whose Japanese companies it draws on.
const JP_STATES = { pune: ['mh'], chennai: ['tn'], ncr: ['hr', 'dl'], neemrana: ['rj'], ahmedabad: ['gj'], bengaluru: ['ka'] }
const JP_MAX = Math.log1p(394 + 144)

// Japan-ecosystem index: log-scaled company count (diminishing returns), or null where no figure exists.
export function japanIndex(clusterId) {
  const states = JP_STATES[clusterId].filter((s) => JP_PRESENCE.states[s])
  if (!states.length) return null
  const n = states.reduce((t, s) => t + JP_PRESENCE.states[s].companies, 0)
  return { value: Math.round((100 * Math.log1p(n)) / JP_MAX), companies: n, checked: states.every((s) => JP_PRESENCE.states[s].checked), states }
}

export const CLUSTERS = [
  {
    id: 'pune', name: 'Pune – Chakan', state: 'mh', lon: 73.86, lat: 18.52,
    demand: { auto: 92, electronics: 55, machinery: 85, pharma: 50, food: 45 },
    japan: 78, logistics: 74, talent: 84, cost: 62,
    note: 'Dense automotive and engineering supplier base; established Japanese OEM and tier-1 presence.',
  },
  {
    id: 'chennai', name: 'Chennai – Sriperumbudur', state: 'tn', lon: 79.95, lat: 12.97,
    demand: { auto: 90, electronics: 88, machinery: 70, pharma: 40, food: 45 },
    japan: 85, logistics: 86, talent: 80, cost: 66,
    note: 'Automotive and electronics corridor with port access and a long Japanese manufacturing history.',
  },
  {
    id: 'ncr', name: 'Gurugram – Manesar', state: 'hr', lon: 76.94, lat: 28.36,
    demand: { auto: 94, electronics: 60, machinery: 65, pharma: 45, food: 55 },
    japan: 88, logistics: 72, talent: 78, cost: 55,
    note: 'Major car and two-wheeler hub near Delhi; many Japanese-affiliated suppliers.',
  },
  {
    id: 'neemrana', name: 'Neemrana', state: 'rj', lon: 76.38, lat: 27.99,
    demand: { auto: 70, electronics: 45, machinery: 60, pharma: 30, food: 40 },
    japan: 95, logistics: 64, talent: 60, cost: 74,
    note: 'Dedicated Japanese industrial zone on the Delhi–Mumbai corridor; smaller but highly familiar with Japanese firms.',
  },
  {
    id: 'ahmedabad', name: 'Ahmedabad – Sanand', state: 'gj', lon: 72.37, lat: 22.99,
    demand: { auto: 72, electronics: 52, machinery: 66, pharma: 88, food: 62 },
    japan: 66, logistics: 78, talent: 70, cost: 72,
    note: 'Growing automotive base plus strong pharma and chemicals clusters.',
  },
  {
    id: 'bengaluru', name: 'Bengaluru – Hosur', state: 'ka', lon: 77.59, lat: 12.97,
    demand: { auto: 70, electronics: 86, machinery: 82, pharma: 55, food: 50 },
    japan: 70, logistics: 68, talent: 92, cost: 52,
    note: 'Electronics, aerospace and machine-tool hub with deep engineering talent.',
  },
]

// status: verified = checked against a reference or document; claimed = partner states it; pending = not yet checked
export const PARTNERS = [
  {
    id: 'deccan', name: 'Deccan Precision Distributors', type: 'Distributor',
    hq: { city: 'Pune', state: 'mh', lon: 73.86, lat: 18.52 },
    presence: { mh: 1, gj: 0.6, ka: 0.4 }, clusters: ['pune', 'ahmedabad'],
    industries: { auto: 90, electronics: 40, machinery: 80, pharma: 20, food: 15 },
    engineers: 4, install: false, calibration: false, responseHours: 24,
    japanPrincipals: 2, minCommitLakh: 15, marginPct: 22, serviceFeePct: 0, years: 19,
    conflict: null,
    references: [
      { label: 'Tier-1 brake components supplier, Chakan', status: 'verified' },
      { label: 'Forging company, Pune', status: 'claimed' },
    ],
    evidence: [
      { source: 'Partner brochure', date: '2026-06', quote: 'Our 11-member sales team calls on 300+ auto component plants across Pune, Nashik and Aurangabad.', fact: 'Sales coverage: 300+ auto component plants in Maharashtra', check: 'industry', status: 'claimed' },
      { source: 'Partner brochure', date: '2026-06', quote: 'Installation and repairs are coordinated with the principal’s engineers.', fact: 'No in-house installation team', check: 'install', status: 'verified' },
      { source: 'Reference call', date: '2026-08', quote: 'They brought us three demos in a month.', fact: 'Responsive demo scheduling', check: 'speed', status: 'verified' },
    ],
    lastVerified: '2026-08',
  },
  {
    id: 'coromandel', name: 'Coromandel Metrology Systems', type: 'Integrator',
    hq: { city: 'Chennai', state: 'tn', lon: 80.27, lat: 13.08 },
    presence: { tn: 1, ka: 0.6, ap: 0.4, tg: 0.4 }, clusters: ['chennai', 'bengaluru'],
    industries: { auto: 82, electronics: 78, machinery: 60, pharma: 30, food: 20 },
    engineers: 18, install: true, calibration: true, responseHours: 12,
    japanPrincipals: 3, minCommitLakh: 30, marginPct: 18, serviceFeePct: 8, years: 14,
    conflict: null,
    references: [
      { label: 'Electronics contract manufacturer, Sriperumbudur', status: 'verified' },
      { label: 'Two-wheeler tier-1, Hosur', status: 'verified' },
    ],
    evidence: [
      { source: 'Partner brochure', date: '2026-05', quote: '18 field engineers trained on CMM, vision and gauge systems; on-site within 12 hours in Tamil Nadu.', fact: '18 field engineers · 12h on-site response', check: 'install', status: 'verified' },
      { source: 'Accreditation register', date: '2026-07', quote: 'Calibration laboratory accreditation listed for dimensional metrology.', fact: 'Accredited calibration lab', check: 'technical', status: 'verified' },
      { source: 'Partner brochure', date: '2026-05', quote: 'We represent three Japanese measurement brands.', fact: '3 Japanese principals', check: 'conflict', status: 'claimed' },
    ],
    lastVerified: '2026-07',
  },
  {
    id: 'aravalli', name: 'Aravalli Industrial Solutions', type: 'Distributor',
    hq: { city: 'Gurugram', state: 'hr', lon: 77.03, lat: 28.46 },
    presence: { hr: 1, dl: 0.8, rj: 0.5, up: 0.5, pb: 0.4 }, clusters: ['ncr', 'neemrana'],
    industries: { auto: 95, electronics: 45, machinery: 60, pharma: 25, food: 30 },
    engineers: 2, install: false, calibration: false, responseHours: 36,
    japanPrincipals: 4, minCommitLakh: 20, marginPct: 25, serviceFeePct: 0, years: 23,
    conflict: 'Carries a competing Japanese vision-inspection brand',
    references: [
      { label: 'Car OEM supplier park, Manesar', status: 'verified' },
    ],
    evidence: [
      { source: 'Partner brochure', date: '2026-04', quote: 'Preferred channel for leading two-wheeler and car suppliers in Manesar and Bawal.', fact: 'Deep NCR automotive access', check: 'industry', status: 'verified' },
      { source: 'Partner website', date: '2026-04', quote: 'Authorised distributor for [competing inspection brand].', fact: 'Competing principal in same category', check: 'conflict', status: 'verified' },
    ],
    lastVerified: '2026-04',
  },
  {
    id: 'sabarmati', name: 'Sabarmati TechServe', type: 'Integrator',
    hq: { city: 'Ahmedabad', state: 'gj', lon: 72.57, lat: 23.02 },
    presence: { gj: 1, mh: 0.5, rj: 0.3 }, clusters: ['ahmedabad', 'pune'],
    industries: { auto: 62, electronics: 40, machinery: 66, pharma: 88, food: 55 },
    engineers: 9, install: true, calibration: true, responseHours: 18,
    japanPrincipals: 1, minCommitLakh: 18, marginPct: 17, serviceFeePct: 7, years: 11,
    conflict: null,
    references: [
      { label: 'Pharma packaging line, Ahmedabad', status: 'verified' },
      { label: 'Auto stamping plant, Sanand', status: 'pending' },
    ],
    evidence: [
      { source: 'Partner brochure', date: '2026-03', quote: 'Validated installation (IQ/OQ) for regulated pharma customers.', fact: 'Regulated-industry installation experience', check: 'install', status: 'verified' },
      { source: 'Partner brochure', date: '2026-03', quote: 'Growing automotive practice in Sanand.', fact: 'Automotive practice still early', check: 'industry', status: 'claimed' },
    ],
    lastVerified: '2026-03',
  },
  {
    id: 'kaveri', name: 'Kaveri Automation Partners', type: 'Integrator',
    hq: { city: 'Bengaluru', state: 'ka', lon: 77.59, lat: 12.97 },
    presence: { ka: 1, tn: 0.7, tg: 0.4, kl: 0.3 }, clusters: ['bengaluru', 'chennai'],
    industries: { auto: 70, electronics: 92, machinery: 78, pharma: 35, food: 25 },
    engineers: 14, install: true, calibration: false, responseHours: 16,
    japanPrincipals: 2, minCommitLakh: 35, marginPct: 20, serviceFeePct: 9, years: 9,
    conflict: null,
    references: [
      { label: 'EMS plant, Electronics City', status: 'verified' },
      { label: 'Aerospace machining shop, Bengaluru', status: 'claimed' },
    ],
    evidence: [
      { source: 'Partner brochure', date: '2026-07', quote: 'Our 14 application engineers commission inspection and automation cells end-to-end.', fact: '14 application engineers · end-to-end commissioning', check: 'install', status: 'verified' },
      { source: 'Partner brochure', date: '2026-07', quote: 'Calibration services through a third-party lab.', fact: 'Calibration outsourced', check: 'technical', status: 'claimed' },
    ],
    lastVerified: '2026-07',
  },
  {
    id: 'nippon', name: 'Neemrana Nippon Link', type: 'JV candidate',
    hq: { city: 'Neemrana', state: 'rj', lon: 76.38, lat: 27.99 },
    presence: { rj: 1, hr: 0.7, dl: 0.5 }, clusters: ['neemrana', 'ncr'],
    industries: { auto: 80, electronics: 50, machinery: 70, pharma: 20, food: 35 },
    engineers: 6, install: true, calibration: false, responseHours: 20,
    japanPrincipals: 7, minCommitLakh: 60, marginPct: 15, serviceFeePct: 10, years: 8,
    conflict: null,
    references: [
      { label: 'Japanese die-casting affiliate, Neemrana', status: 'verified' },
      { label: 'Japanese bearings affiliate, Neemrana', status: 'verified' },
    ],
    evidence: [
      { source: 'Partner brochure', date: '2026-02', quote: 'Bilingual staff; we host shared warehousing and service desks for seven Japanese SMEs.', fact: 'Bilingual · 7 Japanese SME clients · shared warehousing', check: 'japan', status: 'verified' },
      { source: 'Term sheet', date: '2026-02', quote: 'Minimum 3-year shared-services agreement.', fact: 'Higher minimum commitment', check: 'budget', status: 'verified' },
    ],
    lastVerified: '2026-02',
  },
  {
    id: 'bharat', name: 'Bharat Quality Instruments', type: 'Distributor',
    hq: { city: 'Mumbai', state: 'mh', lon: 72.88, lat: 19.08 },
    presence: { mh: 0.8, gj: 0.5, dl: 0.5, tn: 0.4, ka: 0.4, wb: 0.4, tg: 0.3 }, clusters: ['pune', 'chennai', 'ncr', 'ahmedabad'],
    industries: { auto: 60, electronics: 55, machinery: 65, pharma: 60, food: 50 },
    engineers: 3, install: false, calibration: false, responseHours: 48,
    japanPrincipals: 1, minCommitLakh: 12, marginPct: 28, serviceFeePct: 0, years: 31,
    conflict: null,
    references: [
      { label: 'Steel tube manufacturer, Thane', status: 'claimed' },
    ],
    evidence: [
      { source: 'Partner brochure', date: '2025-11', quote: 'Seven branch offices covering all major industrial states.', fact: 'Broad national footprint', check: 'industry', status: 'claimed' },
      { source: 'Reference call', date: '2026-01', quote: 'Good catalogue reach, but they rarely visit for technical issues.', fact: 'Shallow technical support', check: 'install', status: 'verified' },
    ],
    lastVerified: '2026-01',
  },
  {
    id: 'godavari', name: 'Godavari Engineering Services', type: 'Service contractor',
    hq: { city: 'Hyderabad', state: 'tg', lon: 78.49, lat: 17.39 },
    presence: { tg: 1, ap: 0.7, ka: 0.4 }, clusters: ['bengaluru'],
    industries: { auto: 45, electronics: 60, machinery: 70, pharma: 75, food: 50 },
    engineers: 22, install: true, calibration: true, responseHours: 10,
    japanPrincipals: 0, minCommitLakh: 10, marginPct: 0, serviceFeePct: 12, years: 12,
    conflict: null,
    references: [
      { label: 'Pharma API plant, Hyderabad', status: 'verified' },
    ],
    evidence: [
      { source: 'Partner brochure', date: '2026-06', quote: 'Installation, AMC and calibration only — we do not sell equipment.', fact: 'Service-only: needs a separate sales channel', check: 'industry', status: 'verified' },
    ],
    lastVerified: '2026-06',
  },
  {
    id: 'narmada', name: 'Narmada Industrial Agencies', type: 'Distributor',
    hq: { city: 'Indore', state: 'mp', lon: 75.86, lat: 22.72 },
    presence: { mp: 1, mh: 0.4, gj: 0.3 }, clusters: ['ahmedabad'],
    industries: { auto: 55, electronics: 25, machinery: 60, pharma: 45, food: 65 },
    engineers: 2, install: false, calibration: false, responseHours: 30,
    japanPrincipals: 0, minCommitLakh: 8, marginPct: 24, serviceFeePct: 0, years: 16,
    conflict: null,
    references: [{ label: 'Auto ancillary, Pithampur', status: 'pending' }],
    evidence: [
      { source: 'Partner brochure', date: '2026-01', quote: 'Serving Pithampur and Dewas industrial areas.', fact: 'Regional reach in Madhya Pradesh', check: 'industry', status: 'claimed' },
    ],
    lastVerified: '2026-01',
  },
  {
    id: 'konkan', name: 'Konkan Manufacturing Group', type: 'JV candidate',
    hq: { city: 'Pune', state: 'mh', lon: 73.75, lat: 18.65 },
    presence: { mh: 1, ka: 0.4, gj: 0.3 }, clusters: ['pune'],
    industries: { auto: 85, electronics: 35, machinery: 88, pharma: 15, food: 10 },
    engineers: 25, install: true, calibration: true, responseHours: 14,
    japanPrincipals: 1, minCommitLakh: 180, marginPct: 12, serviceFeePct: 6, years: 27,
    conflict: null,
    references: [{ label: 'Machine builder export programme', status: 'claimed' }],
    evidence: [
      { source: 'Investor deck', date: '2026-05', quote: 'Seeking a technology partner for local assembly of inspection systems.', fact: 'Open to JV with local assembly', check: 'budget', status: 'claimed' },
    ],
    lastVerified: '2026-05',
  },
]

// Replace the illustrative Japan index with the sourced one wherever a figure exists.
for (const c of CLUSTERS) {
  const jp = japanIndex(c.id)
  c.japanSource = jp
  if (jp) c.japan = jp.value
}

export const DATASET_NOTE =
  'Japan-presence index uses Embassy of Japan & JETRO company counts (Oct 2024). Demand, logistics, talent and cost indices are illustrative. Partner profiles are fictional.'
