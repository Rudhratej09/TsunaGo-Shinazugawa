import { useEffect, useRef, useState } from 'react'
import { BRAND } from '../brand.js'

// Opening sequence: the logo starts zoomed in, a river of sakura petals sweeps across
// the screen (Senbonzakura-style), and under its cover the logo shrinks into its
// home-page slot ([data-logo-target]) while the white overlay dissolves.
const T = { logoIn: 0, stormStart: 500, stormEnd: 1900, fly: 1500, flyDur: 1000, end: 3400 }

const TONES = ['#f7c6d3', '#f3b0c2', '#fbdbe4', '#e98aa5', '#fde9ef']

function petalSprite(color) {
  const c = document.createElement('canvas')
  c.width = c.height = 64
  const x = c.getContext('2d')
  x.translate(32, 32)
  const s = 56
  x.beginPath()
  x.moveTo(0, s * 0.5)
  x.bezierCurveTo(-s * 0.55, s * 0.15, -s * 0.45, -s * 0.45, -s * 0.08, -s * 0.5)
  x.lineTo(0, -s * 0.34)
  x.lineTo(s * 0.08, -s * 0.5)
  x.bezierCurveTo(s * 0.45, -s * 0.45, s * 0.55, s * 0.15, 0, s * 0.5)
  x.closePath()
  const g = x.createLinearGradient(0, -s / 2, 0, s / 2)
  g.addColorStop(0, color)
  g.addColorStop(1, '#fff5f8')
  x.fillStyle = g
  x.fill()
  x.strokeStyle = 'rgba(200, 90, 120, .35)'
  x.lineWidth = 1.2
  x.stroke()
  return c
}

const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function Intro({ onReveal, onDone }) {
  const canvasRef = useRef(null)
  const logoRef = useRef(null)
  const overlayRef = useRef(null)
  const [ready, setReady] = useState(false)
  const done = useRef(false)

  const finish = () => {
    if (done.current) return
    done.current = true
    onReveal()
    onDone()
  }

  // Wait for the logo so its natural size is known (fallback after 1.5s).
  useEffect(() => {
    const img = new Image()
    const go = () => setReady(true)
    img.onload = go
    img.onerror = go
    img.src = BRAND.logo
    const t = setTimeout(go, 1500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!ready) return
    const canvas = canvasRef.current
    const logo = logoRef.current
    const overlay = overlayRef.current
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const W = window.innerWidth, H = window.innerHeight
    canvas.width = W * dpr
    canvas.height = H * dpr
    canvas.style.width = W + 'px'
    canvas.style.height = H + 'px'
    ctx.scale(dpr, dpr)

    const sprites = TONES.map(petalSprite)
    const count = Math.round(Math.min(4200, Math.max(1500, (W * H) / 330)))
    const span = T.stormEnd - T.stormStart
    const petals = Array.from({ length: count }, () => {
      const lane = (Math.random() + Math.random() + Math.random()) / 3 - 0.5 // bell-shaped spread across the river
      return {
        te: T.stormStart + Math.random() * span,
        speed: (1.15 + Math.random() * 0.8) * Math.max(W, 900) / 1000, // px per ms
        lane: lane * 2.2,
        phase: Math.random() * Math.PI * 2,
        size: 14 + Math.random() * 30,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.02,
        flip: Math.random() * Math.PI * 2,
        vf: 0.008 + Math.random() * 0.02,
        sprite: sprites[(Math.random() * sprites.length) | 0],
        alpha: 0.75 + Math.random() * 0.25,
      }
    })

    // Logo geometry: start centred and zoomed in, end on the home-page slot.
    const lw = logo.offsetWidth || 400
    const lh = logo.offsetHeight || 80
    const startScale = Math.min((W * 0.86) / lw, (H * 0.5) / lh)
    let target = null

    // River centre line: sweeps from lower-left to upper-right with a slow S-curve.
    const path = (d, phase) => {
      const x = -W * 0.25 + d
      const p = x / W
      const y = H * (0.82 - 0.62 * p) + Math.sin(p * Math.PI * 1.6 + phase * 0.15) * H * 0.16
      return [x, y, -0.62 * H / W + Math.cos(p * Math.PI * 1.6) * 0.5]
    }

    let raf
    const t0 = performance.now()
    const frame = (now) => {
      const t = now - t0

      // --- logo ---
      if (t < T.fly) {
        const k = Math.min(1, t / 700)
        const s = startScale * (1.25 - 0.25 * easeInOut(k))
        logo.style.opacity = String(easeInOut(k))
        logo.style.transform = `translate(-50%, -50%) scale(${s})`
      } else {
        if (!target) {
          const el = document.querySelector('[data-logo-target]')
          const r = el?.getBoundingClientRect()
          target = r && r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2, s: r.width / lw } : { x: W / 2, y: H / 2, s: 1 }
          onReveal()
        }
        const k = easeInOut(Math.min(1, (t - T.fly) / T.flyDur))
        const x = W / 2 + (target.x - W / 2) * k
        const y = H / 2 + (target.y - H / 2) * k
        const s = startScale + (target.s - startScale) * k
        logo.style.left = x + 'px'
        logo.style.top = y + 'px'
        logo.style.transform = `translate(-50%, -50%) scale(${s})`
        overlay.style.opacity = String(1 - Math.min(1, (t - T.fly) / 500))
      }

      // --- petal river ---
      ctx.clearRect(0, 0, W, H)
      const fadeOut = t > T.end - 600 ? Math.max(0, (T.end - t) / 600) : 1
      for (const p of petals) {
        if (t < p.te) continue
        const d = (t - p.te) * p.speed
        const [cx, cy, slope] = path(d, p.phase)
        if (cx > W + 80) continue
        // offset perpendicular to the stream, widening as it travels, with a spiral wobble
        const nx = -slope, ny = 1, nl = Math.hypot(nx, ny)
        const width = H * (0.22 + 0.3 * Math.min(1, d / W))
        const wob = Math.sin(d / 90 + p.phase) * 18
        const off = p.lane * width + wob
        const x = cx + (nx / nl) * off
        const y = cy + (ny / nl) * off
        p.rot += p.vr * 16
        p.flip += p.vf * 16
        ctx.save()
        ctx.globalAlpha = p.alpha * fadeOut
        ctx.translate(x, y)
        ctx.rotate(p.rot + d / 300)
        ctx.scale(Math.max(0.2, Math.abs(Math.cos(p.flip))), 1)
        ctx.drawImage(p.sprite, -p.size / 2, -p.size / 2, p.size, p.size)
        ctx.restore()
      }

      if (t >= T.end) return finish()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])

  return (
    <div className="intro" onClick={finish} role="presentation">
      <div ref={overlayRef} className="intro-bg" />
      <img ref={logoRef} className="intro-logo" src={BRAND.logo} alt={BRAND.name} style={{ opacity: 0 }} />
      <canvas ref={canvasRef} className="intro-canvas" aria-hidden="true" />
      <button className="intro-skip" onClick={finish}>Skip</button>
    </div>
  )
}
