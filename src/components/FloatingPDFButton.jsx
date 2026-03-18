import confetti from 'canvas-confetti'
import styles from './FloatingPDFButton.module.css'

export default function FloatingPDFButton() {
  const handleClick = () => {
    confetti({
      particleCount: 35,
      spread: 45,
      origin: { x: 0.92, y: 0.85 },
      colors: ['#00D68F', '#44E87A', '#AAFF44', '#6BFFB8', '#C8FF90'],
      shapes: ['star', 'circle'],
    })
  }

  return (
    <div className={styles.wrap}>
      <a
        href="/assets/Jumin_portfolio.pdf"
        target="_blank"
        rel="noopener noreferrer"
        className={styles.btn}
        aria-label="View portfolio PDF"
        onClick={handleClick}
      >
        <span className={styles.btnSpin} aria-hidden="true" />
        <span className={styles.btnInner}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <line x1="10" y1="9" x2="8" y2="9"/>
          </svg>
          Portfolio PDF
        </span>
      </a>
    </div>
  )
}
