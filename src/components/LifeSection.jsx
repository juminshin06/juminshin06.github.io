import events from '../data/events.json'
import styles from './LifeSection.module.css'

const CATEGORY_COLORS = {
  Hackathon:      '#f5f5f5',
  'Company Tour': '#f0f0f0',
  Festival:       '#f5f5f5',
  Workshop:       '#f0f0f0',
  Conference:     '#f5f5f5',
  Other:          '#f0f0f0',
}

export default function LifeSection() {
  return (
    <section className={styles.section} id="life" aria-label="Life and Events">
      <div className={styles.grid}>
        {events.map((ev) => (
          <article key={ev.id} className={styles.card}>
            <span className={styles.badge}>{ev.category}</span>
            <h3 className={styles.eventTitle}>{ev.title}</h3>
            <p className={styles.description}>{ev.description}</p>
            <span className={styles.year}>{ev.year}</span>
          </article>
        ))}
      </div>
    </section>
  )
}
