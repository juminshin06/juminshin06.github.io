import styles from './ProjectPage.module.css'
import projects from '../data/projects.json'

export default function ProjectPage({ projectId, onBack, onPrev, onNext, hasPrev, hasNext, prevTitle, nextTitle }) {
  const project = projects.find(p => p.id === projectId)
  if (!project) return null

  const { title, type, role, year, duration, tools, description, content = [] } = project

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={onBack}>← Back to Projects</button>

      <div className={styles.hero}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>MY ROLE</span>
          <hr className={styles.metaLine} />
          <span className={styles.metaValue}>{role || ''}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>TYPE</span>
          <hr className={styles.metaLine} />
          <span className={styles.metaValue}>{type || ''}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>DURATION</span>
          <hr className={styles.metaLine} />
          <span className={styles.metaValue}>{duration || ''}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>TOOLS</span>
          <hr className={styles.metaLine} />
          <span className={styles.metaValue}>{tools?.join(', ') || ''}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>YEAR</span>
          <hr className={styles.metaLine} />
          <span className={styles.metaValue}>{year}</span>
        </div>
      </div>

      <div className={styles.body}>
        {content.map((block, i) => {
          if (block.type === 'heading')
            return <h2 key={i} className={styles.blockHeading}>{block.value}</h2>

          if (block.type === 'text')
            return <p key={i} className={styles.blockText}>{block.value}</p>

          if (block.type === 'image')
            return (
              <figure key={i} className={styles.blockImage}>
                {block.src
                  ? <img src={block.src} alt={block.caption || ''} />
                  : <div className={styles.imagePlaceholder}>Add image src in projects.json</div>
                }
                {block.caption && <figcaption>{block.caption}</figcaption>}
              </figure>
            )

          if (block.type === 'pdf')
            return (
              <div key={i} className={styles.blockPdf}>
                {block.src
                  ? <a href={block.src} target="_blank" rel="noopener noreferrer" className={styles.pdfLink}>
                      📄 {block.label || 'View PDF'}
                    </a>
                  : <span className={styles.pdfPlaceholder}>Add PDF src in projects.json</span>
                }
              </div>
            )

          return null
        })}
      </div>

      {/* Prev / Next navigation */}
      <div className={styles.projectNav}>
        <button
          className={`${styles.navBtn} ${styles.navPrev} ${!hasPrev ? styles.navDisabled : ''}`}
          onClick={onPrev}
          disabled={!hasPrev}
          aria-label="Previous project"
        >
          <span className={styles.navArrow}>←</span>
          <span className={styles.navInfo}>
            <span className={styles.navHint}>Previous</span>
            {prevTitle && <span className={styles.navTitle}>{prevTitle}</span>}
          </span>
        </button>

        <button
          className={`${styles.navBtn} ${styles.navNext} ${!hasNext ? styles.navDisabled : ''}`}
          onClick={onNext}
          disabled={!hasNext}
          aria-label="Next project"
        >
          <span className={styles.navInfo}>
            <span className={styles.navHint}>Next</span>
            {nextTitle && <span className={styles.navTitle}>{nextTitle}</span>}
          </span>
          <span className={styles.navArrow}>→</span>
        </button>
      </div>
    </div>
  )
}
