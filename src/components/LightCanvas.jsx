import { useEffect, useRef } from 'react'
import p5 from 'p5'
import styles from './LightCanvas.module.css'

export default function LightCanvas() {
  const containerRef = useRef(null)
  const p5Ref        = useRef(null)

  useEffect(() => {
    if (!containerRef.current || p5Ref.current) return

    const sketch = (p) => {
      // ── palette ──────────────────────────────────────
      const PALETTE = [
        [155, 211, 255],  // accent blue
        [180, 145, 255],  // violet
        [255, 255, 255],  // white
        [100, 200, 255],  // cyan
        [220, 185, 255],  // lavender
        [255, 235, 155],  // warm gold
        [130, 220, 255],  // sky
      ]

      let orbs       = []
      let bursts     = []
      let shockwaves = []
      let trail      = []
      let lastMX = -999, lastMY = -999, trailClock = 0

      // ─────────────────────────────────────────────────
      //  Orb  — large luminous sphere that absorbs light
      // ─────────────────────────────────────────────────
      class Orb {
        constructor() {
          this.color       = PALETTE[Math.floor(p.random(PALETTE.length))]
          this.baseSize    = p.random(18, 48)
          this.size        = this.baseSize
          this.x           = p.random(p.width)
          this.y           = p.random(p.height)
          this.vx          = p.random(-0.5, 0.5)
          this.vy          = p.random(-0.5, 0.5)
          this.phase       = p.random(Math.PI * 2)
          this.breathSpeed = p.random(0.010, 0.022)
          this.baseAlpha   = p.random(110, 210)
          this.alpha       = this.baseAlpha
          this.absorb      = 0   // 0 → 1
        }

        update() {
          this.phase += this.breathSpeed

          // gentle drift oscillation
          this.vx += Math.sin(this.phase * 0.28) * 0.009
          this.vy += Math.cos(this.phase * 0.35) * 0.009

          // mouse absorption
          const dx = p.mouseX - this.x
          const dy = p.mouseY - this.y
          const d  = Math.hypot(dx, dy)
          const R  = 240
          if (d < R && d > 1) {
            const t      = Math.pow(1 - d / R, 1.6)
            this.absorb  = Math.min(1, this.absorb + t * 0.09)
            const force  = t * t * 0.14
            this.vx     += (dx / d) * force
            this.vy     += (dy / d) * force
          } else {
            this.absorb = Math.max(0, this.absorb - 0.045)
          }

          this.vx *= 0.955
          this.vy *= 0.955
          this.x  += this.vx
          this.y  += this.vy

          // wrap
          const M = 80
          if (this.x < -M) this.x = p.width  + M
          if (this.x > p.width  + M) this.x  = -M
          if (this.y < -M) this.y = p.height + M
          if (this.y > p.height + M) this.y  = -M

          // breathe + swell when absorbing
          const breath  = Math.sin(this.phase) * 0.14
          this.size     = this.baseSize * (1 + breath + this.absorb * 2.8)
          this.alpha    = this.baseAlpha + this.absorb * 160
        }

        draw() {
          const [r, g, b] = this.color
          const a = this.alpha
          const s = this.size
          p.noStroke()

          // mega halo when absorbing
          if (this.absorb > 0.08) {
            p.fill(r, g, b, a * this.absorb * 0.05)
            p.circle(this.x, this.y, s * 9.5)
            p.fill(r, g, b, a * this.absorb * 0.08)
            p.circle(this.x, this.y, s * 6.5)
          }

          // standard bloom layers
          p.fill(r, g, b, a * 0.06)
          p.circle(this.x, this.y, s * 5.8)
          p.fill(r, g, b, a * 0.14)
          p.circle(this.x, this.y, s * 3.2)
          p.fill(r, g, b, a * 0.38)
          p.circle(this.x, this.y, s * 1.7)
          p.fill(r, g, b, Math.min(255, a * 1.1))
          p.circle(this.x, this.y, s * 0.65)

          // white-hot core when fully absorbing
          if (this.absorb > 0.25) {
            p.fill(255, 255, 255, this.absorb * 220)
            p.circle(this.x, this.y, s * 0.22)
          }
        }
      }

      // ─────────────────────────────────────────────────
      //  Shockwave  — expanding ring on click
      // ─────────────────────────────────────────────────
      class Shockwave {
        constructor(x, y, delay = 0) {
          this.x     = x
          this.y     = y
          this.r     = delay > 0 ? -delay * 6 : 0  // stagger start
          this.speed = 9
          this.maxR  = Math.hypot(p.width, p.height) * 0.75
          this.life  = 1.0
          this.color = [200, 230, 255]
        }

        update() {
          if (this.r < 0) { this.r += this.speed; return }
          this.r    += this.speed
          this.speed = Math.max(4, this.speed * 0.975)
          this.life  = Math.max(0, 1 - this.r / this.maxR)
        }

        draw() {
          if (this.r <= 0) return
          const [r, g, b] = this.color
          const a  = this.life * 200
          const sw = this.life * 3.5 + 0.5
          p.noFill()
          p.stroke(r, g, b, a)
          p.strokeWeight(sw)
          p.circle(this.x, this.y, this.r * 2)
          // softer trailing ring
          if (this.r > 40) {
            p.stroke(r, g, b, a * 0.35)
            p.strokeWeight(sw * 0.5)
            p.circle(this.x, this.y, (this.r - 35) * 2)
          }
        }

        isDead() { return this.life <= 0.008 }
      }

      // ─────────────────────────────────────────────────
      //  Burst particle  — flies out on click / absorb
      // ─────────────────────────────────────────────────
      class Burst {
        constructor(x, y, big = false) {
          const angle  = p.random(Math.PI * 2)
          const speed  = big ? p.random(2.5, 14) : p.random(1.5, 5.5)
          this.x     = x + Math.cos(angle) * p.random(0, big ? 30 : 10)
          this.y     = y + Math.sin(angle) * p.random(0, big ? 30 : 10)
          this.vx    = Math.cos(angle) * speed
          this.vy    = Math.sin(angle) * speed
          this.life  = 1.0
          this.decay = big ? p.random(0.010, 0.022) : p.random(0.020, 0.040)
          this.size  = big ? p.random(10, 32) : p.random(4, 14)
          const bc   = [
            [255, 255, 255],
            [255, 245, 145],
            [200, 240, 255],
            [185, 155, 255],
            [155, 211, 255],
            [255, 205, 100],
          ]
          this.color = bc[Math.floor(p.random(bc.length))]
        }

        update() {
          this.vx   *= 0.935
          this.vy   *= 0.935
          this.x    += this.vx
          this.y    += this.vy
          this.life -= this.decay
        }

        draw() {
          const [r, g, b] = this.color
          const a = this.life
          const s = this.size * a
          p.noStroke()
          p.fill(r, g, b, a * 230 * 0.07)
          p.circle(this.x, this.y, s * 6.5)
          p.fill(r, g, b, a * 230 * 0.28)
          p.circle(this.x, this.y, s * 2.6)
          p.fill(r, g, b, a * 230)
          p.circle(this.x, this.y, s * 0.8)
          if (a > 0.4) {
            p.fill(255, 255, 255, a * 195)
            p.circle(this.x, this.y, s * 0.28)
          }
        }

        isDead() { return this.life <= 0 }
      }

      // ─────────────────────────────────────────────────
      //  Trail point  — fading light where cursor passed
      // ─────────────────────────────────────────────────
      class Trail {
        constructor(x, y) {
          this.x    = x
          this.y    = y
          this.life = 1.0
          this.size = p.random(6, 18)
        }
        update() { this.life -= 0.030 }
        draw() {
          const a = this.life
          p.noStroke()
          p.fill(155, 211, 255, a * 35)
          p.circle(this.x, this.y, this.size * 5)
          p.fill(220, 240, 255, a * 70)
          p.circle(this.x, this.y, this.size * 1.6)
        }
        isDead() { return this.life <= 0 }
      }

      // ─────────────────────────────────────────────────
      //  Setup & Draw
      // ─────────────────────────────────────────────────
      p.setup = () => {
        const w  = containerRef.current?.offsetWidth  || 500
        const h  = containerRef.current?.offsetHeight || 540
        const cv = p.createCanvas(w, h)
        cv.style('display', 'block')
        p.frameRate(60)
        for (let i = 0; i < 20; i++) orbs.push(new Orb())
      }

      p.draw = () => {
        p.clear()

        const mx = p.mouseX, my = p.mouseY
        const inCanvas = mx > 0 && mx < p.width && my > 0 && my < p.height

        // ── mouse trail ───────────────────────────────
        trailClock++
        if (inCanvas && Math.hypot(mx - lastMX, my - lastMY) > 5 && trailClock > 2) {
          trail.push(new Trail(mx, my))
          lastMX = mx; lastMY = my; trailClock = 0
        }
        trail = trail.filter(t => !t.isDead())
        trail.forEach(t => { t.update(); t.draw() })

        // ── absorption tendrils (orb → cursor) ────────
        if (inCanvas) {
          orbs.forEach(o => {
            if (o.absorb < 0.15) return
            const [r, g, b] = o.color
            p.stroke(r, g, b, o.absorb * 65)
            p.strokeWeight(o.absorb * 2.2)
            p.line(o.x, o.y, mx, my)
          })
        }

        // ── orb connection lines ──────────────────────
        for (let i = 0; i < orbs.length; i++) {
          for (let j = i + 1; j < orbs.length; j++) {
            const d = Math.hypot(orbs[i].x - orbs[j].x, orbs[i].y - orbs[j].y)
            if (d < 130) {
              const t      = 1 - d / 130
              const absorb = (orbs[i].absorb + orbs[j].absorb) * 0.5
              p.stroke(155, 211, 255, t * 22 + absorb * 50)
              p.strokeWeight(0.5 + absorb * 2)
              p.line(orbs[i].x, orbs[i].y, orbs[j].x, orbs[j].y)
            }
          }
        }
        p.noStroke()

        // ── orbs ──────────────────────────────────────
        orbs.forEach(o => { o.update(); o.draw() })

        // ── shockwaves ────────────────────────────────
        shockwaves = shockwaves.filter(s => !s.isDead())
        shockwaves.forEach(s => { s.update(); s.draw() })
        p.noStroke()

        // ── burst particles ───────────────────────────
        bursts = bursts.filter(b => !b.isDead())
        bursts.forEach(b => { b.update(); b.draw() })

        // ── cursor glow ───────────────────────────────
        if (inCanvas) {
          const pulse = Math.sin(p.frameCount * 0.09) * 0.28 + 1
          p.noStroke()
          p.fill(200, 230, 255, 10)
          p.circle(mx, my, 100 * pulse)
          p.fill(220, 240, 255, 22)
          p.circle(mx, my, 38 * pulse)
          p.fill(255, 255, 255, 55)
          p.circle(mx, my, 9)
        }
      }

      // ── click: shockwave + mega burst ────────────────
      p.mouseClicked = () => {
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return

        // 3 staggered shockwave rings
        shockwaves.push(new Shockwave(p.mouseX, p.mouseY, 0))
        shockwaves.push(new Shockwave(p.mouseX, p.mouseY, 5))
        shockwaves.push(new Shockwave(p.mouseX, p.mouseY, 12))

        // 55 dramatic burst particles
        for (let i = 0; i < 55; i++) bursts.push(new Burst(p.mouseX, p.mouseY, true))

        // Force nearby orbs to max-absorb
        orbs.forEach(o => {
          const d = Math.hypot(p.mouseX - o.x, p.mouseY - o.y)
          if (d < 320) o.absorb = Math.min(1, o.absorb + (1 - d / 320) * 0.95)
        })
      }

      p.windowResized = () => {
        if (!containerRef.current) return
        p.resizeCanvas(containerRef.current.offsetWidth, containerRef.current.offsetHeight)
      }
    }

    p5Ref.current = new p5(sketch, containerRef.current)
    return () => { p5Ref.current?.remove(); p5Ref.current = null }
  }, [])

  return <div ref={containerRef} className={styles.wrap} />
}
