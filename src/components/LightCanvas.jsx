/**
 * LightCanvas — Smooth 3D Aurora Orbs
 *
 * Meta/Apple portfolio-style interactive canvas:
 *   • No grain/noise — pure smooth radial gradients
 *   • 3D card tilt (±20°) tracks mouse position
 *   • 5 floating orbs with parallax depth layers
 *   • Specular highlights per orb respond to mouse light direction
 *   • Cursor spotlight halo
 *   • Click → expanding ripple rings
 *   • Scale + glow intensifies on hover
 */

import { useEffect, useRef } from 'react'
import styles from './LightCanvas.module.css'

const ORBS = [
  { x: 0.30, y: 0.45, r: 0.58, rgb: [130,  75, 255], depth: 1.00 }, // violet  — front
  { x: 0.68, y: 0.38, r: 0.50, rgb: [ 45, 150, 255], depth: 0.65 }, // azure
  { x: 0.52, y: 0.68, r: 0.54, rgb: [255,  70, 145], depth: 0.82 }, // rose
  { x: 0.20, y: 0.62, r: 0.38, rgb: [255, 158,  42], depth: 0.38 }, // amber  — far
  { x: 0.80, y: 0.56, r: 0.46, rgb: [ 40, 205, 168], depth: 0.55 }, // teal
]

