import { useMemo } from 'react'
import { motion } from 'framer-motion'
import india from '@svg-maps/india'
import { project, STATE_NAMES } from '../lib/geo.js'

const PETAL = 'M0 5 C-5.5 1.5 -4.5 -4.5 -0.8 -5 L0 -3.6 L0.8 -5 C4.5 -4.5 5.5 1.5 0 5Z'

// Deterministic pseudo-random so petals don't jump between renders.
function rng(seed) {
  let s = 0
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296)
}

// Rough state boxes (from the map's own geometry) used to scatter petals before clipping to the state outline.
const BOXES = {
  an: [503, 521, 36, 174], ap: [179, 428, 167, 142], ar: [489, 190, 123, 67], as: [450, 226, 132, 90], br: [317, 237, 104, 75],
  ch: [178, 158, 3, 3], ct: [252, 317, 87, 142], dn: [99, 401, 6, 7], dd: [52, 387, 5, 7], dl: [181, 205, 10, 11],
  ga: [115, 502, 14, 20], gj: [0, 303, 132, 104], hr: [131, 155, 66, 79], hp: [155, 97, 71, 71], jk: [93, 0, 160, 122],
  jh: [317, 288, 97, 77], ka: [124, 444, 94, 149], kl: [140, 567, 53, 96], ld: [82, 590, 33, 73], mp: [122, 252, 184, 133],
  mh: [93, 364, 172, 142], mn: [519, 280, 37, 43], ml: [453, 270, 62, 25], mz: [504, 307, 25, 59], nl: [526, 248, 40, 43],
  or: [276, 352, 128, 106], py: [240, 481, 56, 128], pb: [119, 114, 64, 74], rj: [27, 173, 184, 167], sk: [415, 223, 19, 25],
  tn: [168, 551, 86, 117], tg: [189, 411, 95, 90], tr: [481, 307, 25, 36], up: [186, 168, 158, 154], ut: [196, 142, 72, 67],
  wb: [369, 244, 85, 131],
}

// Label placement per cluster so nearby hubs (Gurugram/Neemrana, Bengaluru/Chennai) don't collide.
const LABEL = {
  pune: { dx: -9, dy: 4, anchor: 'end' }, chennai: { dx: 9, dy: 4, anchor: 'start' },
  bengaluru: { dx: -9, dy: 4, anchor: 'end' }, ncr: { dx: 9, dy: -2, anchor: 'start' },
  neemrana: { dx: -9, dy: 6, anchor: 'end' }, ahmedabad: { dx: -9, dy: 4, anchor: 'end' },
}

