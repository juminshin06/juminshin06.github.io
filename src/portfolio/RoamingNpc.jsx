import { useEffect, useRef, useState } from 'react'
import { askJumin } from './ChatBot'
import s from './Portfolio.module.css'

const MODEL_SRC = '/assets/3d/jumin-npc.glb'
const W = 64            // character box, with her feet at the bottom center
const H = 96
const CELL = 16         // walkable grid resolution
const PAD = 12          // room she keeps from words and pictures
const EDGE = 12         // room she keeps from the viewport edges
const SPEED = 64        // px per second while wandering
const CHASE = 104       // px per second while following the pointer
const NEAR = 64         // how close she comes to the pointer without standing under it
const PITCH = '78deg'

// Everything she must never stand on: text, links, controls and media.
const AVOID = [
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'dt', 'dd', 'blockquote', 'figcaption', 'label', 'small', 'time',
  'a', 'button', 'input', 'textarea', 'select', 'form', 'table',
  'img', 'picture', 'video', 'svg', 'model-viewer', 'iframe', 'canvas:not([data-npc-floor])',
  '[data-chat-panel]', '[data-npc-avoid]',
].join(',')

// Small UX design engineering beliefs she muses on while hovered, one at a time.
const THOUGHTS = [
  'Prototype the question, not just the answer.',
  'If nobody has tested it, it’s still a guess.',
  'Good UX is often just one fewer step.',
  'Design the empty state first.',
  'Accessibility is a feature, not a checklist.',
  'Ship the smallest thing that teaches you something.',
  'Every loading spinner is a design decision.',
  'Talk to five users before writing five hundred lines.',
  'Make the right action the easy action.',
  'Real content breaks pretty mockups. Use it early.',
  'Errors are part of the flow. Design them too.',
  'Motion should explain, not decorate.',
  'Code is the most honest prototype.',
  'AI should feel like a collaborator, not a black box.',
  'Trust lives in the details: copy, timing, feedback.',
  'Watch what people do, then ask why.',
  'Clarity beats cleverness.',
  'A design system is a promise of consistency.',
]
const THOUGHT_MS = 3200
const HOLD_MS = 280      // a press this long picks her up instead of clicking
const GRIP = 18          // the pointer holds her by the head, this far below its tip

// The empty space in the current viewport as a grid of cells where her feet may stand.
function scan(self) {
  const vw = document.documentElement.clientWidth
  const vh = window.innerHeight
  const cols = Math.floor(vw / CELL)
  const rows = Math.floor(vh / CELL)
  const free = new Uint8Array(cols * rows)
  const top = Math.max(0, document.querySelector('header')?.getBoundingClientRect().bottom || 0)
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x = c * CELL + CELL / 2
    const y = r * CELL + CELL / 2
    free[r * cols + c] = x > W / 2 + EDGE && x < vw - W / 2 - EDGE && y - H > top + EDGE && y < vh - EDGE ? 1 : 0
  }
  for (const node of document.querySelectorAll(AVOID)) {
    if (self.contains(node)) continue
    const box = node.getBoundingClientRect()
    if (box.width < 2 || box.height < 2 || box.bottom < 0 || box.top > vh + H || box.right < 0 || box.left > vw) continue
    // Feet positions whose body box would touch this element.
    const c0 = Math.max(0, Math.floor((box.left - W / 2 - PAD) / CELL))
    const c1 = Math.min(cols - 1, Math.floor((box.right + W / 2 + PAD) / CELL))
    const r0 = Math.max(0, Math.floor((box.top - PAD) / CELL))
    const r1 = Math.min(rows - 1, Math.floor((box.bottom + H + PAD) / CELL))
    for (let r = r0; r <= r1; r++) free.fill(0, r * cols + c0, r * cols + c1 + 1)
  }
  const cellAt = (x, y) => {
    const c = Math.floor((x - window.scrollX) / CELL)
    const r = Math.floor((y - window.scrollY) / CELL)
    return c < 0 || r < 0 || c >= cols || r >= rows ? -1 : r * cols + c
  }
  const point = i => ({ x: (i % cols) * CELL + CELL / 2 + window.scrollX, y: Math.floor(i / cols) * CELL + CELL / 2 + window.scrollY })
  return { cols, rows, free, cellAt, point }
}

