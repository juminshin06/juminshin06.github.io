import { useEffect, useRef } from 'react'
import s from './Portfolio.module.css'

const INTERACTIVE = 'a, button, [role="button"], model-viewer, [data-cursor]'

// Custom cursor for pointer devices: the OS cursor becomes a small ink mark (see index.css)
// and this ring trails it, opening up over links and showing a word over project covers.
export default function Cursor() {
  const ringRef = useRef(null)

  useEffect(() => {
    const ring = ringRef.current
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (!ring || !fine.matches) return
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    const label = ring.firstElementChild
    const root = document.documentElement
    root.dataset.customCursor = 'true'
    let x = -100, y = -100, cx = -100, cy = -100, frame = 0

    const tick = () => {
      frame = 0
      const ease = motion.matches ? 1 : 0.24
      cx += (x - cx) * ease
      cy += (y - cy) * ease
      ring.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0)`
      if (Math.abs(x - cx) > 0.2 || Math.abs(y - cy) > 0.2) frame = requestAnimationFrame(tick)
    }
    const onPointerMove = event => {
      if (event.pointerType === 'touch') return
      x = event.clientX
      y = event.clientY
      ring.dataset.visible = 'true'
      const hit = event.target.closest?.(INTERACTIVE)
      const word = hit?.closest('[data-cursor]')?.dataset.cursor || ''
      ring.dataset.state = hit ? (word ? 'word' : 'link') : 'idle'
      if (label.textContent !== word) label.textContent = word
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const onPointerLeave = () => { ring.dataset.visible = 'false' }
    const onPointerDown = () => { ring.dataset.pressed = 'true' }
    const onPointerUp = () => { ring.dataset.pressed = 'false' }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    root.addEventListener('pointerleave', onPointerLeave)
    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('blur', onPointerLeave)
    return () => {
      cancelAnimationFrame(frame)
      delete root.dataset.customCursor
      window.removeEventListener('pointermove', onPointerMove)
      root.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('blur', onPointerLeave)
    }
  }, [])

  return <div ref={ringRef} className={s.cursorRing} data-visible="false" data-state="idle" aria-hidden="true"><span /></div>
}
