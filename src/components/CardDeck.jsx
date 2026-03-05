import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import projects from '../data/projects.json'
import styles from './CardDeck.module.css'

const COLORS = ['#E8E8E8', '#DCDCDC', '#D4D4D4', '#CCCCCC', '#C8C8C8', '#C0C0C0']

// Mini stack offsets for the floating trigger
const MINI_STACKED = [
  { r: -8, x:  0, y:  0 },
  { r:  5, x:  3, y:  3 },
  { r: -3, x: -2, y:  6 },
]

// Spread positions (% of viewport) — 3 cards
const EXPANDED = [
  { top: 42, left: 16, r: -10 },
  { top: 38, left: 50, r:   2 },
  { top: 42, left: 84, r:   8 },
]

export default function CardDeck() {
  const [open, setOpen]       = useState(false)
  const [visible, setVisible] = useState(false)
  const [closing, setClosing] = useState(false)
  const [origin, setOrigin]   = useState({ top: 50, left: 96 })
  const closeTimer            = useRef(null)
  const btnRef                = useRef(null)

  const topProjects  = projects.slice(0, 3)
  const miniProjects = projects.slice(0, 3)

  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }
  }, [open])

  const handleOpen = () => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
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

  const getCardBg = (p, i) => {
    if (p.thumbnail) return `url(${p.thumbnail}) center/cover no-repeat`
    return p.color || COLORS[i]
  }

  return (
    <>
      {/* ── Floating trigger button ── */}
      <button
        ref={btnRef}
        className={`${styles.floatBtn} ${open ? styles.floatBtnHidden : ''}`}
        onClick={handleOpen}
        aria-label="프로젝트 카드 보기"
      >
        <div className={styles.miniStack}>
          {miniProjects.map((p, i) => (
            <div
              key={p.id}
              className={styles.miniCard}
              style={{
                background: getCardBg(p, i),
                transform: `rotate(${MINI_STACKED[i].r}deg) translate(${MINI_STACKED[i].x}px, ${MINI_STACKED[i].y}px)`,
                zIndex: 3 - i,
              }}
            />
          ))}
        </div>
        <span className={styles.floatLabel}>{projects.length}</span>
      </button>

      {/* ── Expanded overlay (portal) ── */}
      {open && createPortal(
        <div
          className={`${styles.overlay} ${closing ? styles.overlayClosing : ''}`}
          onClick={handleClose}
          role="presentation"
        >
          <button className={styles.closeHint} onClick={handleClose} aria-label="닫기">
            ✕
          </button>
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
