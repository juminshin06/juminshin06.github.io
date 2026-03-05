/**
 * LightCanvas — Grainy Organic Blobs (Dark Edition)
 *
 * Dark background card with screen-blended vivid blobs + animated film grain.
 * Screen blend on dark = luminous, jewel-toned result (like the reference images).
 * Mouse-driven 3D lighting via offset radial gradient + specular highlight.
 *
 * Interactions:
 *   • Mouse → shifts light source (bright spot moves across each blob = 3D)
 *   • Auto-drifts smoothly when cursor is outside
 *   • Perlin noise → organic position / scale / angle per blob
 *   • Click → bright flash burst
 */

import { useEffect, useRef } from 'react'
import p5 from 'p5'
import styles from './LightCanvas.module.css'

// Dark card background colour
const BG_R = 12, BG_G = 10, BG_B = 28   // #0C0A1C — deep indigo-black

export default function LightCanvas() {
  const containerRef = useRef(null)
  const p5Ref        = useRef(null)

  useEffect(() => {
    if (!containerRef.current || p5Ref.current) return

    const sketch = (p) => {
      let grainCv, grainCtx
      let flashA = 0
      let smX = 0, smY = 0   // smoothed light vector  −1..1

      // ── Vivid blobs — screen-blended on dark bg ──────────────
      // rw/rh are large so blobs overflow the canvas edges (organic, not boxed)
      const BLOBS = [
        { nx: 0.34, ny: 0.50, rw: 0.76, rh: 0.48, ang: -0.32, rgb: [148,  85, 245], ns:  0 },
        { nx: 0.70, ny: 0.43, rw: 0.64, rh: 0.38, ang:  0.58, rgb: [ 62, 162, 250], ns: 17 },
        { nx: 0.48, ny: 0.66, rw: 0.52, rh: 0.60, ang:  1.10, rgb: [248,  85, 148], ns: 34 },
        { nx: 0.20, ny: 0.48, rw: 0.40, rh: 0.34, ang: -0.78, rgb: [245, 172,  58], ns: 51 },
        { nx: 0.76, ny: 0.58, rw: 0.48, rh: 0.54, ang:  0.25, rgb: [ 55, 205, 168], ns: 68 },
      ]

      // ── Film grain (half-res for perf, animated) ─────────────
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
          d[i + 3] = 255
        }
        grainCtx.putImageData(id, 0, 0)
      }

      // ── Setup ────────────────────────────────────────────────
      p.setup = () => {
        const cv = p.createCanvas(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        )
        cv.style('display', 'block')
        p.frameRate(60)
        initGrain(p.width, p.height)
      }

      // ── Draw ─────────────────────────────────────────────────
      p.draw = () => {
        // Solid dark background — makes screen blend pop like the reference
        p.background(BG_R, BG_G, BG_B)

        const ctx = p.drawingContext
        const W = p.width, H = p.height
        const t = p.frameCount * 0.004

        // Smooth light-source direction (−1..1)
        const inside = p.mouseX > 0 && p.mouseX < W && p.mouseY > 0 && p.mouseY < H
        const tx = inside ? (p.mouseX / W - 0.5) * 2 : Math.sin(t * 0.88) * 0.55
        const ty = inside ? (p.mouseY / H - 0.5) * 2 : Math.cos(t * 0.70) * 0.42
        smX += (tx - smX) * 0.05
        smY += (ty - smY) * 0.05

        // Refresh grain every 2 frames (30 fps flicker = authentic film grain)
        if (p.frameCount % 2 === 0) updateGrain()

        // ── Blobs ───────────────────────────────────────────
        BLOBS.forEach((b, i) => {
          const dX  = (p.noise(b.ns,       t) - 0.5) * 0.13
          const dY  = (p.noise(b.ns + 100, t) - 0.5) * 0.10
          const dir = i % 2 === 0 ? 1 : -0.6
          const bx  = (b.nx + dX + smX * 0.05 * dir) * W
          const by  = (b.ny + dY + smY * 0.04 * dir) * H
          const br  = 1 + (p.noise(b.ns + 200, t * 1.1) - 0.5) * 0.08
          const rx  = b.rw * W * br
          const ry  = b.rh * H * br
          const ang = b.ang + (p.noise(b.ns + 300, t * 0.65) - 0.5) * 0.25
          drawBlob(ctx, bx, by, rx, ry, ang, b.rgb)
        })

        // ── Grain overlay (overlay on dark bg = deep, rich texture) ─
        ctx.save()
        ctx.globalCompositeOperation = 'overlay'
        ctx.globalAlpha = 0.30
        ctx.drawImage(grainCv, 0, 0, W, H)
        ctx.restore()

        // ── Flash ────────────────────────────────────────────
        if (flashA > 0.02) {
          ctx.save()
          ctx.globalCompositeOperation = 'screen'
          ctx.globalAlpha = flashA * 0.65
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(0, 0, W, H)
          ctx.restore()
          flashA *= 0.85
        }
      }

      // ── Single blob: screen-blended elliptical gradient + specular ─
      function drawBlob(ctx, cx, cy, rx, ry, ang, rgb) {
        const [r, g, b] = rgb
        // Light offset in blob-local normalised space
        const lx = smX * 0.30
        const ly = smY * 0.26

        ctx.save()
        ctx.globalCompositeOperation = 'screen'
        ctx.translate(cx, cy)
        ctx.rotate(ang)
        ctx.scale(rx, ry)

        // Body: bright at light side, fades to dark (bg shows through = 3D depth)
        const gr = ctx.createRadialGradient(lx, ly, 0, 0, 0, 1)
        gr.addColorStop(0.00, `rgba(${r},${g},${b},0.92)`)
        gr.addColorStop(0.28, `rgba(${r},${g},${b},0.70)`)
        gr.addColorStop(0.60, `rgba(${r},${g},${b},0.22)`)
        gr.addColorStop(1.00, `rgba(${r},${g},${b},0.00)`)

        ctx.beginPath()
        ctx.arc(0, 0, 1, 0, Math.PI * 2)
        ctx.fillStyle = gr
        ctx.fill()

        // Specular: bright white glow at light-source position
        const sx = lx * 0.55, sy = ly * 0.55
        const sg = ctx.createRadialGradient(sx, sy, 0, sx, sy, 0.28)
        sg.addColorStop(0.0, 'rgba(255,255,255,0.88)')
        sg.addColorStop(0.4, 'rgba(255,255,255,0.22)')
        sg.addColorStop(1.0, 'rgba(255,255,255,0.00)')

        ctx.beginPath()
        ctx.arc(sx, sy, 0.28, 0, Math.PI * 2)
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
