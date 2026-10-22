import { useEffect, useRef, useState } from 'react'
import s from './Portfolio.module.css'

const MODEL_SRC = '/assets/3d/jumin-character.glb'
const POSTER_SRC = '/assets/3d/jumin-character-poster.webp'
const REST = { theta: 0, phi: 86 }

// The 3D character as a small header mark. Pointer devices get the live model once the page
// is idle, and the head turns to follow the cursor; touch devices keep the static poster.
export default function LogoCharacter() {
  const viewerRef = useRef(null)
  const [live, setLive] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || motion.matches) return
    let disposed = false
    const idle = window.requestIdleCallback || (callback => window.setTimeout(callback, 800))
    const cancelIdle = window.cancelIdleCallback || window.clearTimeout
    const handle = idle(() => import('@google/model-viewer').then(() => { if (!disposed) setLive(true) }))
    return () => { disposed = true; cancelIdle(handle) }
  }, [])

  useEffect(() => {
    const viewer = viewerRef.current
    if (!live || !viewer) return
    let frame = 0
    const current = { ...REST }
    const target = { ...REST }
    const tick = () => {
      frame = 0
      current.theta += (target.theta - current.theta) * 0.1
      current.phi += (target.phi - current.phi) * 0.1
      viewer.cameraOrbit = `${current.theta.toFixed(2)}deg ${current.phi.toFixed(2)}deg 0.82m`
      if (Math.abs(target.theta - current.theta) > 0.05 || Math.abs(target.phi - current.phi) > 0.05) frame = requestAnimationFrame(tick)
    }
    const onPointerMove = event => {
      const box = viewer.getBoundingClientRect()
      const dx = event.clientX - (box.left + box.width / 2)
      const dy = event.clientY - (box.top + box.height / 2)
      // Negative theta swings the camera toward the pointer's side, so the face follows it.
      target.theta = Math.max(-55, Math.min(55, -dx / 10))
      target.phi = REST.phi + Math.max(-14, Math.min(22, dy / 22))
      if (!frame) frame = requestAnimationFrame(tick)
    }
    const onPointerLeave = () => { Object.assign(target, REST); if (!frame) frame = requestAnimationFrame(tick) }
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onPointerLeave)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      document.documentElement.removeEventListener('pointerleave', onPointerLeave)
    }
  }, [live])

  return <span className={s.logoCharacter} data-logo-character={live ? 'live' : 'still'} aria-hidden="true">
    {live
      ? <model-viewer
          ref={viewerRef}
          src={MODEL_SRC}
          poster={POSTER_SRC}
          alt=""
          camera-target="0m 0.46m 0m"
          camera-orbit="0deg 86deg 0.82m"
          field-of-view="30deg"
          interaction-prompt="none"
          shadow-intensity="0"
          exposure="1.05"
          loading="eager"
          reveal="auto"
        />
      : <img src={POSTER_SRC} width="48" height="60" alt="" decoding="async" />}
  </span>
}
