import { useEffect, useRef } from 'react'
import p5 from 'p5'
import styles from './LightCanvas.module.css'

export default function LightCanvas() {
  const containerRef = useRef(null)
  const p5Ref        = useRef(null)

  useEffect(() => {
    if (!containerRef.current || p5Ref.current) return

    const sketch = (p) => {
      const COUNT = 44
      let particles = []
      let bursts    = []

      // Design system palette
      const PALETTE = [
        [155, 211, 255],   // #9BD3FF accent blue
        [215, 240, 255],   // light sky
        [230, 247, 255],   // sea blue pastel
        [255, 255, 255],   // white
        [180, 225, 255],   // soft blue
        [200, 235, 255],   // mid blue
      ]

      class Particle {
        constructor() {
          this.color     = PALETTE[Math.floor(p.random(PALETTE.length))]
          this.size      = p.random(3, 13)
          this.base      = this.size
          this.vx        = p.random(-0.22, 0.22)
          this.vy        = p.random(-0.22, 0.22)
          this.phase     = p.random(Math.PI * 2)
          this.x         = p.random(p.width)
          this.y         = p.random(p.height)
          this.alpha     = p.random(50, 155)
          this.baseAlpha = this.alpha
        }

        update() {
          this.phase += 0.011

          // gentle drift oscillation
          this.vx += Math.sin(this.phase * 0.60) * 0.003
          this.vy += Math.cos(this.phase * 0.45) * 0.003

          // mouse attraction
          const dx = p.mouseX - this.x
          const dy = p.mouseY - this.y
          const d  = Math.hypot(dx, dy)
          const R  = 195
          if (d < R && d > 1) {
            const f  = Math.pow(1 - d / R, 2) * 0.055
            this.vx += (dx / d) * f
            this.vy += (dy / d) * f
          }

          this.vx *= 0.965
          this.vy *= 0.965
          this.x  += this.vx
          this.y  += this.vy

          // wrap edges
          if (this.x < -30) this.x = p.width  + 30
          if (this.x > p.width  + 30) this.x  = -30
          if (this.y < -30) this.y = p.height + 30
          if (this.y > p.height + 30) this.y  = -30

          // glow response to cursor proximity
          const GLOW = 155
          if (d < GLOW) {
            const t    = 1 - d / GLOW
            this.alpha = this.baseAlpha + t * 135
            this.size  = this.base      + t * 9
          } else {
            this.alpha = this.baseAlpha + Math.sin(this.phase) * 14
            this.size  = this.base      + Math.sin(this.phase * 0.7) * 1.5
          }
        }

        draw() {
          const [r, g, b] = this.color
          p.noStroke()
          // outer halo
          p.fill(r, g, b, this.alpha * 0.09)
          p.circle(this.x, this.y, this.size * 5.5)
          // mid glow
          p.fill(r, g, b, this.alpha * 0.28)
          p.circle(this.x, this.y, this.size * 2.2)
          // core
          p.fill(r, g, b, this.alpha)
          p.circle(this.x, this.y, this.size * 0.75)
        }
      }

      class Burst {
        constructor(x, y) {
          const angle  = p.random(Math.PI * 2)
          const speed  = p.random(1.8, 5.5)
          this.x     = x
          this.y     = y
          this.vx    = Math.cos(angle) * speed
          this.vy    = Math.sin(angle) * speed
          this.life  = 1.0
          this.decay = p.random(0.018, 0.036)
          this.size  = p.random(5, 18)
          const bc   = [
            [255, 248, 180],
            [255, 225, 80],
            [200, 240, 255],
            [255, 255, 255],
            [155, 211, 255],
          ]
          this.color = bc[Math.floor(p.random(bc.length))]
        }

        update() {
          this.vx   *= 0.92
          this.vy   *= 0.92
          this.x    += this.vx
          this.y    += this.vy
          this.life -= this.decay
        }

        draw() {
          const [r, g, b] = this.color
          const a  = this.life
          const s  = this.size * a
          p.noStroke()
          p.fill(r, g, b, a * 220 * 0.11)
          p.circle(this.x, this.y, s * 4.8)
          p.fill(r, g, b, a * 220 * 0.36)
          p.circle(this.x, this.y, s * 2.0)
          p.fill(r, g, b, a * 220)
          p.circle(this.x, this.y, s * 0.65)
        }

        isDead() { return this.life <= 0 }
      }

      p.setup = () => {
        const w  = containerRef.current?.offsetWidth  || 420
        const h  = containerRef.current?.offsetHeight || 480
        const cv = p.createCanvas(w, h)
        cv.style('display', 'block')
        p.frameRate(60)
        for (let i = 0; i < COUNT; i++) particles.push(new Particle())
      }

      p.draw = () => {
        p.clear()

        // soft connection lines between nearby particles
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const d = Math.hypot(
              particles[i].x - particles[j].x,
              particles[i].y - particles[j].y
            )
            if (d < 88) {
              p.stroke(155, 211, 255, (1 - d / 88) * 20)
              p.strokeWeight(0.5)
              p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y)
            }
          }
        }
        p.noStroke()

        particles.forEach(pt => { pt.update(); pt.draw() })
        bursts = bursts.filter(b => !b.isDead())
        bursts.forEach(b  => { b.update();  b.draw()  })
      }

      p.mouseClicked = () => {
        if (p.mouseX < 0 || p.mouseX > p.width || p.mouseY < 0 || p.mouseY > p.height) return
        for (let i = 0; i < 22; i++) bursts.push(new Burst(p.mouseX, p.mouseY))
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
