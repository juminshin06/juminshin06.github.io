import { useEffect, useRef } from 'react'
import styles from './GlobalCursor.module.css'

const FPS_CAP = 33  // ~30fps

function drawPixelCursor(ctx, cx, cy, isHovering, alpha, color) {
  const x    = Math.round(cx)
  const y    = Math.round(cy)
  const half = isHovering ? 4 : 3
  const armL = isHovering ? 11 : 8
  const armW = 2

  ctx.globalAlpha = alpha
  ctx.fillStyle = color
  ctx.imageSmoothingEnabled = false

  ctx.fillRect(x - half, y - half, half * 2, half * 2)
  ctx.fillRect(x - half - armL, y - 1, armL - 1, armW)
  ctx.fillRect(x + half + 1,    y - 1, armL - 1, armW)
  ctx.fillRect(x - 1, y - half - armL, armW, armL - 1)
  ctx.fillRect(x - 1, y + half + 1,    armW, armL - 1)

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
    let mx = -200, my = -200
    let lastMx = -200, lastMy = -200
    let isHovering = false
    let lastTs = 0

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }

    const onMouseMove = (e) => {
      mx = e.clientX
      my = e.clientY
      trails.push({ x: Math.round(mx), y: Math.round(my), alpha: 0.22, size: 2 })
      if (trails.length > 18) trails.shift()

      // Check hover state only on mouse move (not every frame)
      const el = document.elementFromPoint(mx, my)
      isHovering = !!(el && (
        el.closest('a') ||
        el.closest('button') ||
        el.closest('[role="button"]')
      ))
    }

    const spawnRipple = (x, y) => {
      if (ripples.length > 10) return
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
        if (trails.length > 18) trails.shift()
        mx = t.clientX
        my = t.clientY
      }
    }
    const onTouchStart = (e) => {
      for (const t of e.changedTouches) spawnRipple(t.clientX, t.clientY)
    }

    const draw = (ts) => {
      // 30fps cap — only redraw if something changed or ripples/trails active
      const needsRedraw = trails.length > 0 || ripples.length > 0 || mx !== lastMx || my !== lastMy
      if (ts - lastTs < FPS_CAP || !needsRedraw) {
        animId = requestAnimationFrame(draw)
        return
      }
      lastTs = ts
      lastMx = mx
      lastMy = my

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Trail: fading pixel blocks (no save/restore)
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i]
        t.alpha -= 0.022
        if (t.alpha <= 0) { trails.splice(i, 1); continue }
        ctx.globalAlpha = t.alpha
        ctx.fillStyle = '#0A1F14'
        ctx.imageSmoothingEnabled = false
        ctx.fillRect(t.x - t.size, t.y - t.size, t.size * 2, t.size * 2)
      }
      ctx.globalAlpha = 1

      // Ripples: expanding pixel squares (no save/restore)
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        r.radius += r.speed
        r.alpha  -= 0.028
        if (r.alpha <= 0 || r.radius > r.maxRadius) { ripples.splice(i, 1); continue }
        const s = Math.round(r.radius)
        ctx.strokeStyle = `rgba(17, 17, 17, ${r.alpha})`
        ctx.lineWidth = 1.5
        ctx.strokeRect(r.x - s, r.y - s, s * 2, s * 2)
      }

      // Main cursor
      if (mx > -100) {
        const color = isHovering ? '#00D68F' : '#0A1F14'
        drawPixelCursor(ctx, mx, my, isHovering, 1, color)

        if (isHovering) {
          const x = Math.round(mx)
          const y = Math.round(my)
          ctx.strokeStyle = 'rgba(0,0,0,0.40)'
          ctx.lineWidth = 1
          ctx.strokeRect(x - 5, y - 5, 10, 10)
        }
      }

      animId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize',     resize,      { passive: true })
    window.addEventListener('mousemove',  onMouseMove, { passive: true })
    window.addEventListener('click',      onClick)
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    animId = requestAnimationFrame(draw)

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
