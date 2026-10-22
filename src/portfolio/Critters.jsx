import { useEffect, useRef, useState } from 'react'
import s from './Portfolio.module.css'

// Two quiet pixel critters that live on the footer's top rule rather than following the
// visitor around: they mostly rest, amble a little, think only when hovered, and say hi on click.
const CRITTERS = [
  { id: 'ant', kind: 'ant', speed: 16, start: 0.22 },
  { id: 'snail', kind: 'snail', speed: 5, start: 0.7 },
]
const GREETINGS = ['hi!', 'hello', 'hey', ':)']

function AntSprite() {
  return <svg viewBox="0 0 18 10" width="30" height="17" fill="currentColor" aria-hidden="true">
    <path d="M12 0h1v1h-1zM17 0h1v1h-1zM13 1h1v1h-1zM16 1h1v1h-1zM1 2h5v1H1zM12 2h3v1h-3zM0 3h7v1H0zM8 3h2v1H8zM11 3h5v1h-5zM0 4h7v1H0zM7 4h4v1H7zM11 4h5v1h-5zM0 5h7v1H0zM8 5h2v1H8zM11 5h5v1h-5zM1 6h5v1H1zM12 6h3v1h-3z" />
    <path d="M14 3h1v1h-1z" fill="#fff" />
    <g className={s.critterLegA}><path d="M7 6h1v2H7zM6 8h1v1H6zM9 6h1v3H9zM11 6h1v2h-1zM12 8h1v1h-1z" /></g>
    <g className={s.critterLegB}><path d="M6 6h1v2H6zM5 8h1v1H5zM10 6h1v3h-1zM12 6h1v2h-1zM13 8h1v1h-1z" /></g>
  </svg>
}

function SnailSprite() {
  return <svg viewBox="0 0 20 12" width="34" height="20" fill="currentColor" aria-hidden="true">
    <path d="M3 1h5v1H3zM2 2h7v1H2zM1 3h9v1H1zM1 4h9v1H1zM1 5h9v1H1zM1 6h9v1H1zM2 7h7v1H2zM3 8h5v1H3z" />
    <path d="M4 3h3v1H4zM3 4h1v1H3zM6 4h1v1H6zM3 5h1v1H3zM5 5h2v1H5zM3 6h4v1H3z" fill="#fff" />
    <path d="M16 2h1v1h-1zM19 3h1v1h-1zM16 3h1v1h-1zM18 4h1v1h-1zM16 4h1v1h-1zM17 5h2v1h-2zM15 6h4v1h-4zM14 7h5v1h-5z" />
    <g className={s.critterBody}><path d="M2 9h17v1H2zM1 10h18v1H1zM2 11h16v1H2z" /></g>
  </svg>
}

export default function Critters() {
  const layerRef = useRef(null)
  const [greeting, setGreeting] = useState({})

  useEffect(() => {
    const layer = layerRef.current
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!layer || motion.matches) return
    const nodes = [...layer.querySelectorAll('[data-critter]')]
    const state = nodes.map((node, index) => {
      const spec = CRITTERS[index]
      return { node, spec, x: layer.offsetWidth * spec.start, dir: index % 2 ? -1 : 1, mode: 'pause', until: 0, width: node.offsetWidth }
    })
    let frame = 0
    let last = performance.now()
    const schedule = (critter, now) => {
      const walking = Math.random() < 0.35
      critter.mode = walking ? 'walk' : 'pause'
      critter.until = now + (walking ? 1500 + Math.random() * 2500 : 2500 + Math.random() * 5000)
      if (walking && Math.random() < 0.4) critter.dir *= -1
      critter.node.dataset.mode = critter.mode
      critter.node.dataset.dir = critter.dir > 0 ? 'right' : 'left'
    }
    const tick = now => {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(now - last, 64)
      last = now
      const max = layer.offsetWidth - 12
      for (const critter of state) {
        if (now >= critter.until) schedule(critter, now)
        if (critter.mode === 'walk' && !critter.node.matches(':hover')) {
          critter.x += critter.dir * critter.spec.speed * dt / 1000
          if (critter.x < 12) { critter.x = 12; critter.dir = 1; critter.node.dataset.dir = 'right' }
          if (critter.x + critter.width > max) { critter.x = max - critter.width; critter.dir = -1; critter.node.dataset.dir = 'left' }
        }
        critter.node.style.transform = `translateX(${critter.x.toFixed(1)}px)`
      }
    }
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0 }
      else if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick) }
    }
    frame = requestAnimationFrame(tick)
    document.addEventListener('visibilitychange', onVisibility)
    return () => { cancelAnimationFrame(frame); document.removeEventListener('visibilitychange', onVisibility) }
  }, [])

  const greet = id => {
    const word = GREETINGS[Math.floor(Math.random() * GREETINGS.length)]
    setGreeting(current => ({ ...current, [id]: word }))
    window.setTimeout(() => setGreeting(current => ({ ...current, [id]: '' })), 1400)
  }

  return <div ref={layerRef} className={s.critterLayer} data-critter-layer="true">
    {CRITTERS.map(critter => <button
      key={critter.id}
      type="button"
      className={s.critter}
      data-critter={critter.kind}
      data-mode="pause"
      data-dir={critter.kind === 'ant' ? 'right' : 'left'}
      style={{ transform: `translateX(${critter.start * 100}%)` }}
      aria-label={`Say hi to the ${critter.kind}`}
      onClick={() => greet(critter.id)}
    >
      <span className={s.critterThink} aria-hidden="true"><i /><i /><i /></span>
      {greeting[critter.id] && <span className={s.critterSay} aria-hidden="true">{greeting[critter.id]}</span>}
      {critter.kind === 'snail' ? <SnailSprite /> : <AntSprite />}
    </button>)}
  </div>
}
