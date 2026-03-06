import { useEffect, useRef } from 'react'

/**
 * Liquid Glass layer — sits BETWEEN the gradient background and the content.
 *   z-index: 1  →  above body gradient, below content (z-index: 2)
 *
 * The CSS mask punches a clear "lens" hole at the cursor,
 * letting the vivid gradient show through. The rest of the
 * page gets a soft frosted-glass treatment.
 */
export default function MouseSpotlight() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let cx = window.innerWidth  / 2
    let cy = window.innerHeight / 2

    const apply = () => {
      const mask =
        `radial-gradient(circle 320px at ${cx}px ${cy}px,` +
        ` transparent 0%,` +
        ` transparent 25%,` +
        ` rgba(0,0,0,0.4) 50%,` +
        ` rgba(0,0,0,0.85) 68%,` +
        ` black 80%)`
      el.style.maskImage       = mask
      el.style.webkitMaskImage = mask
    }

    apply()

    const onMove = (e) => { cx = e.clientX; cy = e.clientY; apply() }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  return (
    <div
      ref={ref}
      style={{
        position:             'fixed',
        inset:                0,
        zIndex:               1,          /* above gradient, below content (2) */
        pointerEvents:        'none',
        backdropFilter:       'blur(44px) saturate(1.6) brightness(1.06)',
        WebkitBackdropFilter: 'blur(44px) saturate(1.6) brightness(1.06)',
        background:           'rgba(255, 255, 255, 0.18)',
      }}
    />
  )
}
