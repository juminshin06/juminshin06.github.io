import { useEffect, useRef } from 'react'
import styles from './GlobalCursor.module.css'

/**
 * Pixel-art crosshair cursor.
 * Lime (#C2FF00) on hover, dark (#111) at rest.
 * Square pixel trail + square ripples on click.
 */
function drawPixelCursor(ctx, cx, cy, isHovering, alpha, color) {
  const x    = Math.round(cx)
  const y    = Math.round(cy)
  const half = isHovering ? 4 : 3
  const armL = isHovering ? 11 : 8
  const armW = 2

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.imageSmoothingEnabled = false

  // Center block
  ctx.fillRect(x - half, y - half, half * 2, half * 2)
  // Left arm
  ctx.fillRect(x - half - armL, y - 1, armL - 1, armW)
  // Right arm
  ctx.fillRect(x + half + 1,    y - 1, armL - 1, armW)
  // Top arm
  ctx.fillRect(x - 1, y - half - armL, armW, armL - 1)
  // Bottom arm
  ctx.fillRect(x - 1, y + half + 1,    armW, armL - 1)

  ctx.restore()
  ctx.globalAlpha = 1
}

export default function GlobalCursor() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    const trails  = []
    const ripples = []
    let mx = -200
    let my = -200
    let isHovering = false

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }

    const onMouseMove = (e) => {
      mx = e.clientX
      my = e.clientY
      trails.push({ x: Math.round(mx), y: Math.round(my), alpha: 0.22, size: 2 })
      if (trails.length > 24) trails.shift()
    }

    const spawnRipple = (x, y) => {
      if (ripples.length > 14) return
      for (let i = 0; i < 2; i++) {
        ripples.push({
          x: Math.round(x), y: Math.round(y),
          radius: 3 + i * 4,
          maxRadius: 20 + i * 14,
          alpha: 0.44 - i * 0.12,
          speed: 1.5 + i * 0.4,
        })
      }
    }

    const onClick     = (e) => spawnRipple(e.clientX, e.clientY)
    const onTouchMove = (e) => {
      for (const t of e.touches) {
        trails.push({ x: Math.round(t.clientX), y: Math.round(t.clientY), alpha: 0.22, size: 2 })
        if (trails.length > 24) trails.shift()
        mx = t.clientX
        my = t.clientY
      }
    }
    const onTouchStart = (e) => {
      for (const t of e.changedTouches) spawnRipple(t.clientX, t.clientY)
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (mx > -100) {
        const el = document.elementFromPoint(mx, my)
        isHovering = !!(el && (
          el.closest('a') ||
          el.closest('button') ||
          el.closest('[role="button"]')
        ))
      }

      // Trail: fading pixel blocks
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i]
        t.alpha -= 0.022
        if (t.alpha <= 0) { trails.splice(i, 1); continue }
        ctx.save()
        ctx.imageSmoothingEnabled = false
        ctx.globalAlpha = t.alpha
        ctx.fillStyle = '#0A1F14'
        ctx.fillRect(t.x - t.size, t.y - t.size, t.size * 2, t.size * 2)
        ctx.restore()
        ctx.globalAlpha = 1
      }

      // Ripples: expanding pixel squares
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += r.speed
        r.alpha  -= 0.028
        if (r.alpha <= 0 || r.radius > r.maxRadius) { ripples.splice(i, 1); continue }
        const s = Math.round(r.radius)
        ctx.save()
        ctx.imageSmoothingEnabled = false
        ctx.strokeStyle = `rgba(17, 17, 17, ${r.alpha})`
        ctx.lineWidth = 1.5
        ctx.strokeRect(r.x - s, r.y - s, s * 2, s * 2)
        ctx.restore()
      }

      // Main cursor
      if (mx > -100) {
        const color = isHovering ? '#00D68F' : '#0A1F14'
        drawPixelCursor(ctx, mx, my, isHovering, 1, color)

        // Dark outline ring on hover for contrast
        if (isHovering) {
          const x = Math.round(mx)
          const y = Math.round(my)
          ctx.save()
          ctx.imageSmoothingEnabled = false
          ctx.strokeStyle = 'rgba(0,0,0,0.40)'
          ctx.lineWidth = 1
          ctx.strokeRect(x - 5, y - 5, 10, 10)
          ctx.restore()
        }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize',     resize)
    window.addEventListener('mousemove',  onMouseMove)
    window.addEventListener('click',      onClick)
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize',     resize)
      window.removeEventListener('mousemove',  onMouseMove)
      window.removeEventListener('click',      onClick)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('touchstart', onTouchStart)
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
