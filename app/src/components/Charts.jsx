import { motion } from 'framer-motion'

export function ScoreRing({ value, size = 140, label = 'Fit score', tone = '#111' }) {
  const r = size / 2 - 8
  const c = 2 * Math.PI * r
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label} ${value} of 100`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(17,17,17,.1)" strokeWidth={1} />
      {Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2 - Math.PI / 2
        return <line key={i} x1={size / 2 + Math.cos(a) * (r + 4)} y1={size / 2 + Math.sin(a) * (r + 4)}
          x2={size / 2 + Math.cos(a) * (r + (i % 10 ? 6 : 8))} y2={size / 2 + Math.sin(a) * (r + (i % 10 ? 6 : 8))} stroke="#111" strokeWidth={0.6} opacity={0.5} />
      })}
      <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={tone} strokeWidth={3}
        strokeDasharray={c} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c * (1 - value / 100) }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }} transform={`rotate(-90 ${size / 2} ${size / 2})`} strokeLinecap="butt" />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontFamily="Cinzel, serif" fontSize={size * 0.3}>{value}</text>
      <text x="50%" y={size / 2 + size * 0.22} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize={11} letterSpacing="2" fill="#6e6e6e">{label.toUpperCase()}</text>
    </svg>
  )
}

export function Radar({ data, size = 220 }) {
  const keys = Object.keys(data)
  const pad = 46
  const cx = size / 2 + pad, cy = size / 2, r = size / 2 - 30
  const pt = (i, v) => {
    const a = (i / keys.length) * Math.PI * 2 - Math.PI / 2
    return [cx + Math.cos(a) * r * (v / 100), cy + Math.sin(a) * r * (v / 100)]
  }
  const poly = keys.map((k, i) => pt(i, data[k].value).join(',')).join(' ')
  return (
    <svg width="100%" viewBox={`0 0 ${size + pad * 2} ${size}`} style={{ maxWidth: size + pad * 2 }} role="img" aria-label="Capability profile">
      {[25, 50, 75, 100].map((lv) => (
        <polygon key={lv} points={keys.map((_, i) => pt(i, lv).join(',')).join(' ')} fill="none" stroke="#111" strokeOpacity={lv === 100 ? 0.6 : 0.12} strokeWidth={0.7} />
      ))}
      {keys.map((k, i) => {
        const [x, y] = pt(i, 100)
        const [lx, ly] = pt(i, 122)
        return (
          <g key={k}>
            <line x1={cx} y1={cy} x2={x} y2={y} stroke="#111" strokeOpacity={0.12} />
            <text x={lx} y={ly} textAnchor={Math.abs(lx - cx) < 4 ? 'middle' : lx > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11.5} fontFamily="Inter, sans-serif" fill="#3a3a3a">{data[k].label}</text>
          </g>
        )
      })}
      <motion.polygon points={poly} fill="#f3bccb" fillOpacity={0.45} stroke="#d76f8c" strokeWidth={1.2}
        initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ transformOrigin: `${cx}px ${cy}px` }}
        transition={{ duration: 0.8 }} />
      {keys.map((k, i) => {
        const [x, y] = pt(i, data[k].value)
        return <circle key={k} cx={x} cy={y} r={2.5} fill="#111" />
      })}
    </svg>
  )
}

const TONES = { exworks: '#111', landing: '#555', margin: '#f3bccb', service: '#d76f8c', training: '#bbb', profit: '#fff' }

export function StackedBar({ parts }) {
  const total = parts.reduce((s, p) => s + p.value, 0)
  return (
    <div>
      <div style={{ display: 'flex', height: 26, border: '1px solid #111' }}>
        {parts.map((p) => (
          <motion.div key={p.id} title={`${p.label}: ₹${p.value.toFixed(1)}L`} layout
            style={{ width: `${(p.value / total) * 100}%`, background: TONES[p.id], borderRight: '1px solid #111' }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px 18px', marginTop: 12, fontSize: 14.5 }}>
        {parts.map((p) => (
          <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
            <span><i style={{ display: 'inline-block', width: 10, height: 10, background: TONES[p.id], border: '1px solid #111', marginRight: 7, verticalAlign: -1 }} />{p.label}</span>
            <b style={{ fontWeight: 500 }}>₹{p.value.toFixed(1)}L · {Math.round((p.value / total) * 100)}%</b>
          </div>
        ))}
      </div>
    </div>
  )
}
