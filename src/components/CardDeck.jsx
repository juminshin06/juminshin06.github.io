import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import projects from '../data/projects.json'
import styles from './CardDeck.module.css'

const COLORS = ['#E8E8E8', '#DCDCDC', '#D4D4D4', '#CCCCCC', '#C8C8C8', '#C0C0C0']

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

  const topProjects = projects.slice(0, 3)

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
        {/* Pretty stacked-cards icon */}
        <svg
          className={styles.deckIcon}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* back card */}
          <rect x="3"  y="10" width="18" height="14" rx="3"
            fill="rgba(0,90,0,0.18)" transform="rotate(-11 12 17)" />
          {/* middle card */}
          <rect x="11" y="9"  width="18" height="14" rx="3"
            fill="rgba(0,90,0,0.28)" transform="rotate(7 20 16)" />
          {/* front card */}
          <rect x="7"  y="10" width="18" height="14" rx="3"
            fill="rgba(0,90,0,0.65)" />
          {/* arrow → "open" affordance */}
          <path
            d="M13 17L17.5 17M15.5 14.5L17.5 17L15.5 19.5"
            stroke="rgba(210,255,80,0.95)"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className={styles.floatLabel}>Click</span>
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
