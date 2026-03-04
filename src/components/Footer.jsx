import { useState } from 'react'
import styles from './Footer.module.css'

const footerLinks = [
  { label: 'LinkedIn',  href: 'https://www.linkedin.com/in/juminshin' },
  { label: 'GitHub',    href: 'https://github.com/juminshin06/juminshin06' },
  { label: 'Scholar',   href: 'https://scholar.google.com/citations?user=RxmsjhAAAAAJ&hl=ko' },
  { label: 'Instagram', href: 'https://www.instagram.com/' },
  { label: 'Resume',    href: '/resume.pdf' },
]

export default function Footer() {
  const [emailCopied, setEmailCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard?.writeText('juminshi@usc.edu').then(() => {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 1200)
    })
  }

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>

        <div className={styles.top}>
          <p className={styles.name}>Jumin Shin</p>
          <p className={styles.tagline}>HCI Research · UX Design · AI Systems</p>
        </div>

        <div className={styles.linksRow}>
          <button className={styles.emailBtn} onClick={copyEmail}>
            {emailCopied ? '✓ Copied!' : 'juminshi@usc.edu'}
          </button>
          <div className={styles.divider} />
          {footerLinks.map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className={styles.link}
              target="_blank"
              rel="noopener noreferrer"
            >
              {label}
            </a>
          ))}
        </div>

        <p className={styles.copy}>All Rights Reserved by 👍 Jumin © 2026</p>
      </div>
    </footer>
  )
}