export default function LightCanvas() {
  const wrapRef   = useRef(null)
  const canvasRef = useRef(null)
  const stRef     = useRef({
    mx: 0.5, my: 0.5,   // raw mouse (normalised 0–1 inside wrap)
    sx: 0.5, sy: 0.5,   // smoothed mouse
    tx: 0,   ty: 0,     // target tilt (degrees)
    rx: 0,   ry: 0,     // current tilt (degrees)
    inside: false,
    t: 0,
    ripples: [],
    dotGrid: null,      // offscreen canvas for dot grid
  })

  useEffect(() => {
    const wrap   = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas) return

    const ctx = canvas.getContext('2d')
    const st  = stRef.current
    let raf

    // ── Resize ────────────────────────────────────────────────
    const resize = () => {
      canvas.width  = wrap.offsetWidth
      canvas.height = wrap.offsetHeight
      buildDotGrid(canvas.width, canvas.height)
    }

    // Pre-render dot grid once per resize (perf: not per frame)
    const buildDotGrid = (W, H) => {
      const off = document.createElement('canvas')
      off.width = W; off.height = H
      const octx = off.getContext('2d')
      octx.fillStyle = 'rgba(255,255,255,0.09)'
      const spacing = 26
      for (let gx = spacing; gx < W; gx += spacing) {
        for (let gy = spacing; gy < H; gy += spacing) {
          octx.beginPath()
          octx.arc(gx, gy, 1.1, 0, Math.PI * 2)
          octx.fill()
        }
      }
      st.dotGrid = off
    }

    resize()
    window.addEventListener('resize', resize)

    // ── Mouse tracking (from landing section for wide area) ──
    const section = wrap.closest('section') || document.body

    const onMove = (e) => {
      const wr = wrap.getBoundingClientRect()
      const inWrap =
        e.clientX >= wr.left && e.clientX <= wr.right &&
        e.clientY >= wr.top  && e.clientY <= wr.bottom

      if (inWrap) {
        st.mx = (e.clientX - wr.left) / wr.width
        st.my = (e.clientY - wr.top)  / wr.height
        st.inside = true
        st.tx = (st.my - 0.5) * -22
        st.ty = (st.mx - 0.5) *  22
      } else {
        // Gentle influence from section area when not directly on wrap
        const sr = section.getBoundingClientRect()
        const px = (e.clientX - sr.left) / sr.width
        const py = (e.clientY - sr.top)  / sr.height
        st.mx = px * 0.6 + 0.2
        st.my = py * 0.6 + 0.2
        st.inside = false
        st.tx = (py - 0.5) * -6
        st.ty = (px - 0.5) *  6
      }
    }

    const onLeave = () => {
      st.inside = false
      st.tx = 0; st.ty = 0
    }

    const onClick = (e) => {
      const wr = wrap.getBoundingClientRect()
      const inWrap =
        e.clientX >= wr.left && e.clientX <= wr.right &&
        e.clientY >= wr.top  && e.clientY <= wr.bottom
      if (!inWrap) return
      const x = (e.clientX - wr.left) / wr.width
      const y = (e.clientY - wr.top)  / wr.height
      // Three staggered rings for satisfying burst
      st.ripples.push({ x, y, r: 0.00, alpha: 1.00 })
      st.ripples.push({ x, y, r: 0.04, alpha: 0.65 })
      st.ripples.push({ x, y, r: 0.10, alpha: 0.40 })
    }

    section.addEventListener('mousemove', onMove)
    section.addEventListener('mouseleave', onLeave)
    wrap.addEventListener('click', onClick)

    // ── Draw helpers ──────────────────────────────────────────

    const drawOrb = (cx, cy, rad, [r, g, b]) => {
      const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad)
      gr.addColorStop(0.00, `rgba(${r},${g},${b},0.92)`)
      gr.addColorStop(0.30, `rgba(${r},${g},${b},0.68)`)
      gr.addColorStop(0.65, `rgba(${r},${g},${b},0.18)`)
      gr.addColorStop(1.00, `rgba(${r},${g},${b},0.00)`)
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(cx, cy, rad, 0, Math.PI * 2)
      ctx.fillStyle = gr
      ctx.fill()
    }

    const drawSpecular = (cx, cy, rad, lx, ly) => {
      // Bright highlight dot at light-source side of each orb
      const sx = cx + lx * rad * 0.38
      const sy = cy + ly * rad * 0.32
      const sr = rad * 0.30
      const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr)
      sg.addColorStop(0.00, 'rgba(255,255,255,0.90)')
      sg.addColorStop(0.40, 'rgba(255,255,255,0.22)')
      sg.addColorStop(1.00, 'rgba(255,255,255,0.00)')
      ctx.globalCompositeOperation = 'screen'
      ctx.globalAlpha = 1
      ctx.beginPath()
      ctx.arc(sx, sy, sr, 0, Math.PI * 2)
      ctx.fillStyle = sg
      ctx.fill()
    }

    // ── Main loop ─────────────────────────────────────────────
    const loop = () => {
      st.t += 0.005
      const W = canvas.width, H = canvas.height, t = st.t

      // Smooth mouse & tilt
      const lf = 0.07
      st.sx += (st.mx - st.sx) * lf
      st.sy += (st.my - st.sy) * lf
      st.rx += (st.tx - st.rx) * 0.09
      st.ry += (st.ty - st.ry) * 0.09

      // Apply 3D transform + hover scale to wrap
      const sc = st.inside ? 1.02 : 1.0
      wrap.style.transform =
        `perspective(900px) rotateX(${st.rx}deg) rotateY(${st.ry}deg) scale(${sc})`

      // Light vector (−1..1) from smoothed mouse
      const lx = (st.sx - 0.5) * 2
      const ly = (st.sy - 0.5) * 2

      // ── Background ──────────────────────────────────────────
      ctx.globalCompositeOperation = 'source-over'
      ctx.globalAlpha = 1
      const bg = ctx.createRadialGradient(W * 0.42, H * 0.36, 0, W * 0.5, H * 0.5, W * 0.92)
      bg.addColorStop(0, '#170d32')
      bg.addColorStop(1, '#070414')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)

      // Dot grid
      if (st.dotGrid) {
        ctx.globalCompositeOperation = 'source-over'
        ctx.globalAlpha = 1
        ctx.drawImage(st.dotGrid, 0, 0)
      }

      // ── Orbs with parallax depth ─────────────────────────────
      ORBS.forEach((orb, i) => {
        const wave  = Math.sin(t * 0.72 + i * 1.45) * 0.038
        const waveY = Math.cos(t * 0.58 + i * 1.12) * 0.028
        const parX  = (st.sx - 0.5) * orb.depth * 0.16
        const parY  = (st.sy - 0.5) * orb.depth * 0.12
        const cx    = (orb.x + wave  + parX) * W
        const cy    = (orb.y + waveY + parY) * H
        const rad   = orb.r * Math.min(W, H) * (1 + Math.sin(t * 0.42 + i) * 0.04)

        drawOrb(cx, cy, rad, orb.rgb)
        drawSpecular(cx, cy, rad, lx, ly)
      })

      // ── Cursor spotlight ─────────────────────────────────────
      if (st.inside) {
        const mx = st.sx * W, my = st.sy * H
        const mg = ctx.createRadialGradient(mx, my, 0, mx, my, 130)
        mg.addColorStop(0.0, 'rgba(255,255,255,0.28)')
        mg.addColorStop(0.4, 'rgba(255,255,255,0.07)')
        mg.addColorStop(1.0, 'rgba(255,255,255,0.00)')
        ctx.globalCompositeOperation = 'screen'
        ctx.globalAlpha = 1
        ctx.beginPath()
        ctx.arc(mx, my, 130, 0, Math.PI * 2)
        ctx.fillStyle = mg
        ctx.fill()
      }

      // ── Ripple rings ─────────────────────────────────────────
      ctx.globalCompositeOperation = 'source-over'
      st.ripples = st.ripples.filter(rp => rp.alpha > 0.012)
      for (const rp of st.ripples) {
        rp.r    += 0.013
        rp.alpha *= 0.91
        ctx.beginPath()
        ctx.arc(rp.x * W, rp.y * H, rp.r * Math.max(W, H), 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255,255,255,${rp.alpha})`
        ctx.lineWidth   = 1.5
        ctx.stroke()
      }

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)

    return () => {
      cancelAnimationFrame(raf)
      section.removeEventListener('mousemove', onMove)
      section.removeEventListener('mouseleave', onLeave)
      wrap.removeEventListener('click', onClick)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <div ref={wrapRef} className={styles.wrap}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
