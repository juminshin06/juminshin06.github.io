import { useState, useEffect } from 'react'
import styles from './NavBar.module.css'

export default function NavBar({ onLifeClick, onProjectsClick, onAboutClick, onHomeClick }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  const handleProjects = onProjectsClick
    ? (e) => { e.preventDefault(); onProjectsClick() }
    : undefined

  const handleAbout = onAboutClick
    ? (e) => { e.preventDefault(); onAboutClick() }
    : undefined

  return (
    <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="#" className={styles.logo} onClick={onHomeClick ? (e) => { e.preventDefault(); onHomeClick() } : undefined}>Jumin Shin</a>
      <ul className={styles.links}>
        <li>
          <a href="#projects" className={styles.link} onClick={handleProjects}>Projects</a>
        </li>
        <li>
          <a href="#about" className={styles.link} onClick={handleAbout}>EXPERIENCE</a>
        </li>
        <li>
          <button
            className={styles.linkBtn}
            onClick={() => onLifeClick?.()}
          >
            <span className={styles.linkBtnSpin} aria-hidden="true" />
            <span className={styles.linkBtnInner}>Life</span>
          </button>
        </li>
      </ul>
    </nav>
  )
}