export default function IndiaMap({ presence = {}, hq, clusters = [], highlightClusters = [], height = 420, animateKey, markers = [], onStateClick, selected }) {
  const petals = useMemo(() => {
    const out = []
    Object.entries(presence).forEach(([state, strength]) => {
      const box = BOXES[state]
      if (!box) return
      const r = rng(state + (animateKey || ''))
      const area = Math.max(box[2] * box[3], 400)
      const n = Math.round(Math.min(40, Math.max(6, area / 520)) * (0.45 + strength * 0.75))
      for (let i = 0; i < n; i++) {
        out.push({
          state, key: state + i,
          x: box[0] + r() * box[2], y: box[1] + r() * box[3],
          rot: r() * 360, s: 1.4 + r() * 1.8, delay: 0.15 + r() * 0.9 + i * 0.004,
          fill: r() > 0.45 ? '#f3b4c4' : '#f8d3dd',
        })
      }
    })
    return out
  }, [presence, animateKey])

  const hqXY = hq && hq.lon != null ? project(hq.lon, hq.lat) : null

  return (
    <svg viewBox="-70 -10 700 716" preserveAspectRatio="xMidYMid meet" style={{ width: '100%', height, display: 'block' }} role="img"
      className={onStateClick ? 'india-map interactive' : 'india-map'}
      aria-label={`Map of India highlighting ${Object.keys(presence).map((s) => STATE_NAMES[s]).join(', ') || 'no states'}`}>
      <defs>
        {Object.keys(presence).map((id) => {
          const loc = india.locations.find((l) => l.id === id)
          return loc ? <clipPath id={`clip-${id}-${animateKey}`} key={id}><path d={loc.path} /></clipPath> : null
        })}
      </defs>

      {india.locations.map((l) => {
        const on = presence[l.id] != null
        return (
          <path key={l.id} d={l.path} fill={on ? '#fdf0f4' : '#fff'} stroke="#111" strokeWidth={selected === l.id ? 2 : on ? 0.9 : 0.45}
            strokeLinejoin="round" className={`state ${selected === l.id ? 'sel' : ''}`}
            onClick={onStateClick ? () => onStateClick(l.id) : undefined}>
            <title>{STATE_NAMES[l.id]}{on ? ` · presence ${Math.round(presence[l.id] * 100)}%` : ''}</title>
          </path>
        )
      })}

      {Object.keys(presence).map((id) => (
        <g key={id} clipPath={`url(#clip-${id}-${animateKey})`}>
          {petals.filter((p) => p.state === id).map((p) => (
            <motion.path key={p.key} d={PETAL} fill={p.fill} stroke="#d76f8c" strokeWidth={0.25}
              initial={{ x: p.x - 14, y: p.y - 70, rotate: p.rot - 140, opacity: 0, scale: p.s }}
              animate={{ x: p.x, y: p.y, rotate: p.rot, opacity: 0.95, scale: p.s }}
              whileHover={{ scale: p.s * 1.7, rotate: p.rot + 70, y: p.y - 6, transition: { type: 'spring', stiffness: 300, damping: 12 } }}
              transition={{ duration: 1.5, delay: p.delay, ease: [0.22, 1, 0.36, 1] }} />
          ))}
        </g>
      ))}

      {selected && india.locations.filter((l) => l.id === selected).map((l) => (
        <path key="sel" d={l.path} fill="none" stroke="#d76f8c" strokeWidth={2.4} strokeLinejoin="round" pointerEvents="none" />
      ))}

      {clusters.map((c) => {
        const [x, y] = project(c.lon, c.lat)
        const hot = highlightClusters.includes(c.id)
        return (
          <g key={c.id}>
            <circle cx={x} cy={y} r={hot ? 6 : 4} fill="#fff" stroke="#111" strokeWidth={hot ? 1.4 : 0.8} />
            {hot && <circle cx={x} cy={y} r={2} fill="#111" />}
            <text x={x + (LABEL[c.id]?.dx ?? 9)} y={y + (LABEL[c.id]?.dy ?? 4)} textAnchor={LABEL[c.id]?.anchor ?? 'start'}
              fontSize={hot ? 16 : 13} fontWeight={hot ? 500 : 400} fontFamily="Inter, sans-serif" fill={hot ? '#111' : '#888'}
              style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3.5 }}>{c.name.split(' – ')[0]}</text>
          </g>
        )
      })}

      {markers.filter((m) => m.lon != null).map((m, i) => {
        const [x, y] = project(m.lon, m.lat)
        return (
          <motion.g key={m.id || i} initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 + i * 0.12, type: 'spring', stiffness: 260, damping: 18 }}
            style={{ transformOrigin: `${x}px ${y}px` }}>
            <circle cx={x} cy={y} r={7} fill={m.ok ? '#d76f8c' : '#fff'} stroke={m.ok ? '#fff' : '#b8323f'} strokeWidth={1.6} />
            <text x={x + 10} y={y - 8} fontSize={13} fontWeight={500} fontFamily="Inter, sans-serif" fill="#111"
              style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3.5 }}>{m.label}</text>
          </motion.g>
        )
      })}

      {hqXY && (
        <g>
          <motion.circle cx={hqXY[0]} cy={hqXY[1]} r={14} fill="none" stroke="#b8323f" strokeWidth={1}
            initial={{ scale: 0.4, opacity: 0.9 }} animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut' }} style={{ transformOrigin: `${hqXY[0]}px ${hqXY[1]}px` }} />
          <rect x={hqXY[0] - 4.5} y={hqXY[1] - 4.5} width={9} height={9} fill="#b8323f" transform={`rotate(45 ${hqXY[0]} ${hqXY[1]})`} />
          <text x={hqXY[0]} y={hqXY[1] + 24} textAnchor="middle" fontSize={15} fontWeight={600} fill="#b8323f" fontFamily="Inter, sans-serif"
            style={{ paintOrder: 'stroke', stroke: '#fff', strokeWidth: 3 }}>HQ · {hq.city}</text>
        </g>
      )}
    </svg>
  )
}
