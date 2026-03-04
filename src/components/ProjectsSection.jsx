import { useState } from 'react'
import projects from '../data/projects.json'
import styles from './ProjectsSection.module.css'

const FILTERS = ['All', 'UX/UI', 'Product', '3D', 'Branding']

function ProjectRow({ project }) {
  const { title, type, team, role, year, color, thumbnail } = project

  const handleClick = () => {
    window.dispatchEvent(new CustomEvent('open-project', { detail: { id: project.id } }))
  }

  return (
    <div className={styles.rowWrapper}>
      <button className={styles.row} onClick={handleClick}>
        <div className={styles.colThumb} aria-hidden="true">
          {thumbnail ? (
            <img src={thumbnail} alt="" className={styles.thumbImg} />
          ) : (
            <div className={styles.thumbPlaceholder} style={{ background: color || '#f0f0f0' }} />
          )}
        </div>
        <span className={styles.colTitle}>{title}</span>
        <span className={styles.colType}>{type}</span>
        <span className={styles.colTeam}>{role || team}</span>
        <span className={styles.colYear}>{year}</span>
        <span className={styles.arrow} aria-hidden="true">→</span>
      </button>
    </div>
  )
}

export default function ProjectsSection() {
  const [activeFilter, setActiveFilter] = useState('All')

  const filtered = activeFilter === 'All'
    ? projects
    : projects.filter(p => p.type === activeFilter)

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

      <div className={styles.listHeader} aria-hidden="true">
        <span className={styles.colThumbHead} />
        <span className={styles.colTitle}>Project</span>
        <span className={styles.colType}>Type</span>
        <span className={styles.colTeam}>Role</span>
        <span className={styles.colYear}>Year</span>
        <span className={styles.colArrow} />
      </div>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>No projects in this category yet.</p>
        ) : (
          filtered.map(project => (
            <ProjectRow key={project.id} project={project} />
          ))
        )}
      </div>
    </section>
  )
}
