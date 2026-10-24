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
      s: (8 + Math.random() * 9) * dpr,
      vy: (0.35 + Math.random() * 0.55) * dpr,
      vx: (0.15 + Math.random() * 0.35) * dpr,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.02,
      flip: Math.random() * Math.PI * 2,
      vf: 0.01 + Math.random() * 0.025,
      sway: Math.random() * Math.PI * 2,
      tone: Math.random(),
    })
    const petals = Array.from({ length: density }, () => make(true))

    let t = 0
    const tick = () => {
      t += 1
      ctx.clearRect(0, 0, w, h)
      const wind = Math.sin(t / 400) * 0.4 * dpr
      for (const p of petals) {
        p.sway += 0.012
        p.x += p.vx + wind + Math.sin(p.sway) * 0.4 * dpr
        p.y += p.vy
        p.rot += p.vr
        p.flip += p.vf
        if (p.y > h + 30 || p.x > w + 30) Object.assign(p, make(false), { x: Math.random() * w * 0.9 - w * 0.1 })
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
    }
  }, [density])

  return <canvas id="sakura" ref={ref} aria-hidden="true" />
}
