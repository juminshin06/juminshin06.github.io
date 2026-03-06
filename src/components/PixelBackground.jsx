import { useEffect, useRef } from 'react'
import styles from './PixelBackground.module.css'

/**
 * PixelBackground — Terra-Labs-style interactive pixel dot canvas.
 *
 * Scattered pixel squares drift slowly across a mint background.
 * Pixels near the cursor wake up: brighter + slightly larger.
 * Canvas is fixed, full-screen, z-index -1 (behind all content).
 */

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

const COUNT  = 160   // total pixel dots
const RADIUS = 130   // mouse activation radius (px)

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

    function mkPixel() {
      return {
        x:         Math.random() * W,
        y:         Math.random() * H,
        baseSize:  1.5 + Math.random() * 3,
        color:     COLORS[Math.floor(Math.random() * COLORS.length)],
        baseAlpha: 0.18 + Math.random() * 0.32,
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

    function draw() {
      ctx.clearRect(0, 0, W, H)

      for (const p of pixels) {
        // Slow drift + wrap
        p.x += p.vx
        p.y += p.vy
        if (p.x < -8) p.x = W + 8
        else if (p.x > W + 8) p.x = -8
        if (p.y < -8) p.y = H + 8
        else if (p.y > H + 8) p.y = -8

        // Mouse proximity
        const dx   = mx - p.x
        const dy   = my - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const t    = dist < RADIUS ? 1 - dist / RADIUS : 0   // 0..1

        const tAlpha = t > 0 ? 0.72 + t * 0.28 : p.baseAlpha
        const tSize  = t > 0 ? p.baseSize * (1 + t * 0.9)   : p.baseSize

        // Lerp toward targets
        p.alpha += (tAlpha - p.alpha) * 0.09
        p.size  += (tSize  - p.size)  * 0.09

        // Draw
        const s  = Math.max(1, Math.round(p.size))
        ctx.globalAlpha = Math.min(1, p.alpha)
        ctx.fillStyle   = p.color
        ctx.fillRect(Math.round(p.x) - s, Math.round(p.y) - s, s * 2, s * 2)
      }

      ctx.globalAlpha = 1
      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize',    resize)
    window.addEventListener('mousemove', onMouseMove)
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('mousemove', onMouseMove)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
