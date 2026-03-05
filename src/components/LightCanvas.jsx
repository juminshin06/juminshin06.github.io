/**
 * LightCanvas — Grainy Organic Blobs
 *
 * Pastel soft blobs on white/light background · animated film-grain ·
 * mouse-driven 3D lighting (offset radial gradient + specular highlight).
 * Fully transparent canvas, no rectangular frame.
 *
 * Interactions:
 *   • Mouse → shifts light source (3D highlight moves across blobs)
 *   • Auto-drifts when cursor is outside
 *   • Perlin noise → organic position + scale + angle animation
 *   • Click → bright flash pulse
 */

import { useEffect, useRef } from 'react'
import p5 from 'p5'
import styles from './LightCanvas.module.css'

export default function LightCanvas() {
  const containerRef = useRef(null)
  const p5Ref        = useRef(null)

  useEffect(() => {
    if (!containerRef.current || p5Ref.current) return

    const sketch = (p) => {
      let grainCv, grainCtx
      let flashA = 0
      let smX = 0, smY = 0   // smoothed light vector  −1..1

      // ── Blob config ─────────────────────────────────────────
      // Lighter pastel values so they read beautifully on a white background
      const BLOBS = [
        { nx: 0.38, ny: 0.50, rw: 0.58, rh: 0.36, ang: -0.35, rgb: [200, 155, 255], a: 0.62, ns:  0 },
        { nx: 0.64, ny: 0.44, rw: 0.50, rh: 0.31, ang:  0.62, rgb: [140, 205, 255], a: 0.58, ns: 17 },
        { nx: 0.50, ny: 0.62, rw: 0.42, rh: 0.52, ang:  1.12, rgb: [255, 170, 210], a: 0.58, ns: 34 },
        { nx: 0.25, ny: 0.53, rw: 0.36, rh: 0.32, ang: -0.82, rgb: [255, 224, 140], a: 0.52, ns: 51 },
        { nx: 0.73, ny: 0.55, rw: 0.42, rh: 0.46, ang:  0.28, rgb: [150, 232, 208], a: 0.55, ns: 68 },
        { nx: 0.49, ny: 0.36, rw: 0.46, rh: 0.27, ang: -0.18, rgb: [255, 198, 162], a: 0.56, ns: 85 },
      ]

      // ── Film grain (half-res for performance) ───────────────
      function initGrain(W, H) {
        grainCv        = document.createElement('canvas')
        grainCv.width  = Math.ceil(W / 2)
        grainCv.height = Math.ceil(H / 2)
        grainCtx       = grainCv.getContext('2d')
        updateGrain()
      }

      function updateGrain() {
        const w = grainCv.width, h = grainCv.height
        const id = grainCtx.createImageData(w, h)
        const d  = id.data
        for (let i = 0; i < d.length; i += 4) {
          const v = (Math.random() * 255) | 0
          d[i] = d[i + 1] = d[i + 2] = v
          d[i + 3] = 255   // full alpha — opacity controlled via globalAlpha below
        }
        grainCtx.putImageData(id, 0, 0)
      }

      // ── Setup ───────────────────────────────────────────────
      p.setup = () => {
        const cv = p.createCanvas(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        )
        cv.style('display', 'block')
        p.frameRate(60)
        initGrain(p.width, p.height)
      }

      // ── Draw ────────────────────────────────────────────────
      p.draw = () => {
        p.clear()
        const ctx = p.drawingContext
        const W = p.width, H = p.height
        const t = p.frameCount * 0.0040

        // Smooth light-source position (−1..1)
        const inside = p.mouseX > 0 && p.mouseX < W && p.mouseY > 0 && p.mouseY < H
        const tx = inside ? (p.mouseX / W - 0.5) * 2 : Math.sin(t * 0.88) * 0.52
        const ty = inside ? (p.mouseY / H - 0.5) * 2 : Math.cos(t * 0.70) * 0.40
        smX += (tx - smX) * 0.052
        smY += (ty - smY) * 0.052

        // Refresh grain every 2 frames → ~30 fps film-grain flicker
        if (p.frameCount % 2 === 0) updateGrain()

        // ── Draw blobs (source-over — safe on any background) ─
        BLOBS.forEach((b, i) => {
          const dX  = (p.noise(b.ns,       t) - 0.5) * 0.14
          const dY  = (p.noise(b.ns + 100, t) - 0.5) * 0.11
          const dir = i % 2 === 0 ? 1 : -0.65
          const bx  = (b.nx + dX + smX * 0.05 * dir) * W
          const by  = (b.ny + dY + smY * 0.04 * dir) * H
          const br  = 1 + (p.noise(b.ns + 200, t * 1.2) - 0.5) * 0.10
          const rx  = b.rw * W * br
          const ry  = b.rh * H * br
          const ang = b.ang + (p.noise(b.ns + 300, t * 0.7) - 0.5) * 0.28
          drawBlob(ctx, bx, by, rx, ry, ang, b.rgb, b.a)
        })

        // ── Grain: source-atop clips it to blob areas only ────
        // (prevents grain from spilling onto the white background)
        ctx.save()
        ctx.globalCompositeOperation = 'source-atop'
        ctx.globalAlpha = 0.10
        ctx.drawImage(grainCv, 0, 0, W, H)
        ctx.restore()

        // ── Overlay grain for texture depth ──────────────────
        ctx.save()
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = 0.18
        ctx.drawImage(grainCv, 0, 0, W, H)
        ctx.restore()

        // ── Edge vignette (darkens blob periphery) ────────────
        const vg = ctx.createRadialGradient(W / 2, H / 2, H * 0.05, W / 2, H / 2, H * 0.94)
        vg.addColorStop(0, 'rgba(0,0,0,0)')
        vg.addColorStop(1, 'rgba(0,0,0,0.18)')
        ctx.save()
        ctx.fillStyle = vg
        ctx.fillRect(0, 0, W, H)
        ctx.restore()

        // ── Click flash ──────────────────────────────────────
        if (flashA > 0.02) {
          ctx.save()
          ctx.globalCompositeOperation = 'source-atop'
          ctx.globalAlpha = flashA * 0.45
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, W, H)
          ctx.restore()
          flashA *= 0.86
        }
      }

      // ── Draw one organic blob ────────────────────────────────
      function drawBlob(ctx, cx, cy, rx, ry, ang, rgb, baseA) {
        const [r, g, b] = rgb
        // Light offset in blob-local normalised space (−1..1)
        const lx = smX * 0.28
        const ly = smY * 0.23

        ctx.save()
        // NOTE: source-over (default) — blends naturally on any background
        ctx.translate(cx, cy)
        ctx.rotate(ang)
        ctx.scale(rx, ry)

        // Body: bright focal point at light side → transparent at edge
        const gr = ctx.createRadialGradient(lx, ly, 0, 0, 0, 1)
        gr.addColorStop(0.00, `rgba(${r},${g},${b},${baseA})`)
        gr.addColorStop(0.30, `rgba(${r},${g},${b},${(baseA * 0.74).toFixed(3)})`)
        gr.addColorStop(0.65, `rgba(${r},${g},${b},${(baseA * 0.26).toFixed(3)})`)
        gr.addColorStop(1.00, `rgba(${r},${g},${b},0)`)

        ctx.beginPath()
        ctx.arc(0, 0, 1, 0, Math.PI * 2)
        ctx.fillStyle = gr
        ctx.fill()

        // Specular: small white glow at light-source position
        const sx = lx * 0.62, sy = ly * 0.62
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 0.24)
        sg.addColorStop(0.0, `rgba(255,255,255,${(baseA * 0.80).toFixed(3)})`)
        sg.addColorStop(0.5, `rgba(255,255,255,${(baseA * 0.18).toFixed(3)})`)
        sg.addColorStop(1.0, 'rgba(255,255,255,0)')

        ctx.beginPath()
        ctx.arc(sx, sy, 0.24, 0, Math.PI * 2)
        ctx.fillStyle = sg
        ctx.fill()

        ctx.restore()
      }

      // ── Interactions ─────────────────────────────────────────
      p.mouseClicked = () => {
        const { width: W, height: H } = p
        if (p.mouseX > 0 && p.mouseX < W && p.mouseY > 0 && p.mouseY < H) flashA = 1
      }

      p.windowResized = () => {
        if (!containerRef.current) return
        p.resizeCanvas(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        )
        initGrain(p.width, p.height)
      }
    }

    p5Ref.current = new p5(sketch, containerRef.current)
    return () => { p5Ref.current?.remove(); p5Ref.current = null }
  }, [])

  return <div ref={containerRef} className={styles.wrap} />
}
