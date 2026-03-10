import { useEffect, useRef } from 'react'
import styles from './PixelBackground.module.css'

const COLORS = [
  '#AAFF44', // bright lime-yellow
  '#44E87A', // medium green
  '#00C896', // teal-green
  '#6BFFB8', // light mint
  '#C8FF90', // pale lime
  '#22D87A', // vivid green
  '#00E5A0', // bright teal
  '#88FF44', // yellow-green
  '#00D68F', // accent green
]

const COUNT     = 80    // reduced from 160 for performance
const RADIUS    = 130
const RADIUS_SQ = RADIUS * RADIUS
const FPS_CAP   = 33    // ~30fps

export default function PixelBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    ctx.imageSmoothingEnabled = false

    let animId
    let W = 0, H = 0
    let mx = -9999, my = -9999
    const pixels = []
    let textRects = []
    let frameCount = 0
    let lastTs = 0

    function updateTextRects() {
      const els = document.querySelectorAll('h1, h2, h3, p, a, button, [class*="title"], [class*="hero"], [class*="name"], [class*="label"]')
      textRects = Array.from(els).map(el => {
        const r = el.getBoundingClientRect()
        return { x1: r.left - 28, y1: r.top - 10, x2: r.right + 28, y2: r.bottom + 10 }
      }).filter(r => r.x2 > 0 && r.y2 > 0 && r.x1 < W && r.y1 < H)
    }

    function isNearText(x, y) {
      for (const r of textRects) {
        if (x >= r.x1 && x <= r.x2 && y >= r.y1 && y <= r.y2) return true
      }
      return false
    }

    function mkPixel() {
      return {
        x:         Math.random() * W,
        y:         Math.random() * H,
        baseSize:  1.5 + Math.random() * 3,
        color:     COLORS[Math.floor(Math.random() * COLORS.length)],
        baseAlpha: 0.07 + Math.random() * 0.14,
        alpha:     0,
        size:      0,
        vx:        (Math.random() - 0.5) * 0.10,
        vy:        (Math.random() - 0.5) * 0.10,
      }
    }

    function initPixels() {
      pixels.length = 0
      for (let i = 0; i < COUNT; i++) pixels.push(mkPixel())
    }

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      initPixels()
    }

    const onMouseMove = (e) => { mx = e.clientX; my = e.clientY }

    function draw(ts) {
      // 30fps cap
      if (ts - lastTs < FPS_CAP) {
        animId = requestAnimationFrame(draw)
        return
      }
      lastTs = ts

      frameCount++
      // Update text rects less frequently (every 60 frames ≈ every 2s at 30fps)
      if (frameCount % 60 === 0) updateTextRects()

      ctx.clearRect(0, 0, W, H)

      for (const p of pixels) {
        p.x += p.vx
        p.y += p.vy
        if (p.x < -8) p.x = W + 8
        else if (p.x > W + 8) p.x = -8
        if (p.y < -8) p.y = H + 8
        else if (p.y > H + 8) p.y = -8

        const nearText = isNearText(p.x, p.y)
        const effectiveBase = nearText ? p.baseAlpha * 0.12 : p.baseAlpha

        const dx    = mx - p.x
        const dy    = my - p.y
        const distSq = dx * dx + dy * dy

        let tAlpha, tSize
        if (distSq < RADIUS_SQ) {
          const t  = 1 - Math.sqrt(distSq) / RADIUS
          tAlpha = 0.50 + t * 0.22
          tSize  = p.baseSize * (1 + t * 0.9)
        } else {
          tAlpha = effectiveBase
          tSize  = p.baseSize
        }

        p.alpha += (tAlpha - p.alpha) * 0.09
        p.size  += (tSize  - p.size)  * 0.09

        const s = Math.max(1, Math.round(p.size))
        ctx.globalAlpha = Math.min(1, p.alpha)
        ctx.fillStyle   = p.color
        ctx.fillRect(Math.round(p.x) - s, Math.round(p.y) - s, s * 2, s * 2)
      }

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize',    resize,    { passive: true })
    window.addEventListener('mousemove', onMouseMove, { passive: true })
    animId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
