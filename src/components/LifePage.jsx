import { useState } from 'react'
import styles from './LifePage.module.css'
import events from '../data/events.json'

const ACCENT = {
  'Hackathon':    { color: '#6366f1', bg: '#eeeffe', dark: '#4f46e5', gradient: 'linear-gradient(135deg, #eeeffe 0%, #c7d2fe 100%)' },
  'Company Tour': { color: '#f59e0b', bg: '#fef3dc', dark: '#d97706', gradient: 'linear-gradient(135deg, #fef3dc 0%, #fde68a 100%)' },
  'Conference':   { color: '#10b981', bg: '#d9f4ea', dark: '#059669', gradient: 'linear-gradient(135deg, #d9f4ea 0%, #a7f3d0 100%)' },
  'Workshop':     { color: '#ec4899', bg: '#fde8f4', dark: '#db2777', gradient: 'linear-gradient(135deg, #fde8f4 0%, #fbcfe8 100%)' },
  'Festival':     { color: '#f97316', bg: '#feeadb', dark: '#ea580c', gradient: 'linear-gradient(135deg, #feeadb 0%, #fed7aa 100%)' },
  'Award':        { color: '#eab308', bg: '#fefce8', dark: '#ca8a04', gradient: 'linear-gradient(135deg, #fefce8 0%, #fef08a 100%)' },
  'Scholarship':  { color: '#8b5cf6', bg: '#ede9fb', dark: '#7c3aed', gradient: 'linear-gradient(135deg, #ede9fb 0%, #ddd6fe 100%)' },
  'Other':        { color: '#94a3b8', bg: '#f0f2f5', dark: '#64748b', gradient: 'linear-gradient(135deg, #f0f2f5 0%, #e2e8f0 100%)' },
}

export default function LifePage({ onBack }) {
  const [page, setPage]         = useState(0)
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDir, setFlipDir]   = useState(null)   // 'next' | 'prev'
  const [displayPage, setDisplayPage] = useState(0) // page shown after animation

  const total = events.length

  const flipTo = (dir) => {
    if (isFlipping) return
    const next = dir === 'next' ? page + 1 : page - 1
    if (next < 0 || next >= total) return

    setFlipDir(dir)
    setIsFlipping(true)

    // After half the animation (page folded to 90°), swap content
    setTimeout(() => {
      setDisplayPage(next)
    }, 300)

    // After full animation, settle
    setTimeout(() => {
      setPage(next)
      setIsFlipping(false)
      setFlipDir(null)
    }, 600)
  }

  const ev     = events[displayPage]
  const accent = ACCENT[ev.category] || ACCENT['Other']
  const curEv  = events[page]
  const curAccent = ACCENT[curEv.category] || ACCENT['Other']

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={onBack}>← Back</button>

      <div className={styles.header}>
        <h1 className={styles.title}>Life</h1>
        <p className={styles.subtitle}>Experiences, events, and moments outside the studio.</p>
      </div>

      <div className={styles.bookScene}>
        {/* Prev arrow */}
        <button
          className={`${styles.navBtn} ${styles.navPrev}`}
          onClick={() => flipTo('prev')}
          disabled={page === 0 || isFlipping}
          aria-label="Previous page"
        >
          ‹
        </button>

        {/* Book */}
        <div className={styles.book}>
          {/* Left page — decorative visual */}
          <div
            className={styles.leftPage}
            style={{ background: isFlipping ? curAccent.gradient : accent.gradient }}
          >
            <div className={styles.leftPageInner}>
              <span className={styles.bigEmoji}>{isFlipping && flipDir === 'next' ? curEv.emoji : ev.emoji}</span>
              <div className={styles.leftMeta}>
                <span className={styles.catBadge} style={{ color: accent.dark, background: 'rgba(255,255,255,0.55)' }}>
                  {isFlipping && flipDir === 'next' ? curEv.category : ev.category}
                </span>
                <span className={styles.yearBig}>
                  {isFlipping && flipDir === 'next' ? curEv.year : ev.year}
                </span>
              </div>
            </div>
            {/* Page texture lines */}
            <div className={styles.pageLines} aria-hidden="true">
              {[...Array(8)].map((_, i) => (
                <div key={i} className={styles.pageLine} />
              ))}
            </div>
          </div>

          {/* Spine */}
          <div className={styles.spine} />

          {/* Right page — content, with flip animation */}
          <div
            className={`${styles.rightPage} ${isFlipping ? (flipDir === 'next' ? styles.flipForward : styles.flipBack) : ''}`}
          >
            <div className={styles.rightPageInner}>
              <div className={styles.pageCounter}>{page + 1} <span>/ {total}</span></div>
              <span className={styles.catLabel} style={{ color: accent.color }}>{ev.category}</span>
              <h2 className={styles.eventTitle}>{ev.title}</h2>
              <p className={styles.description}>{ev.description}</p>
              <div className={styles.yearTag}>{ev.year}</div>
            </div>
            {/* Page fold shadow */}
            <div className={styles.pageFold} aria-hidden="true" />
          </div>
        </div>

        {/* Next arrow */}
        <button
          className={`${styles.navBtn} ${styles.navNext}`}
          onClick={() => flipTo('next')}
          disabled={page >= total - 1 || isFlipping}
          aria-label="Next page"
        >
          ›
        </button>
      </div>

      {/* Page dots */}
      <div className={styles.pageDots} role="tablist" aria-label="Pages">
        {events.map((_, i) => (
          <button
            key={i}
            className={`${styles.pageDot} ${i === page ? styles.pageDotActive : ''}`}
            onClick={() => { if (!isFlipping && i !== page) { setPage(i); setDisplayPage(i) } }}
            aria-label={`Go to page ${i + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
