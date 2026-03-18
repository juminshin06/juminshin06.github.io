import { useEffect, useRef } from 'react'
import styles from './PixelBackground.module.css'

const COLORS = [
  '#AAFF44',
  '#44E87A',
  '#00C896',
  '#6BFFB8',
  '#C8FF90',
  '#22D87A',
  '#00E5A0',
  '#88FF44',
  '#00D68F',
]

const COUNT     = 169   // 1.3× ambient particles
const RADIUS    = 200
const RADIUS_SQ = RADIUS * RADIUS
const FPS_CAP   = 22   // ~45fps for smoother trail

export default function PixelBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: true })
    ctx.imageSmoothingEnabled = false

    let animId
    let W = 0, H = 0
    let mx = -9999, my = -9999
    const pixels    = []
    const trails    = []
    const fireworks = []
    let lastTs = 0
    let lastTrailX = -9999, lastTrailY = -9999

    function mkPixel(colorIdx) {
      return {
        x:         Math.random() * W,
        y:         Math.random() * H,
        baseSize:  0.8 + Math.random() * 1.8,
        color:     COLORS[colorIdx],
        colorIdx,
        baseAlpha: 0.12 + Math.random() * 0.18,
        alpha:     0,
        size:      0,
        vx:        (Math.random() - 0.5) * 0.12,
        vy:        (Math.random() - 0.5) * 0.12,
      }
    }

    function initPixels() {
      pixels.length = 0
      for (let i = 0; i < COUNT; i++) {
        pixels.push(mkPixel(i % COLORS.length))
      }
      pixels.sort((a, b) => a.colorIdx - b.colorIdx)
    }

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      initPixels()
    }

    const onMouseClick = (e) => {
      const cx = e.clientX
      const cy = e.clientY
      const count = 8 + Math.floor(Math.random() * 5)
      for (let i = 0; i < count; i++) {
        const angle  = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
        const speed  = 1.8 + Math.random() * 3.2
        const color  = COLORS[Math.floor(Math.random() * COLORS.length)]
        const size   = 1.2 + Math.random() * 2.8
        fireworks.push({
          x:     cx + (Math.random() - 0.5) * 5,
          y:     cy + (Math.random() - 0.5) * 5,
          vx:    Math.cos(angle) * speed,
          vy:    Math.sin(angle) * speed,
          size,
          alpha: 0.8 + Math.random() * 0.2,
          color,
          decay: 0.020 + Math.random() * 0.012,
          gravity: 0.06 + Math.random() * 0.04,
        })
      }
    }

    const onMouseMove = (e) => {
      mx = e.clientX
      my = e.clientY

      // Spawn trail particles on mouse move
      const dx = mx - lastTrailX
      const dy = my - lastTrailY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist > 6) {
        const count = Math.min(4, Math.floor(dist / 6))
        for (let i = 0; i < count; i++) {
          trails.push({
            x:     mx + (Math.random() - 0.5) * 8,
            y:     my + (Math.random() - 0.5) * 8,
            vx:    (Math.random() - 0.5) * 1.8,
            vy:    (Math.random() - 0.5) * 1.8 - 0.4,
            size:  0.8 + Math.random() * 2.0,
            alpha: 0.75 + Math.random() * 0.25,
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
            decay: 0.035 + Math.random() * 0.03,
          })
        }
        lastTrailX = mx
        lastTrailY = my
      }
    }

    function draw(ts) {
      if (ts - lastTs < FPS_CAP) {
        animId = requestAnimationFrame(draw)
        return
      }
      lastTs = ts

      ctx.clearRect(0, 0, W, H)

      // ── Ambient particles ──────────────────────────────────
      let currentColor = null

      for (const p of pixels) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -8) p.x = W + 8
        else if (p.x > W + 8) p.x = -8
        if (p.y < -8) p.y = H + 8
        else if (p.y > H + 8) p.y = -8

        const dx     = mx - p.x
        const dy     = my - p.y
        const distSq = dx * dx + dy * dy

        let tAlpha, tSize
        if (distSq < RADIUS_SQ) {
          const t = 1 - Math.sqrt(distSq) / RADIUS
          tAlpha  = 0.65 + t * 0.35
          tSize   = p.baseSize * (1 + t * 1.4)
        } else {
          tAlpha = p.baseAlpha
          tSize  = p.baseSize
        }

        p.alpha += (tAlpha - p.alpha) * 0.09
        p.size  += (tSize  - p.size)  * 0.09

        if (p.alpha < 0.01) continue

        if (p.color !== currentColor) {
          ctx.fillStyle = p.color
          currentColor  = p.color
        }

        const s = Math.max(1, Math.round(p.size))
        ctx.globalAlpha = Math.min(1, p.alpha)
        ctx.fillRect(Math.round(p.x) - s, Math.round(p.y) - s, s * 2, s * 2)
      }

      // ── Mouse trail particles ──────────────────────────────
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i]
        t.x     += t.vx
        t.y     += t.vy
        t.vy    -= 0.025   // gentle upward float
        t.alpha -= t.decay
        if (t.alpha <= 0) { trails.splice(i, 1); continue }

        ctx.globalAlpha = Math.min(1, t.alpha)
        ctx.fillStyle   = t.color
        ctx.beginPath()
        ctx.arc(t.x, t.y, t.size, 0, Math.PI * 2)
        ctx.fill()
      }

      // ── Firework burst particles ───────────────────────────
      for (let i = fireworks.length - 1; i >= 0; i--) {
        const f = fireworks[i]
        f.x      += f.vx
        f.y      += f.vy
        f.vy     += f.gravity   // gravity pulls down
        f.vx     *= 0.97        // slight air resistance
        f.alpha  -= f.decay
        f.size   *= 0.985       // slight shrink
        if (f.alpha <= 0) { fireworks.splice(i, 1); continue }

        ctx.globalAlpha = Math.min(1, f.alpha)
        ctx.fillStyle   = f.color
        const s = Math.max(1, Math.round(f.size))
        ctx.fillRect(Math.round(f.x) - s, Math.round(f.y) - s, s * 2, s * 2)
      }

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize',    resize,        { passive: true })
    window.addEventListener('mousemove', onMouseMove,   { passive: true })
    window.addEventListener('click',     onMouseClick)
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('click',     onMouseClick)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