// Breadth-first walk over free cells, so every route stays on empty space.
function explore(grid, start) {
  const { cols, rows, free } = grid
  const dist = new Int32Array(free.length).fill(-1)
  const prev = new Int32Array(free.length).fill(-1)
  const reached = [start]
  dist[start] = 0
  for (let head = 0; head < reached.length; head++) {
    const i = reached[head]
    const c = i % cols
    const r = (i - c) / cols
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc
      const nr = r + dr
      if (nc < 0 || nr < 0 || nc >= cols || nr >= rows) continue
      const n = nr * cols + nc
      if (!free[n] || dist[n] !== -1) continue
      dist[n] = dist[i] + 1
      prev[n] = i
      reached.push(n)
    }
  }
  return { dist, prev, reached }
}

// True when the straight line between two cells only crosses free cells.
function clearLine(grid, a, b) {
  const pa = grid.point(a)
  const pb = grid.point(b)
  const steps = Math.ceil(Math.hypot(pb.x - pa.x, pb.y - pa.y) / (CELL / 2))
  for (let k = 1; k < steps; k++) {
    const cell = grid.cellAt(pa.x + (pb.x - pa.x) * k / steps, pa.y + (pb.y - pa.y) * k / steps)
    if (cell < 0 || !grid.free[cell]) return false
  }
  return true
}

