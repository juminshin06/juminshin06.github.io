/**
 * LightCanvas — Holographic Neural Crystal
 *
 * 3D crystalline node network rendered via manual perspective projection.
 * No rectangular frame, fully transparent canvas.
 *
 * Interactions:
 *   • Mouse position → real-time X/Y axis rotation
 *   • Auto-rotation when cursor is outside
 *   • Click → radial pulse wave propagates from center outward
 *   • Depth-sorted rendering (back → front) for correct layering
 *   • Per-node multi-layer bloom glow, depth-attenuated
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

      // ── 3D rotation helpers (standard matrices) ───────
      function rotateX(x, y, z, a) {
        const c = Math.cos(a), s = Math.sin(a)
        return { x, y: y * c - z * s, z: y * s + z * c }
      }
      function rotateY(x, y, z, a) {
        const c = Math.cos(a), s = Math.sin(a)
        return { x: x * c + z * s, y, z: -x * s + z * c }
      }
      function project(x, y, z, cx, cy, fov = 520) {
        const sc = fov / (fov + z)
        return { sx: x * sc + cx, sy: y * sc + cy, scale: sc, z }
      }

      // ── Node ──────────────────────────────────────────
      class Node3D {
        constructor(x, y, z, inner = false) {
          this.ox = x; this.oy = y; this.oz = z
          this.baseR    = inner ? p.random(2.5, 6) : p.random(4, 12)
          this.r        = this.baseR
          this.phase    = p.random(Math.PI * 2)
          this.bspeed   = p.random(0.009, 0.021)  // breath speed
          this.pulse    = 0      // 0..1, decays
          this.pQueue   = -1     // queued delay (frames), -1 = not queued
          this.connections = 0
        }

        update() {
          // pulse queue countdown
          if (this.pQueue > 0) {
            this.pQueue--
          } else if (this.pQueue === 0) {
            this.pulse  = 1
            this.pQueue = -1
          }
          // decay
          this.pulse *= 0.918
          // breathe
          const breath = Math.sin(this.phase += this.bspeed) * 0.16
          this.r = this.baseR * (1 + breath + this.pulse * 2.2)
        }
      }

      // ── Build geometry ─────────────────────────────────
      let nodes = [], edges = []
      const OUTER_R    = 160
      const INNER_R    = 88
      const EDGE_LIMIT = 132  // max 3D distance to form edge

      function fibSphere(count, r) {
        const phi = Math.PI * (3 - Math.sqrt(5))
        return Array.from({ length: count }, (_, i) => {
          const y   = 1 - (i / (count - 1)) * 2
          const rad = Math.sqrt(Math.max(0, 1 - y * y))
          const t   = phi * i
          return [Math.cos(t) * rad * r, y * r, Math.sin(t) * rad * r]
        })
      }

      function buildScene() {
        nodes = []; edges = []

        // Outer shell — 44 nodes, Fibonacci sphere
        fibSphere(44, OUTER_R).forEach(([x, y, z]) => nodes.push(new Node3D(x, y, z, false)))
        // Mid shell — 18 nodes
        fibSphere(18, INNER_R).forEach(([x, y, z]) => nodes.push(new Node3D(x, y, z, true)))
        // Dense inner core — 5 nodes
        fibSphere(5, 40).forEach(([x, y, z]) => nodes.push(new Node3D(x, y, z, true)))

        // Edges: O(n²) for clarity — n≈67, fast enough
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const d = Math.hypot(
              nodes[i].ox - nodes[j].ox,
              nodes[i].oy - nodes[j].oy,
              nodes[i].oz - nodes[j].oz
            )
            if (d < EDGE_LIMIT) {
              edges.push({ a: i, b: j, d })
              nodes[i].connections++
              nodes[j].connections++
            }
          }
        }
      }

      // ── Rotation state ─────────────────────────────────
      let curRX = 0.28, curRY = 0.0
      let tgtRX = 0.28, tgtRY = 0.0
      let autoRY = 0
      let hovering = false

      // ── Radial pulse from center ────────────────────────
      function firePulse() {
        const FPS      = 60
        const DURATION = 1.6  // seconds for wave to reach edge
        nodes.forEach(n => {
          const dist  = Math.hypot(n.ox, n.oy, n.oz)
          const delay = Math.round((dist / OUTER_R) * DURATION * FPS)
          n.pQueue = delay
        })
      }

      // ── Ambient slow pulse every ~4s ───────────────────
      let ambientTimer = 0

      // ── Setup ─────────────────────────────────────────
      p.setup = () => {
        const cv = p.createCanvas(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        )
        cv.style('display', 'block')
        p.frameRate(60)
        buildScene()
      }

      // ── Draw ───────────────────────────────────────────
      p.draw = () => {
        p.clear()   // transparent background every frame

        const cx = p.width * 0.5, cy = p.height * 0.5
        const mx = p.mouseX, my = p.mouseY
        hovering = mx > 0 && mx < p.width && my > 0 && my < p.height

        // Rotation target from mouse
        if (hovering) {
          tgtRY = ((mx - cx) / cx) * Math.PI * 1.35
          tgtRX = ((my - cy) / cy) * Math.PI * 0.52
        } else {
          autoRY += 0.0035
        }
        curRX += (tgtRX - curRX) * 0.055
        curRY += (tgtRY - curRY) * 0.055

        // Ambient pulse
        ambientTimer++
        if (ambientTimer > 240) { firePulse(); ambientTimer = 0 }

        // Update nodes
        nodes.forEach(n => n.update())

        // Project nodes to screen
        const proj = nodes.map(n => {
          let v = rotateX(n.ox, n.oy, n.oz, curRX)
          v     = rotateY(v.x,  v.y,  v.z,  curRY + autoRY)
          return project(v.x, v.y, v.z, cx, cy)
        })

        // ── Collect & depth-sort drawables ─────────────
        const drawList = []

        edges.forEach(e => {
          const pa = proj[e.a], pb = proj[e.b]
          drawList.push({
            type: 'edge',
            pa, pb,
            edgeDist: e.d,
            z: (pa.z + pb.z) * 0.5,
            pulse: (nodes[e.a].pulse + nodes[e.b].pulse) * 0.5,
          })
        })
        nodes.forEach((n, i) => {
          drawList.push({ type: 'node', n, p3: proj[i], z: proj[i].z })
        })

        // Back → front (descending Z = deepest first)
        drawList.sort((a, b) => b.z - a.z)

        drawList.forEach(item => {
          if (item.type === 'edge') renderEdge(item)
          else                      renderNode(item)
        })

        // Cursor halo
        if (hovering) {
          const pulse = Math.sin(p.frameCount * 0.09) * 0.28 + 1
          p.noStroke()
          p.fill(155, 211, 255, 8)
          p.circle(mx, my, 130 * pulse)
          p.fill(200, 230, 255, 16)
          p.circle(mx, my, 48 * pulse)
          p.fill(255, 255, 255, 46)
          p.circle(mx, my, 10)
        }
      }

      // ── Render helpers ─────────────────────────────────

      function depthFactor(z) {
        // z ∈ [-OUTER_R*1.4 … +OUTER_R*1.4] after rotation
        return p.map(z, -240, 240, 0.95, 0.08)
      }

      function renderEdge({ pa, pb, edgeDist, z, pulse }) {
        const df   = depthFactor(z)
        const base = p.map(edgeDist, 0, EDGE_LIMIT, 80, 8) * df
        const r    = 100 + pulse * 155
        const g    = 190 + pulse * 65
        const b    = 255

        p.stroke(r, g, b, base + pulse * 155)
        p.strokeWeight((0.45 + pulse * 2.5) * df + 0.25)
        p.line(pa.sx, pa.sy, pb.sx, pb.sy)
      }

      function renderNode({ n, p3 }) {
        const { sx, sy, scale, z } = p3
        const df    = depthFactor(z)
        const pulse = n.pulse
        const s     = n.r * scale   // screen-space radius

        // Colour: cool blue → warm white-gold when pulsing
        const nr = 100 + Math.min(155, pulse * 200)
        const ng = 185 + Math.min(70, pulse * 70)
        const nb = 255

        p.noStroke()

        // ── Layer 1: mega halo (visible only during strong pulse)
        if (pulse > 0.18) {
          p.fill(nr, ng, nb, df * 8 * pulse)
          p.circle(sx, sy, s * 20)
          p.fill(nr, ng, nb, df * 16 * pulse)
          p.circle(sx, sy, s * 11)
        }

        // ── Layer 2: standard outer bloom
        p.fill(nr, ng, nb, df * 20)
        p.circle(sx, sy, s * 7)

        // ── Layer 3: mid glow
        p.fill(nr, ng, nb, df * 55)
        p.circle(sx, sy, s * 3.5)

        // ── Layer 4: inner glow
        p.fill(nr, ng, nb, df * 130)
        p.circle(sx, sy, s * 1.7)

        // ── Layer 5: solid core
        p.fill(nr, ng, nb, Math.min(255, df * 215))
        p.circle(sx, sy, s * 0.72)

        // ── Layer 6: white-hot nucleus (pulse only)
        if (pulse > 0.28) {
          p.fill(255, 255, 255, df * pulse * 235)
          p.circle(sx, sy, s * 0.30)
        }
      }

      // ── Interactions ───────────────────────────────────
      p.mouseClicked = () => {
        if (!hovering) return
        firePulse()
        // Reset ambient timer so we don't double-fire soon
        ambientTimer = 0
      }

      p.windowResized = () => {
        if (!containerRef.current) return
        p.resizeCanvas(
          containerRef.current.offsetWidth,
          containerRef.current.offsetHeight
        )
      }
    }

    p5Ref.current = new p5(sketch, containerRef.current)
    return () => { p5Ref.current?.remove(); p5Ref.current = null }
  }, [])

  return <div ref={containerRef} className={styles.wrap} />
}
