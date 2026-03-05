import { useState, useEffect } from 'react'
import styles from './LandingSection.module.css'

const INTERESTS = ['Data', 'Health', 'AI', 'Design', 'User Experience']

export default function LandingSection() {
  const [copied, setCopied]               = useState(false)
  const [tickerIdx, setTickerIdx]         = useState(0)
  const [tickerVisible, setTickerVisible] = useState(true)

  useEffect(() => {
    const id = setInterval(() => {
      setTickerVisible(false)
      setTimeout(() => {
        setTickerIdx(i => (i + 1) % INTERESTS.length)
        setTickerVisible(true)
      }, 340)
    }, 1800)
    return () => clearInterval(id)
  }, [])

  const copyEmail = () => {
    navigator.clipboard?.writeText('juminshi@usc.edu').then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <section className={styles.landing}>
      {/* ── Hero: text + card deck ── */}
      <div className={styles.heroLayout}>
        <div className={styles.content}>
          <p className={styles.greeting}>Hi, I'm Jumin Shin</p>
          <p className={styles.description}>
            <strong>UX Designer</strong> &amp; <strong>Researcher</strong>{' '}
            passionate about creating{' '}
            <strong>human-centered</strong> experiences through
            research, design, and data analytics.
          </p>
          <div className={styles.ticker}>
            <span className={styles.tickerLabel}>Interested in</span>
            <span className={`${styles.tickerWord} ${tickerVisible ? styles.tickerIn : styles.tickerOut}`}>
              {INTERESTS[tickerIdx]}
            </span>
          </div>
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className={styles.bottomBar}>
        <button className={styles.emailBtn} onClick={copyEmail}>
          juminshi@usc.edu
          <span className={styles.copyHint}>
            {copied ? '✓ Copied!' : 'Click to copy'}
          </span>
        </button>
        <div className={styles.social}>
          <a href="https://www.linkedin.com/in/juminshin" target="_blank" rel="noopener noreferrer">LinkedIn ↗</a>
          <a href="https://github.com/juminshin06/juminshin06" target="_blank" rel="noopener noreferrer">GitHub ↗</a>
          <a href="https://scholar.google.com/citations?user=RxmsjhAAAAAJ&hl=ko" target="_blank" rel="noopener noreferrer">Scholar ↗</a>
        </div>
      </div>
    </section>
  )
}
