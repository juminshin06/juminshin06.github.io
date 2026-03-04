import { useState, useEffect } from 'react'
import styles from './NavBar.module.css'

export default function NavBar({ onLifeClick, onProjectsClick, onAboutClick }) {
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
      <a href="#" className={styles.logo}>Jumin Shin</a>
      <ul className={styles.links}>
        <li>
          <a href="#projects" className={styles.link} onClick={handleProjects}>Projects</a>
        </li>
        <li>
          <a href="#about" className={styles.link} onClick={handleAbout}>Ability</a>
        </li>
        <li>
          <button
            className={styles.linkBtn}
            onClick={() => onLifeClick?.()}
          >
            Life
          </button>
        </li>
      </ul>
    </nav>
  )
}
