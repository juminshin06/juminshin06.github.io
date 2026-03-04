import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import projects from '../data/projects.json'
import styles from './CardDeck.module.css'

// Fallback colors when no thumbnail set
const COLORS = ['#E8E8E8', '#DCDCDC', '#D4D4D4', '#CCCCCC', '#C8C8C8', '#C0C0C0']

// Stack offsets from center (px) — top card is index 0
const STACKED = [
  { r: -4,  x:  0,  y:  0  },
  { r:  7,  x:  4,  y:  3  },
  { r: -6,  x: -3,  y:  6  },
  { r: 11,  x:  5,  y:  9  },
  { r: -9,  x: -4,  y: 12  },
  { r:  3,  x:  3,  y: 15  },
]

// Spread positions (% of viewport)
const EXPANDED = [
  { top: 24, left: 18, r: -12 },
  { top: 20, left: 49, r:  -3 },
  { top: 26, left: 78, r:   9 },
  { top: 66, left: 22, r: -10 },
  { top: 70, left: 51, r:   6 },
  { top: 63, left: 77, r:  15 },
]

export default function CardDeck() {
  const [open, setOpen]       = useState(false)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [origin, setOrigin]   = useState({ top: 50, left: 50 })
  const closeTimer            = useRef(null)
  const stackRef              = useRef(null)

  const topProjects = projects.slice(0, 6)

  // Capture stack DOM position as spread origin, then trigger transition
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }
  }, [open])

  const handleOpen = () => {
    if (stackRef.current) {
      const rect = stackRef.current.getBoundingClientRect()
      setOrigin({
        top:  ((rect.top  + rect.height / 2) / window.innerHeight) * 100,
        left: ((rect.left + rect.width  / 2) / window.innerWidth)  * 100,
      })
    }
    clearTimeout(closeTimer.current)
    setOpen(true)
    setClosing(false)
  }

  const handleClose = () => {
    setVisible(false)
    setClosing(true)
    closeTimer.current = setTimeout(() => {
      setOpen(false)
      setClosing(false)
    }, 420)
  }

  const handleCardClick = (project) => {
    handleClose()
    window.dispatchEvent(new CustomEvent('open-project', { detail: { id: project.id } }))
  }

  // Top card shows hoverImage on hover if set
  const getStackBg = (p, i) => {
    if (i === 0 && hovered && p.hoverImage)
      return `url(${p.hoverImage}) center/cover no-repeat`
    if (p.thumbnail) return `url(${p.thumbnail}) center/cover no-repeat`
    return p.color || COLORS[i]
  }

  return (
    <>
      {/* ── Stacked deck ── */}
      <div
        ref={stackRef}
        className={`${styles.stack} ${open ? styles.stackHidden : ''}`}
        onClick={handleOpen}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        role="button"
        tabIndex={0}
        aria-label="클릭해서 프로젝트 카드 펼치기"
        onKeyDown={(e) => e.key === 'Enter' && handleOpen()}
      >
        {topProjects.map((p, i) => (
          <div
            key={p.id}
            className={styles.stackCard}
            style={{
              background: getStackBg(p, i),
              transform: `rotate(${STACKED[i].r}deg) translate(${STACKED[i].x}px, ${STACKED[i].y}px)`,
              zIndex: 6 - i,
              transition: i === 0
                ? 'background 450ms ease, box-shadow 200ms ease'
                : 'box-shadow 200ms ease',
            }}
          />
        ))}
        <p className={styles.stackHint}>Click to explore</p>
      </div>

      {/* ── Expanded overlay (portal) ── */}
      {open && createPortal(
        <div
          className={`${styles.overlay} ${closing ? styles.overlayClosing : ''}`}
          onClick={handleClose}
          role="presentation"
        >
          {topProjects.map((p, i) => (
            <button
              key={p.id}
              className={`${styles.card} ${visible ? styles.cardVisible : ''}`}
              style={{
                '--top':        `${EXPANDED[i].top}%`,
                '--left':       `${EXPANDED[i].left}%`,
                '--start-top':  `${origin.top}%`,
                '--start-left': `${origin.left}%`,
                '--r':          `${EXPANDED[i].r}deg`,
                '--delay':      `${i * 70}ms`,
                background: p.thumbnail
                  ? `url(${p.thumbnail}) center/cover no-repeat`
                  : (p.color || COLORS[i]),
              }}
              onClick={(e) => { e.stopPropagation(); handleCardClick(p) }}
              aria-label={`${p.title} 프로젝트 보기`}
            >
              <div className={styles.cardLabel}>
                <span className={styles.cardTitle}>{p.title}</span>
                <span className={styles.cardMeta}>{p.type} · {p.year}</span>
              </div>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  )
}
