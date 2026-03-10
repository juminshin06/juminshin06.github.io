import { useState } from 'react'
import projects from '../data/projects.json'
import styles from './ProjectsSection.module.css'

const FILTERS = ['All', 'UX/UI', 'Product', '3D', 'Branding']

function ProjectCard({ project }) {
  const { title, type, role, color, thumbnail } = project

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-project', { detail: { id: project.id } }))
  }

  return (
    <button className={styles.card} onClick={handleClick} aria-label={title}>
      <div
        className={styles.cardImageWrap}
        style={{ background: color || '#f0f0f0' }}
      >
        {thumbnail ? (
          <img src={thumbnail} alt="" className={styles.cardImg} loading="lazy" decoding="async" />
        ) : (
          <div className={styles.cardImgPlaceholder} />
        )}
      </div>
      <div className={styles.cardMeta}>
        <span className={styles.cardType}>{type}</span>
        <span className={styles.cardDivider}>·</span>
        <span className={styles.cardRole}>{role}</span>
      </div>
    </button>
  )
}

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = [...(activeFilter === 'All'
    ? projects
    : projects.filter(p => p.type === activeFilter))
  ].sort((a, b) => b.year - a.year)

  return (
    <section className={styles.projects} id="projects" aria-label="Projects">
      <div className={styles.filters} role="group" aria-label="Filter projects">
        {FILTERS.map(f => (
          <button
            key={f}
            className={`${styles.filterBtn} ${activeFilter === f ? styles.filterActive : ''}`}
            onClick={() => setActiveFilter(f)}
            aria-pressed={activeFilter === f}
          >
            {f}
          </button>
        ))}
      </div>

      <div className={styles.grid}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>No projects in this category yet.</p>
        ) : (
          filtered.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </div>
    </section>
  )
}
