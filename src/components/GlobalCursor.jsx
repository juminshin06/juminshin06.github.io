import { useEffect, useRef } from 'react'
import styles from './GlobalCursor.module.css'

/**
 * Draw a geometric flower with N diamond petals.
 *   size     – outer tip radius
 *   rot      – current rotation in radians
 *   alpha    – global opacity
 *   filled   – fill vs stroke
 *   color    – css color string
 */
function drawFlower(ctx, cx, cy, size, rot, alpha, filled, color) {
  const PETALS    = 8
  const TIP       = size
  const SHOULDER  = size * 0.44   // how far back the wide point is
  const HALF_W    = size * 0.24   // half-width at the shoulder
  const INNER     = size * 0.10   // inner pinch point near center

  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  ctx.globalAlpha = alpha

  for (let i = 0; i < PETALS; i++) {
    ctx.save()
    ctx.rotate((Math.PI * 2 / PETALS) * i)

    ctx.beginPath()
    ctx.moveTo(0, -TIP)               // outer tip
    ctx.lineTo(HALF_W, -SHOULDER)     // right shoulder
    ctx.lineTo(0, -INNER)             // inner pinch
    ctx.lineTo(-HALF_W, -SHOULDER)    // left shoulder
    ctx.closePath()

    if (filled) {
      ctx.fillStyle = color
      ctx.fill()
    } else {
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.stroke()
    }
    ctx.restore()
  }

  // Center disc
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.18, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()

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
    const trails  = []  // { x, y, alpha, size, rot }
    const ripples = []  // { x, y, radius, maxRadius, alpha, speed, delay, waited }
    let mx = -200
    let my = -200
    let rot = 0
    let isHovering = false

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }

    // ── Event handlers ───────────────────────────────────

    const onMouseMove = (e) => {
      mx = e.clientX
      my = e.clientY
      trails.push({ x: mx, y: my, alpha: 0.22, size: 7, rot })
      if (trails.length > 36) trails.shift()
    }

    const spawnRipple = (x, y) => {
      if (ripples.length > 20) return
      for (let i = 0; i < 2; i++) {
        ripples.push({
          x, y,
          radius:    3,
          maxRadius: 22 + i * 16,
          alpha:     0.50 - i * 0.14,
          speed:     1.3 + i * 0.3,
          delay:     i * 7,
          waited:    0,
        })
      }
    }

    const onClick     = (e) => spawnRipple(e.clientX, e.clientY)
    const onTouchMove = (e) => {
      for (const t of e.touches) {
        trails.push({ x: t.clientX, y: t.clientY, alpha: 0.22, size: 7, rot })
        if (trails.length > 36) trails.shift()
        mx = t.clientX
        my = t.clientY
      }
    }
    const onTouchStart = (e) => {
      for (const t of e.changedTouches) spawnRipple(t.clientX, t.clientY)
    }

    // ── Draw loop ────────────────────────────────────────

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Hover detection (in rAF to avoid layout thrash on mousemove)
      if (mx > -100) {
        const el = document.elementFromPoint(mx, my)
        isHovering = !!(el && (
          el.closest('a') ||
          el.closest('button') ||
          el.closest('[role="button"]')
        ))
      }

      // Rotation: gentle spin, doubles speed on hover
      rot += isHovering ? 0.045 : 0.014

      // ── Trail: fading mini-flowers ──────────────────────
      for (let i = trails.length - 1; i >= 0; i--) {
        const t = trails[i]
        t.alpha -= 0.014
        t.size  *= 0.93
        if (t.alpha <= 0) { trails.splice(i, 1); continue }
        drawFlower(ctx, t.x, t.y, t.size, t.rot, t.alpha, true, '#111111')
      }

      // ── Ripples ─────────────────────────────────────────
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i]
        if (r.waited < r.delay) { r.waited++; continue }
        r.radius += r.speed
        r.alpha  -= 0.024
        if (r.alpha <= 0 || r.radius > r.maxRadius) { ripples.splice(i, 1); continue }
        ctx.beginPath()
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(17, 17, 17, ${r.alpha})`
        ctx.lineWidth   = 1.2
        ctx.stroke()
      }

      // ── Main flower cursor ───────────────────────────────
      if (mx > -100) {
        const size = isHovering ? 19 : 13
        drawFlower(ctx, mx, my, size, rot, 1, true, '#111111')
      }

      animId = requestAnimationFrame(draw)
    }

    // ── Init ─────────────────────────────────────────────

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
      window.removeEventListener('touchmove',  onTouchMove,  { passive: true })
      window.removeEventListener('touchstart', onTouchStart, { passive: true })
    }
  }, [])

  return <canvas ref={canvasRef} className={styles.canvas} aria-hidden="true" />
}