// A small 3D Jumin who walks the empty parts of the page like a game NPC. She follows the
// pointer around text and pictures, wanders when it rests, drops back into view after a
// scroll, and shares UX design engineering thoughts on hover.
export default function RoamingNpc() {
  const [enabled, setEnabled] = useState(false)
  const [line, setLine] = useState('')
  const rootRef = useRef(null)
  const viewerRef = useRef(null)
  const bubbleRef = useRef(null)
  const clickGuard = useRef(() => false)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || motion.matches || window.innerWidth < 768) return
    let disposed = false
    const timer = window.setTimeout(() => import('@google/model-viewer').then(() => { if (!disposed) setEnabled(true) }), 1600)
    return () => { disposed = true; window.clearTimeout(timer) }
  }, [])

  useEffect(() => {
    const el = rootRef.current
    const viewer = viewerRef.current
    if (!enabled || !el || !viewer) return
    const npc = { x: 0, y: 0, path: [], theta: 0, until: 0, away: 0, ready: false, planned: 0, goalFor: null, poofed: 0 }
    // The pointer in viewport coordinates; she follows it while it has moved in the last few seconds.
    const mouse = { x: 0, y: 0, at: 0 }
    const following = () => performance.now() - mouse.at < 8000
    const cursor = () => ({ x: mouse.x + window.scrollX, y: mouse.y + window.scrollY })
    const timers = new Set()
    const later = (fn, ms) => { const id = window.setTimeout(() => { timers.delete(id); fn() }, ms); timers.add(id) }
    let frame = 0
    let last = 0

    const setState = state => { el.dataset.state = state }
    const place = () => { el.style.transform = `translate3d(${npc.x.toFixed(1)}px, ${npc.y.toFixed(1)}px, 0)` }
    const face = theta => {
      let next = theta
      while (next - npc.theta > 180) next -= 360
      while (next - npc.theta < -180) next += 360
      npc.theta = next
      viewer.cameraOrbit = `${next.toFixed(1)}deg ${PITCH} auto`
    }
    // Front when walking down the page, back when walking up, profile when walking sideways.
    const faceToward = target => face(-Math.atan2(target.x - npc.x, target.y - npc.y) * 180 / Math.PI)
    // Standing still she turns toward the pointer, never further than a three-quarter view.
    const lookAtPointer = () => face(following() ? Math.max(-60, Math.min(60, -(cursor().x - npc.x) / 5)) : 0)
    const rest = (min = 1400, spread = 3200) => {
      setState('idle')
      lookAtPointer()
      npc.path = []
      npc.until = performance.now() + (following() ? 200 + Math.random() * 300 : min + Math.random() * spread)
    }
    // The empty cell nearest the pointer that keeps her body out from under it.
    const nearPointer = (grid, cells) => {
      const { x, y } = cursor()
      let best = -1
      let bestScore = Infinity
      for (const i of cells) {
        const p = grid.point(i)
        const body = Math.hypot(p.x - x, p.y - H / 2 - y)
        if (body < NEAR) continue
        const score = Math.hypot(p.x - x, p.y - y)
        if (score < bestScore) { bestScore = score; best = i }
      }
      return best
    }
    const pointerMoved = () => !npc.goalFor || Math.hypot(cursor().x - npc.goalFor.x, cursor().y - npc.goalFor.y) > 40
    const hide = () => { setState('hidden'); npc.path = [] }

    // Fall into a random empty spot in the current view.
    const spawn = grid => {
      const spots = []
      for (let i = 0; i < grid.free.length; i++) if (grid.free[i]) spots.push(i)
      if (!spots.length) return hide()
      const near = following() ? nearPointer(grid, spots) : -1
      Object.assign(npc, grid.point(near >= 0 ? near : spots[Math.floor(Math.random() * spots.length)]))
      npc.away = 0
      place()
      face(0)
      setState('drop')
      later(() => { if (el.dataset.state === 'drop') rest(900, 1800) }, 700)
    }
    const poof = spot => {
      npc.poofed = performance.now()
      npc.path = []
      setState('poof')
      later(() => {
        Object.assign(npc, spot)
        place()
        lookAtPointer()
        setState('drop')
        later(() => { if (el.dataset.state === 'drop') rest() }, 700)
      }, 240)
    }
    // Hop to the nearest empty cell when the page shifts under her.
    const relocate = grid => {
      const here = grid.cellAt(npc.x, npc.y)
      const hc = here < 0 ? 0 : here % grid.cols
      const hr = here < 0 ? 0 : Math.floor(here / grid.cols)
      let best = -1
      let bestDistance = Infinity
      for (let i = 0; i < grid.free.length; i++) {
        if (!grid.free[i]) continue
        const d = Math.hypot(i % grid.cols - hc, Math.floor(i / grid.cols) - hr)
        if (d < bestDistance) { bestDistance = d; best = i }
      }
      if (best < 0) return hide()
      if (bestDistance > 24) return spawn(grid)
      Object.assign(npc, grid.point(best))
      setState('hop')
      place()
      later(() => { if (el.dataset.state === 'hop') rest(600, 1200) }, 460)
    }
    const wander = () => {
      const grid = scan(el)
      const start = grid.cellAt(npc.x, npc.y)
      if (start < 0 || !grid.free[start]) return relocate(grid)
      const { dist, prev, reached } = explore(grid, start)
      npc.planned = performance.now()
      let goal
      if (following()) {
        // Walk to the reachable empty spot closest to the pointer.
        npc.goalFor = cursor()
        goal = nearPointer(grid, reached)
        // When text walls the pointer off, pop out and back in beside it rather than cross the words.
        const anywhere = nearPointer(grid, grid.free.reduce((cells, open, i) => (open ? (cells.push(i), cells) : cells), []))
        const gap = spot => (spot < 0 ? Infinity : Math.hypot(grid.point(spot).x - npc.goalFor.x, grid.point(spot).y - npc.goalFor.y))
        if (anywhere >= 0 && gap(goal) - gap(anywhere) > 180 && performance.now() - npc.poofed > 2500) return poof(grid.point(anywhere))
        if (goal < 0 || dist[goal] < 2) return rest()
      } else {
        npc.goalFor = null
        const options = reached.filter(i => dist[i] >= 5 && dist[i] <= 32)
        if (!options.length) return rest()
        goal = options[Math.floor(Math.random() * options.length)]
      }
      const cells = []
      for (let i = goal; i !== -1; i = prev[i]) cells.unshift(i)
      // Straighten the grid route into a few waypoints she can see between.
      const waypoints = []
      for (let k = 0; k < cells.length - 1;) {
        let j = cells.length - 1
        while (j > k + 1 && !clearLine(grid, cells[k], cells[j])) j--
        waypoints.push(grid.point(cells[j]))
        k = j
      }
      npc.path = waypoints
      faceToward(waypoints[0])
      setState('walk')
    }

    const tick = now => {
      frame = requestAnimationFrame(tick)
      const dt = Math.min(0.05, (now - (last || now)) / 1000)
      last = now
      const state = el.dataset.state
      if (state === 'walk') {
        // Re-route when the pointer has moved on since this walk was planned.
        if (following() && now - npc.planned > 450 && pointerMoved()) return wander()
        const target = npc.path[0]
        if (!target) return rest()
        const dx = target.x - npc.x
        const dy = target.y - npc.y
        const distance = Math.hypot(dx, dy)
        const step = (npc.goalFor ? CHASE : SPEED) * dt
        if (distance <= step) {
          npc.x = target.x
          npc.y = target.y
          npc.path.shift()
          if (npc.path[0]) faceToward(npc.path[0])
        } else {
          npc.x += dx / distance * step
          npc.y += dy / distance * step
        }
        place()
      } else if (state === 'idle' && (now > npc.until || (following() && pointerMoved()))) wander()
    }

    // Once a second: come back into view after a scroll, and step off anything that moved under her.
    const watch = () => {
      // A cached model can finish loading before the listener is attached.
      if (!npc.ready && viewer.loaded) onLoad()
      if (document.hidden || !npc.ready) return
      // She steps aside while the recruiter view is open and comes back when it closes.
      if (recruiting()) {
        if (el.dataset.state !== 'hidden') { window.clearInterval(musing); setLine(''); hide() }
        return
      }
      const state = el.dataset.state
      if (state === 'talk' || state === 'drop' || state === 'hop' || state === 'poof' || state === 'grab') return
      const grid = scan(el)
      const here = grid.cellAt(npc.x, npc.y)
      if (state === 'hidden' || here < 0) {
        npc.away += 1
        if (state === 'hidden' || npc.away >= 2) spawn(grid)
        return
      }
      npc.away = 0
      if (!grid.free[here]) relocate(grid)
    }
    const watcher = window.setInterval(watch, 1000)

    const start = () => { if (!frame) { last = 0; frame = requestAnimationFrame(tick) } }
    const stop = () => { cancelAnimationFrame(frame); frame = 0 }
    const onVisibility = () => (document.hidden ? stop() : start())
    const recruiting = () => new URLSearchParams(window.location.search).get('mode') === 'recruiter'
    const onLoad = () => { npc.ready = true; if (!recruiting()) spawn(scan(el)) }

    const onPointerMove = event => {
      if (event.pointerType !== 'mouse') return
      mouse.x = event.clientX
      mouse.y = event.clientY
      mouse.at = performance.now()
      if (el.dataset.state === 'idle') lookAtPointer()
    }
    const onPointerOut = event => { if (!event.relatedTarget) mouse.at = 0 }

    // While hovered she keeps sharing a new thought every few seconds, never the same one twice in a row.
    let thought = -1
    let musing = 0
    const nextThought = () => {
      let next = Math.floor(Math.random() * THOUGHTS.length)
      if (next === thought) next = (next + 1) % THOUGHTS.length
      thought = next
      setLine(THOUGHTS[next])
    }
    const onEnter = () => {
      if (el.dataset.state === 'hidden') return
      stop()
      setState('talk')
      face(0)
      nextThought()
      window.clearInterval(musing)
      musing = window.setInterval(nextThought, THOUGHT_MS)
    }
    const onLeave = () => {
      window.clearInterval(musing)
      setLine('')
      if (el.dataset.state !== 'talk') return
      rest(500, 1500)
      start()
    }

    // Press and hold to pick her up: she hangs from the pointer, swings with its motion and
    // kicks her legs, then drops onto the nearest empty spot when let go.
    const grab = { press: 0, active: false, settle: 0, id: 0, lastX: 0, lastAt: 0, tilt: 0, kick: 0, startX: 0, startY: 0 }
    const hang = (x, y) => {
      npc.x = x + window.scrollX
      npc.y = y + window.scrollY + H - GRIP
      place()
    }
    const pickUp = event => {
      window.clearTimeout(grab.press)
      grab.active = true
      grab.lastX = event.clientX
      grab.lastAt = performance.now()
      grab.tilt = 0
      window.clearInterval(musing)
      setLine('')
      stop()
      npc.path = []
      try { el.setPointerCapture(grab.id) } catch { /* pointer already released */ }
      setState('grab')
      hang(event.clientX, event.clientY)
      // Struggle: her body twists left and right while she dangles.
      let side = 1
      face(30)
      grab.kick = window.setInterval(() => { side *= -1; face(side * (24 + Math.random() * 14)) }, 230)
      // The swing settles back to hanging straight when the pointer stops moving.
      grab.settle = window.setInterval(() => {
        grab.tilt *= 0.8
        el.style.setProperty('--swing', `${grab.tilt.toFixed(1)}deg`)
      }, 50)
    }
    const onPointerDown = event => {
      if (event.button !== 0 || el.dataset.state === 'hidden') return
      grab.id = event.pointerId
      grab.startX = event.clientX
      grab.startY = event.clientY
      grab.press = window.setTimeout(() => pickUp(event), HOLD_MS)
    }
    const onGrabMove = event => {
      if (!grab.active) {
        // Dragging before the hold time also picks her up.
        if (grab.press && Math.hypot(event.clientX - grab.startX, event.clientY - grab.startY) > 6) pickUp(event)
        return
      }
      const now = performance.now()
      const velocity = (event.clientX - grab.lastX) / Math.max(16, now - grab.lastAt)
      grab.lastX = event.clientX
      grab.lastAt = now
      // She swings opposite to the pointer's motion, like a pendulum.
      grab.tilt = Math.max(-32, Math.min(32, grab.tilt * 0.6 - velocity * 22))
      el.style.setProperty('--swing', `${grab.tilt.toFixed(1)}deg`)
      hang(event.clientX, event.clientY)
    }
    const letGo = () => {
      window.clearTimeout(grab.press)
      grab.press = 0
      if (!grab.active) return
      grab.active = false
      grab.dropped = true
      window.setTimeout(() => { grab.dropped = false }, 0)
      window.clearInterval(grab.kick)
      window.clearInterval(grab.settle)
      el.style.setProperty('--swing', '0deg')
      try { el.releasePointerCapture(grab.id) } catch { /* already released */ }
      const grid = scan(el)
      const here = grid.cellAt(npc.x, npc.y)
      start()
      if (here >= 0 && grid.free[here]) {
        face(0)
        setState('drop')
        later(() => { if (el.dataset.state === 'drop') rest(600, 1200) }, 700)
      } else relocate(grid)
    }
    clickGuard.current = () => grab.dropped

    viewer.addEventListener('load', onLoad)
    el.addEventListener('pointerdown', onPointerDown)
    el.addEventListener('pointermove', onGrabMove)
    el.addEventListener('pointerup', letGo)
    el.addEventListener('pointercancel', letGo)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('pointerout', onPointerOut)
    if (viewer.loaded) onLoad()
    el.addEventListener('pointerenter', onEnter)
    el.addEventListener('pointerleave', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    hide()
    start()
    return () => {
      stop()
      window.clearInterval(watcher)
      window.clearInterval(musing)
      timers.forEach(id => window.clearTimeout(id))
      viewer.removeEventListener('load', onLoad)
      window.clearTimeout(grab.press)
      window.clearInterval(grab.kick)
      window.clearInterval(grab.settle)
      el.removeEventListener('pointerdown', onPointerDown)
      el.removeEventListener('pointermove', onGrabMove)
      el.removeEventListener('pointerup', letGo)
      el.removeEventListener('pointercancel', letGo)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('pointerout', onPointerOut)
      el.removeEventListener('pointerenter', onEnter)
      el.removeEventListener('pointerleave', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [enabled])

  // Keep the speech bubble inside the viewport when she stands near an edge.
  useEffect(() => {
    const bubble = bubbleRef.current
    if (!bubble) return
    bubble.style.setProperty('--shift', '0px')
    if (!line) return
    // Measure from her center and the bubble's layout width, not its mid-animation transform.
    const npcBox = rootRef.current.getBoundingClientRect()
    const center = npcBox.left + npcBox.width / 2
    const half = bubble.offsetWidth / 2
    const vw = document.documentElement.clientWidth
    const shift = center - half < 12 ? 12 - (center - half) : center + half > vw - 12 ? vw - 12 - (center + half) : 0
    bubble.style.setProperty('--shift', `${shift}px`)
  }, [line])

  if (!enabled) return null
  return <div ref={rootRef} className={s.npc} data-state="hidden" data-cursor="Chat" aria-hidden="true" onClick={() => { if (!clickGuard.current()) askJumin('') }}>
    <div ref={bubbleRef} className={s.npcBubble} data-open={line ? 'true' : 'false'}>
      <p key={line}>{line}</p>
      <span>Click me to ask about Jumin</span>
    </div>
    <span className={s.npcShadow} />
    <div className={s.npcBody}>
      <model-viewer
        ref={viewerRef}
        src={MODEL_SRC}
        alt=""
        camera-orbit={`0deg ${PITCH} auto`}
        field-of-view="30deg"
        interpolation-decay="90"
        interaction-prompt="none"
        shadow-intensity="0"
        exposure="1.05"
        loading="eager"
      />
    </div>
  </div>
}
