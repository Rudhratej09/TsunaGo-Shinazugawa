import { useEffect, useRef } from 'react'

// Petal path in a unit box, notched at the tip like a real sakura petal.
function drawPetal(ctx, size) {
  ctx.beginPath()
  ctx.moveTo(0, size * 0.5)
  ctx.bezierCurveTo(-size * 0.55, size * 0.15, -size * 0.45, -size * 0.45, -size * 0.08, -size * 0.5)
  ctx.lineTo(0, -size * 0.36)
  ctx.lineTo(size * 0.08, -size * 0.5)
  ctx.bezierCurveTo(size * 0.45, -size * 0.45, size * 0.55, size * 0.15, 0, size * 0.5)
  ctx.closePath()
}

export default function Sakura({ density = 26 }) {
  const ref = useRef(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    let w, h, raf
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const resize = () => {
      w = canvas.width = window.innerWidth * dpr
      h = canvas.height = window.innerHeight * dpr
      canvas.style.width = window.innerWidth + 'px'
      canvas.style.height = window.innerHeight + 'px'
    }
    resize()
    window.addEventListener('resize', resize)

    const make = (initial) => ({
      x: Math.random() * w,
      y: initial ? Math.random() * h : -20 * dpr,
      s: (16 + Math.random() * 18) * dpr,
      vy: (0.35 + Math.random() * 0.55) * dpr,
      vx: (0.15 + Math.random() * 0.35) * dpr,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.02,
      flip: Math.random() * Math.PI * 2,
      vf: 0.01 + Math.random() * 0.025,
      sway: Math.random() * Math.PI * 2,
      tone: Math.random(),
      ex: 0, // extra velocity from the pointer, decays each frame
      ey: 0,
      spin: 0,
    })
    const petals = Array.from({ length: density }, () => make(true))

    // The canvas ignores pointer events so the page stays clickable; track the pointer on window instead.
    const ptr = { x: 0, y: 0, vx: 0, vy: 0, active: false }
    const onMove = (e) => {
      const x = e.clientX * dpr
      const y = e.clientY * dpr
      if (ptr.active) {
        ptr.vx = x - ptr.x
        ptr.vy = y - ptr.y
      }
      ptr.x = x
      ptr.y = y
      ptr.active = true
    }
    const onLeave = () => { ptr.active = false }
    // A click sends nearby petals flying.
    const onDown = (e) => {
      const x = e.clientX * dpr
      const y = e.clientY * dpr
      const R = 240 * dpr
      for (const p of petals) {
        const dx = p.x - x
        const dy = p.y - y
        const d = Math.hypot(dx, dy) || 1
        if (d > R) continue
        const f = (1 - d / R) * 14 * dpr
        p.ex += (dx / d) * f
        p.ey += (dy / d) * f - 2 * dpr
        p.spin += (Math.random() - 0.5) * 0.4
      }
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)

    let t = 0
    const tick = () => {
      t += 1
      ctx.clearRect(0, 0, w, h)
      const wind = Math.sin(t / 400) * 0.4 * dpr
      const R = 150 * dpr
      for (const p of petals) {
        // Near the pointer, petals are pushed away and dragged along with its movement.
        if (ptr.active) {
          const dx = p.x - ptr.x
          const dy = p.y - ptr.y
          const d = Math.hypot(dx, dy) || 1
          if (d < R) {
            const f = (1 - d / R) ** 2
            p.ex += (dx / d) * f * 1.6 * dpr + ptr.vx * f * 0.12
            p.ey += (dy / d) * f * 1.6 * dpr + ptr.vy * f * 0.12
            p.spin += f * 0.03 * Math.sign(dx * ptr.vy - dy * ptr.vx || 1)
          }
        }
        p.sway += 0.012
        p.x += p.vx + wind + Math.sin(p.sway) * 0.4 * dpr + p.ex
        p.y += p.vy + p.ey
        p.ex *= 0.94
        p.ey *= 0.94
        p.rot += p.vr + p.spin
        p.spin *= 0.95
        p.flip += p.vf + Math.min(0.2, Math.hypot(p.ex, p.ey) * 0.01)
        if (p.y > h + 30 || p.x > w + 30 || p.x < -60 * dpr || p.y < -200 * dpr) Object.assign(p, make(false), { x: Math.random() * w * 0.9 - w * 0.1 })
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.scale(Math.max(0.15, Math.abs(Math.cos(p.flip))), 1)
        const g = ctx.createLinearGradient(0, -p.s / 2, 0, p.s / 2)
        g.addColorStop(0, p.tone > 0.5 ? '#f7c9d5' : '#f4b7c7')
        g.addColorStop(1, '#fdeef2')
        ctx.fillStyle = g
        ctx.globalAlpha = 0.85
        drawPetal(ctx, p.s)
        ctx.fill()
        ctx.restore()
      }
      ptr.vx *= 0.8
      ptr.vy *= 0.8
      raf = requestAnimationFrame(tick)
    }
    const onVis = () => {
      cancelAnimationFrame(raf)
      if (!document.hidden) raf = requestAnimationFrame(tick)
    }
    document.addEventListener('visibilitychange', onVis)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      document.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
    }
  }, [density])

  return <canvas id="sakura" ref={ref} aria-hidden="true" />
}
