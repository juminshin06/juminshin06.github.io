import { useEffect, useRef } from 'react'
import s from './Portfolio.module.css'

// A quiet "morning outdoors" backdrop for the intro: slow light blooms over a pale sky,
// pollen drifting upward, and two low hills breathing at the bottom. Drawn on one canvas,
// paused when off screen or in a background tab, and frozen for reduced motion.
const BLOOMS = [
  { color: '150, 192, 224', x: 0.18, y: 0.28, r: 0.42, speed: 0.00011, phase: 0 },
  { color: '176, 206, 164', x: 0.78, y: 0.62, r: 0.46, speed: 0.00009, phase: 2.1 },
  { color: '255, 214, 156', x: 0.62, y: 0.18, r: 0.34, speed: 0.00013, phase: 4.2 },
  { color: '204, 186, 232', x: 0.32, y: 0.76, r: 0.3, speed: 0.0001, phase: 1.3 },
]

export default function IntroBackdrop() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let width = 0
    let height = 0
    let frame = 0
    let visible = true
    let pointer = { x: 0.5, y: 0.5 }
    let motes = []

    const seed = () => {
      const count = width < 700 ? 26 : 56
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.8 + Math.random() * 1.8,
        rise: 6 + Math.random() * 14,
        sway: 6 + Math.random() * 18,
        phase: Math.random() * Math.PI * 2,
        warm: Math.random() < 0.35,
      }))
    }

    const resize = () => {
      const box = canvas.getBoundingClientRect()
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      width = box.width
      height = box.height
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      seed()
    }

    const hill = (time, base, amplitude, length, color, shift) => {
      context.beginPath()
      context.moveTo(0, height)
      for (let x = 0; x <= width + 20; x += 20) {
        const y = height * base + Math.sin(x / length + time * 0.00018 + shift) * amplitude + Math.sin(x / (length * 0.43) + shift) * amplitude * 0.35
        context.lineTo(x, y)
      }
      context.lineTo(width, height)
      context.closePath()
      context.fillStyle = color
      context.fill()
    }

    const draw = time => {
      context.clearRect(0, 0, width, height)
      const reach = Math.max(width, height)
      for (const bloom of BLOOMS) {
        const drift = time * bloom.speed + bloom.phase
        const x = (bloom.x + Math.sin(drift) * 0.06 + (pointer.x - 0.5) * 0.03) * width
        const y = (bloom.y + Math.cos(drift * 0.8) * 0.05 + (pointer.y - 0.5) * 0.03) * height
        const gradient = context.createRadialGradient(x, y, 0, x, y, bloom.r * reach)
        gradient.addColorStop(0, `rgba(${bloom.color}, 0.42)`)
        gradient.addColorStop(1, `rgba(${bloom.color}, 0)`)
        context.fillStyle = gradient
        context.fillRect(0, 0, width, height)
      }
      hill(time, 0.86, 14, 260, 'rgba(160, 190, 150, 0.14)', 0)
      hill(time, 0.92, 10, 180, 'rgba(130, 168, 128, 0.12)', 1.7)
      const elapsed = time / 1000
      for (const mote of motes) {
        const y = (mote.y - elapsed * mote.rise) % (height + 20)
        const wrapped = y < -10 ? y + height + 20 : y
        const x = mote.x + Math.sin(elapsed * 0.6 + mote.phase) * mote.sway + (pointer.x - 0.5) * 18
        context.beginPath()
        context.arc(x, wrapped, mote.r, 0, Math.PI * 2)
        context.fillStyle = mote.warm ? 'rgba(214, 170, 92, 0.42)' : 'rgba(118, 146, 112, 0.34)'
        context.fill()
      }
    }

    const tick = time => {
      frame = 0
      if (!visible || document.hidden) return
      draw(time)
      if (!motion.matches) frame = requestAnimationFrame(tick)
    }
    const start = () => { if (!frame) frame = requestAnimationFrame(tick) }

    const onPointerMove = event => { pointer = { x: event.clientX / window.innerWidth, y: event.clientY / window.innerHeight } }
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) start() })
    const onVisibility = () => { if (!document.hidden) start() }
    const onMotionChange = () => start()

    resize()
    draw(0)
    start()
    observer.observe(canvas)
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibility)
    motion.addEventListener('change', onMotionChange)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibility)
      motion.removeEventListener('change', onMotionChange)
    }
  }, [])

  return <canvas ref={canvasRef} className={s.introBackdrop} aria-hidden="true" />
}
