import styles from './ProjectPage.module.css'
import projects from '../data/projects.json'

export default function ProjectPage({ projectId, onBack }) {
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

      {/* ── Meta grid (Role / Type / Duration / Tools / Year) ── */}
      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>MY ROLE</span>
          <hr className={styles.metaLine} />
          <span className={styles.metaValue}>{role || '—'}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>TYPE</span>
          <hr className={styles.metaLine} />
          <span className={styles.metaValue}>{type || '—'}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>DURATION</span>
          <hr className={styles.metaLine} />
          <span className={styles.metaValue}>{duration || '—'}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>TOOLS</span>
          <hr className={styles.metaLine} />
          <span className={styles.metaValue}>{tools?.join(', ') || '—'}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>YEAR</span>
          <hr className={styles.metaLine} />
          <span className={styles.metaValue}>{year}</span>
        </div>
      </div>

      {/* ── Free-form content blocks ── */}
      {/* To add content: edit projects.json → content array.
          Supported types: "heading", "text", "image", "pdf" */}
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
    </div>
  )
}
