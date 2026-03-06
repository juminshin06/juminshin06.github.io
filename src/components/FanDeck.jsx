import { useRef, useEffect, useState } from 'react'
import projects from '../data/projects.json'
import styles from './FanDeck.module.css'

const N      = 5
const RADIUS = 175
const SPEED  = 0.28

export default function FanDeck() {
  const top5 = projects.slice(0, N)
  const [active, setActive] = useState(null)

  const groupRef   = useRef(null)
  const rafRef     = useRef(null)
  const angleRef   = useRef(0)
  const pausedRef  = useRef(false)

  // Drag state
  const draggingRef   = useRef(false)
  const dragStartX    = useRef(0)
  const dragStartAngle= useRef(0)
  const dragDeltaRef  = useRef(0)

  useEffect(() => {
    const tick = () => {
      if (!pausedRef.current && !draggingRef.current && groupRef.current) {
        angleRef.current = (angleRef.current + SPEED) % 360
        groupRef.current.style.transform = `rotateY(${angleRef.current}deg)`
      }
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  const onDragStart = (e) => {
    draggingRef.current  = true
    dragStartX.current   = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
    dragStartAngle.current = angleRef.current
    dragDeltaRef.current = 0
  }

  const onDragMove = (e) => {
    if (!draggingRef.current) return
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX
    const delta   = (clientX - dragStartX.current) * 0.55
    dragDeltaRef.current = delta
    angleRef.current = (dragStartAngle.current + delta) % 360
    if (groupRef.current) groupRef.current.style.transform = `rotateY(${angleRef.current}deg)`
  }

  const onDragEnd = () => {
    draggingRef.current = false
  }

  const handleCardClick = (project) => {
    if (Math.abs(dragDeltaRef.current) > 6) return  // suppress click after drag
    window.dispatchEvent(new CustomEvent('open-project', { detail: { id: project.id } }))
  }

  return (
    <div
      className={styles.scene}
      onMouseEnter={() => { pausedRef.current = true }}
      onMouseLeave={() => { pausedRef.current = false; draggingRef.current = false; setActive(null) }}
      onMouseDown={onDragStart}
      onMouseMove={onDragMove}
      onMouseUp={onDragEnd}
      onTouchStart={onDragStart}
      onTouchMove={onDragMove}
      onTouchEnd={onDragEnd}
      style={{ cursor: draggingRef.current ? 'grabbing' : 'grab' }}
    >
      <div ref={groupRef} className={styles.carousel}>
        {top5.map((p, i) => {
          const baseAngle = i * (360 / N)
          const isActive  = active === i
          const bg = p.thumbnail
            ? `url(${p.thumbnail}) center/cover no-repeat`
            : p.color || '#e0e0e0'

          return (
            <button
              key={p.id}
              className={styles.card}
              style={{
                transform: `rotateY(${baseAngle}deg) translateZ(${RADIUS}px)${isActive ? ' scale(1.09)' : ''}`,
                boxShadow: isActive
                  ? '0 18px 50px rgba(0,0,0,0.38), 0 4px 12px rgba(0,0,0,0.18)'
                  : '0  8px 28px rgba(0,0,0,0.22), 0 2px  6px rgba(0,0,0,0.12)',
                background: bg,
              }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onClick={() => handleCardClick(p)}
              aria-label={p.title}
            >
              <div className={`${styles.label} ${isActive ? styles.labelOn : ''}`}>
                <span className={styles.title}>{p.title}</span>
                <span className={styles.meta}>{p.type} · {p.year}</span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
