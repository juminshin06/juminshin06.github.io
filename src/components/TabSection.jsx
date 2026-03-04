import styles from './TabSection.module.css'
import AboutSection from './AboutSection'
import LifeSection from './LifeSection'

const TABS = ['About', 'Life']

export default function TabSection({ activeTab, onTabChange }) {
  return (
    <div className={styles.wrapper} id="about">
      <div className={styles.tabBar} role="tablist">
        {TABS.map(tab => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`${styles.tab} ${activeTab === tab ? styles.active : ''}`}
            onClick={() => onTabChange(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div role="tabpanel">
        {activeTab === 'About' ? <AboutSection /> : <LifeSection />}
      </div>
    </div>
  )
}
