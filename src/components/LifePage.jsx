import styles from './LifePage.module.css'
import events from '../data/events.json'

const ACCENT = {
  'Hackathon':    { color: '#6366f1', bg: '#eeeffe', dark: '#4f46e5' },
  'Company Tour': { color: '#f59e0b', bg: '#fef3dc', dark: '#d97706' },
  'Conference':   { color: '#10b981', bg: '#d9f4ea', dark: '#059669' },
  'Workshop':     { color: '#ec4899', bg: '#fde8f4', dark: '#db2777' },
  'Festival':     { color: '#f97316', bg: '#feeadb', dark: '#ea580c' },
  'Award':        { color: '#eab308', bg: '#fefce8', dark: '#ca8a04' },
  'Scholarship':  { color: '#8b5cf6', bg: '#ede9fb', dark: '#7c3aed' },
  'Other':        { color: '#94a3b8', bg: '#f0f2f5', dark: '#64748b' },
}

export default function LifePage({ onBack }) {
  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={onBack}>← Back</button>

      <div className={styles.header}>
        <h1 className={styles.title}>Life</h1>
        <p className={styles.subtitle}>Experiences, events, and moments outside the studio.</p>
      </div>

      <div className={styles.grid}>
        {events.map((ev, idx) => {
          const accent = ACCENT[ev.category] || ACCENT['Other']
          const isFeatured = idx === 0
          return (
            <article
              key={ev.id}
              className={`${styles.card} ${isFeatured ? styles.cardFeatured : ''}`}
              style={{
                '--accent': accent.color,
                '--accent-dark': accent.dark,
                '--badge-bg': accent.bg,
              }}
            >
              {/* Visual header — acts as the "photo" */}
              <div className={styles.cardVisual}>
                <span className={styles.cardEmoji}>{ev.emoji}</span>
                <span className={styles.cardYearOverlay}>{ev.year}</span>
              </div>

              {/* Card body */}
              <div className={styles.cardBody}>
                <span className={styles.badge}>{ev.category}</span>
                <h3 className={styles.eventTitle}>{ev.title}</h3>
                <p className={styles.description}>{ev.description}</p>
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
