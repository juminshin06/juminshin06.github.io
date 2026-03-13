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

const COUNT     = 55    // fewer particles
const RADIUS    = 130
const RADIUS_SQ = RADIUS * RADIUS
const FPS_CAP   = 33   // ~30fps

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
    const pixels = []
    let lastTs = 0

    function mkPixel(colorIdx) {
      return {
        x:         Math.random() * W,
        y:         Math.random() * H,
        baseSize:  1.5 + Math.random() * 3,
        color:     COLORS[colorIdx],
        colorIdx,
        baseAlpha: 0.07 + Math.random() * 0.14,
        alpha:     0,
        size:      0,
        vx:        (Math.random() - 0.5) * 0.10,
        vy:        (Math.random() - 0.5) * 0.10,
      }
    }

    function initPixels() {
      pixels.length = 0
      for (let i = 0; i < COUNT; i++) {
        pixels.push(mkPixel(i % COLORS.length))
      }
      // Sort by color index so fillStyle changes are batched (9 changes instead of 55)
      pixels.sort((a, b) => a.colorIdx - b.colorIdx)
    }

    function resize() {
      W = canvas.width  = window.innerWidth
      H = canvas.height = window.innerHeight
      initPixels()
    }

    const onMouseMove = (e) => { mx = e.clientX; my = e.clientY }

    function draw(ts) {
      if (ts - lastTs < FPS_CAP) {
        animId = requestAnimationFrame(draw)
        return
      }
      lastTs = ts

      ctx.clearRect(0, 0, W, H)

      let currentColor = null

      for (const p of pixels) {
        // Drift + wrap
        p.x += p.vx
        p.y += p.vy
        if (p.x < -8) p.x = W + 8
        else if (p.x > W + 8) p.x = -8
        if (p.y < -8) p.y = H + 8
        else if (p.y > H + 8) p.y = -8

        // Mouse proximity (skip sqrt for far pixels)
        const dx     = mx - p.x
        const dy     = my - p.y
        const distSq = dx * dx + dy * dy

        let tAlpha, tSize
        if (distSq < RADIUS_SQ) {
          const t = 1 - Math.sqrt(distSq) / RADIUS
          tAlpha  = 0.50 + t * 0.22
          tSize   = p.baseSize * (1 + t * 0.9)
        } else {
          tAlpha = p.baseAlpha
          tSize  = p.baseSize
        }

        p.alpha += (tAlpha - p.alpha) * 0.09
        p.size  += (tSize  - p.size)  * 0.09

        // Skip invisible pixels entirely
        if (p.alpha < 0.01) continue

        // Batch fillStyle by color (sorted at init)
        if (p.color !== currentColor) {
          ctx.fillStyle = p.color
          currentColor  = p.color
        }

        const s = Math.max(1, Math.round(p.size))
        ctx.globalAlpha = Math.min(1, p.alpha)
        ctx.fillRect(Math.round(p.x) - s, Math.round(p.y) - s, s * 2, s * 2)
      }

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize',    resize,      { passive: true })
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
