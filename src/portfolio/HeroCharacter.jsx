import { useEffect, useRef } from 'react'
import s from './Portfolio.module.css'

const MODEL_SRC = '/assets/3d/jumin-character.glb'
const POSTER_SRC = '/assets/3d/jumin-character-poster.webp'
const REST_ORBIT = { theta: 0, phi: 82 }
const IDLE_DELAY_MS = 2400
const IDLE_DEG_PER_MS = 18 / 1000

// Hero 3D character: follows the pointer around the full 360°, can be dragged directly,
// and drifts into a slow spin when left alone. One loop owns the camera so the spin and
// the pointer never disagree about which way is front. Reduced motion leaves only drag.
export default function HeroCharacter() {
  const viewerRef = useRef(null)

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return
    let disposed = false
    let dragging = false
    let frame = 0
    let last = 0
    let lastPointer = -Infinity
    const current = { ...REST_ORBIT }
    const target = { ...REST_ORBIT }
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)')

    const tick = now => {
      frame = requestAnimationFrame(tick)
      const elapsed = Math.min(now - (last || now), 64)
      last = now
      if (dragging || motion.matches) return
      if (now - lastPointer > IDLE_DELAY_MS) target.theta += elapsed * IDLE_DEG_PER_MS
      current.theta += (target.theta - current.theta) * 0.12
      current.phi += (target.phi - current.phi) * 0.12
      viewer.cameraOrbit = `${current.theta.toFixed(2)}deg ${current.phi.toFixed(2)}deg auto`
    }

    const onPointerMove = event => {
      if (motion.matches || dragging || event.pointerType === 'touch') return
      const pointerTheta = -(event.clientX / window.innerWidth - 0.5) * 360
      // Pick the copy of the pointer angle nearest the camera so it never unwinds a long spin.
      target.theta = pointerTheta + 360 * Math.round((current.theta - pointerTheta) / 360)
      target.phi = REST_ORBIT.phi + (event.clientY / window.innerHeight - 0.5) * 28
      lastPointer = performance.now()
    }
    const onPointerDown = () => { dragging = true }
    const onPointerUp = () => {
      if (!dragging) return
      dragging = false
      const orbit = viewer.getCameraOrbit()
      current.theta = target.theta = orbit.theta * 180 / Math.PI
      current.phi = target.phi = orbit.phi * 180 / Math.PI
      lastPointer = performance.now()
    }
    const onMotionChange = () => {
      if (!motion.matches) return
      Object.assign(current, REST_ORBIT)
      Object.assign(target, REST_ORBIT)
      viewer.cameraOrbit = `${REST_ORBIT.theta}deg ${REST_ORBIT.phi}deg auto`
    }

    import('@google/model-viewer').then(() => {
      if (disposed) return
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      viewer.addEventListener('pointerdown', onPointerDown)
      window.addEventListener('pointerup', onPointerUp)
      window.addEventListener('pointercancel', onPointerUp)
      motion.addEventListener('change', onMotionChange)
      frame = requestAnimationFrame(tick)
    })

    return () => {
      disposed = true
      cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onPointerMove)
      viewer.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('pointerup', onPointerUp)
      window.removeEventListener('pointercancel', onPointerUp)
      motion.removeEventListener('change', onMotionChange)
    }
  }, [])

  return <figure className={s.heroPortrait} data-hero-character="true">
    <div className={s.heroCharacterFrame}>
      <model-viewer
        ref={viewerRef}
        src={MODEL_SRC}
        poster={POSTER_SRC}
        alt="Interactive 3D character of Jumin Shin"
        camera-controls=""
        disable-zoom=""
        disable-pan=""
        interaction-prompt="none"
        orientation="0deg 0deg 180deg"
        camera-orbit="0deg 82deg auto"
        min-camera-orbit="auto 60deg auto"
        max-camera-orbit="auto 110deg auto"
        shadow-intensity="0.5"
        shadow-softness="1"
        exposure="1"
        loading="eager"
        reveal="auto"
      />
    </div>
    <figcaption className={s.heroCharacterHint}>Drag or move your cursor to turn</figcaption>
  </figure>
}
