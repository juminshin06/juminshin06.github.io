import styles from './ProjectCard.module.css'

export default function ProjectCard({ project }) {
  const { title, type, team, year, thumbnail, color, href } = project

  const cardContent = (
    <article className={styles.card}>
      <div className={styles.thumbnail} style={{ background: color || '#e6f7ff' }}>
        {thumbnail ? (
          <img src={thumbnail} alt={title} loading="lazy" />
        ) : (
          <div className={styles.thumbnailPlaceholder} aria-hidden="true" />
        )}
      </div>
      <div className={styles.info}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.meta}>
          <span className={styles.badge}>{type}</span>
          <span className={styles.badge}>{team}</span>
          <span className={styles.year}>{year}</span>
        </div>
      </div>
    </article>
  )

  // If a project link is provided, wrap in an anchor
  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.cardLink}
        aria-label={`View project: ${title}`}
      >
        {cardContent}
      </a>
    )
  }

  return cardContent
}
