import { useEffect, useRef, useState } from 'react'
import { FEED_EVENT } from './Toolkit'
import s from './Portfolio.module.css'

// Quiet pixel critters that live on the footer's top rule rather than following the visitor
// around: a little line of three ants that travels together, and a snail. They keep ambling
// with short pauses, think when hovered, and say something about how Jumin works when clicked.
// Clicking a tool icon drops a crumb; the nearest free critter hurries over, eats it and speaks.
const CRITTERS = [
  { id: 'ant-1', kind: 'ant', index: 0 },
  { id: 'ant-2', kind: 'ant', index: 1 },
  { id: 'ant-3', kind: 'ant', index: 2 },
  { id: 'snail', kind: 'snail', index: 0 },
]
const GROUPS = [
  { kind: 'ant', speed: 30, start: 0.2 },
  { kind: 'snail', speed: 9, start: 0.7 },
]
const ANT_GAP = 6
const LINES = {
  snail: ['I may be slow, but I never stop moving toward my goal.'],
  ant: [
    'I adapt fast and blend right into the team.',
    'New crew, new trail? I find my place quickly.',
    'Alone I’m small. Together we carry a lot.',
    'I listen first, then pull my weight.',
  ],
}
const SAY_MS = 3600
const SEEK = { ant: 2.4, snail: 3 }   // how much faster they move when there's food
const MEALS = {
  ant: [name => `Yum, ${name}! Teamwork tastes better.`, name => `${name} crumbs? We’ll carry these home together.`, name => `Shared ${name} snack. Every team needs one.`],
  snail: [name => `Mmm, ${name}… worth the slow trip.`, name => `Slow and steady gets the ${name}.`],
}

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
  const [said, setSaid] = useState({})
  const turn = useRef({ ant: 0, snail: 0 })
  const timers = useRef({})
  const sayRef = useRef(null)

  useEffect(() => {
    const layer = layerRef.current
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!layer || motion.matches) return
    // Each group walks as one unit; the ants keep their places in line.
    const groups = GROUPS.map((spec, index) => {
      const nodes = [...layer.querySelectorAll(`[data-critter='${spec.kind}']`)]
      const width = nodes.reduce((sum, node) => sum + node.offsetWidth, 0) + ANT_GAP * (nodes.length - 1)
      return { spec, nodes, width, x: layer.offsetWidth * spec.start, dir: index % 2 ? -1 : 1, mode: 'pause', until: 0, food: null, meals: 0 }
    })
    let frame = 0
    let last = performance.now()
    const mark = group => group.nodes.forEach(node => {
      node.dataset.mode = group.mode
      node.dataset.dir = group.dir > 0 ? 'right' : 'left'
    })
    const schedule = (group, now) => {
      // Mostly on the move, with short breathers in between.
      const walking = Math.random() < 0.7
      group.mode = walking ? 'walk' : 'pause'
      group.until = now + (walking ? 3000 + Math.random() * 4000 : 1000 + Math.random() * 2000)
      if (walking && Math.random() < 0.4) group.dir *= -1
      mark(group)
    }
    const place = group => {
      let offset = group.x
      for (const node of group.nodes) {
        node.style.transform = `translateX(${offset.toFixed(1)}px)`
        offset += node.offsetWidth + ANT_GAP
      }
    }

    // Food: crumbs waiting on the line, each eaten by the nearest critter group that is free.
    const foods = []
    const assign = () => {
      for (const food of [...foods]) {
        const free = groups.filter(group => !group.food)
        if (!free.length) return
        const nearest = free.reduce((best, group) => (Math.abs(group.x + group.width / 2 - food.x) < Math.abs(best.x + best.width / 2 - food.x) ? group : best))
        nearest.food = food
        foods.splice(foods.indexOf(food), 1)
      }
    }
    const seek = (group, now, dt) => {
      const food = group.food
      const right = food.x > group.x + group.width / 2
      // Stop with the front critter's head at the crumb.
      const target = right ? food.x - group.width + 4 : food.x - 4
      const gap = target - group.x
      group.dir = gap >= 0 ? 1 : -1
      if (Math.abs(gap) > 1) {
        group.mode = 'walk'
        const step = group.spec.speed * SEEK[group.spec.kind] * dt / 1000
        group.x += Math.sign(gap) * Math.min(Math.abs(gap), step)
        mark(group)
        return
      }
      group.mode = 'pause'
      group.dir = right ? 1 : -1
      mark(group)
      if (!food.landed || food.eating) return
      food.eating = true
      food.els.forEach(el => { el.animate([{ transform: 'scale(1)', opacity: 1 }, { transform: 'scale(.6) translateY(1px)', opacity: 1, offset: .5 }, { transform: 'scale(0)', opacity: 0 }], { duration: 650, easing: 'ease-in', fill: 'forwards' }).onfinish = () => el.remove() })
      const front = group.dir > 0 ? group.nodes[group.nodes.length - 1] : group.nodes[0]
      const critter = CRITTERS.find(item => item.kind === group.spec.kind && String(item.index) === front.dataset.index)
      const lines = MEALS[group.spec.kind]
      sayRef.current?.(critter, lines[group.meals++ % lines.length](food.name), front)
      group.food = null
      group.until = now + 1800
    }
    // A crumb falls from the clicked icon to the line, with a little bounce, then waits to be eaten.
    // Repeat clicks on the same tool pile their crumbs onto that tool's meal: one trip, one line.
    const onFeed = event => {
      const box = layer.getBoundingClientRect()
      if (!box.width) return
      const { name, color, x, y } = event.detail
      const pending = foods.find(item => item.name === name) || groups.map(group => group.food).find(item => item?.name === name && !item.eating)
      const left = pending ? pending.x + (Math.random() * 8 - 4) : Math.max(16, Math.min(box.width - 16, x - box.left))
      const el = document.createElement('span')
      el.className = s.critterCrumb
      el.style.setProperty('--crumb', color)
      el.style.left = `${left}px`
      layer.appendChild(el)
      const drop = Math.min(-8, y - box.top)
      const food = pending || { x: left, name, els: [], landed: false, eating: false }
      food.els.push(el)
      el.animate([
        { transform: `translateY(${drop}px) rotate(0deg)` },
        { transform: 'translateY(0) rotate(160deg)', offset: .8, easing: 'ease-out' },
        { transform: 'translateY(-7px) rotate(190deg)', offset: .9, easing: 'ease-in' },
        { transform: 'translateY(0) rotate(210deg)' },
      ], { duration: Math.round(Math.min(1300, 520 + Math.abs(drop) * 0.55)), easing: 'cubic-bezier(.45, 0, .9, .6)', fill: 'forwards' }).onfinish = () => { food.landed = true }
      if (pending) return
      foods.push(food)
      assign()
    }
    window.addEventListener(FEED_EVENT, onFeed)

    const tick = now => {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(now - last, 64)
      last = now
      const max = layer.offsetWidth - 12
      for (const group of groups) {
        if (!group.food && foods.length) assign()
        if (group.food) { seek(group, now, dt); place(group); continue }
        if (now >= group.until) schedule(group, now)
        const hovered = group.nodes.some(node => node.matches(':hover'))
        if (group.mode === 'walk' && !hovered) {
          group.x += group.dir * group.spec.speed * dt / 1000
          if (group.x < 12) { group.x = 12; group.dir = 1; mark(group) }
          if (group.x + group.width > max) { group.x = max - group.width; group.dir = -1; mark(group) }
        }
        place(group)
      }
    }
    const onVisibility = () => {
      if (document.hidden) { cancelAnimationFrame(frame); frame = 0 }
      else if (!frame) { last = performance.now(); frame = requestAnimationFrame(tick) }
    }
    frame = requestAnimationFrame(tick)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      cancelAnimationFrame(frame)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener(FEED_EVENT, onFeed)
    }
  }, [])

  // Shows a line over one critter, kept inside the footer edges; only one of its kind talks at a time.
  const say = (critter, text, node) => {
    const layer = layerRef.current.getBoundingClientRect()
    const box = node.getBoundingClientRect()
    const center = box.left + box.width / 2
    const align = center - layer.left < 130 ? 'start' : layer.right - center < 130 ? 'end' : 'center'
    // Only one ant talks at a time: a new bubble closes the others in the line.
    const siblings = CRITTERS.filter(item => item.kind === critter.kind)
    siblings.forEach(item => window.clearTimeout(timers.current[item.id]))
    setSaid(current => ({
      ...current,
      ...Object.fromEntries(siblings.map(item => [item.id, null])),
      [critter.id]: { text, align, key: Date.now() },
    }))
    timers.current[critter.id] = window.setTimeout(() => setSaid(current => ({ ...current, [critter.id]: null })), SAY_MS)
  }
  sayRef.current = say
  // Each click shows the next line for that kind of critter.
  const speak = (critter, event) => {
    const lines = LINES[critter.kind]
    const text = lines[turn.current[critter.kind] % lines.length]
    turn.current[critter.kind] += 1
    say(critter, text, event.currentTarget)
  }

  return <div ref={layerRef} className={s.critterLayer} data-critter-layer="true">
    {CRITTERS.map(critter => {
      const group = GROUPS.find(item => item.kind === critter.kind)
      const line = said[critter.id]
      return <button
        key={critter.id}
        type="button"
        className={s.critter}
        data-critter={critter.kind}
        data-index={critter.index}
        data-mode="pause"
        data-dir={critter.kind === 'ant' ? 'right' : 'left'}
        data-say-align={line?.align}
        style={{ transform: `translateX(calc(${group.start * 100}% + ${critter.index * 36}px))` }}
        aria-label={critter.kind === 'snail' ? 'Hear from the snail' : `Hear from ant ${critter.index + 1}`}
        onClick={event => speak(critter, event)}
      >
        <span className={s.critterThink} aria-hidden="true"><i /><i /><i /></span>
        {line && <span key={line.key} className={s.critterSay} role="status">{line.text}</span>}
        {critter.kind === 'snail' ? <SnailSprite /> : <AntSprite />}
      </button>
    })}
  </div>
}
