import { MeshGradient } from '@paper-design/shaders-react'
import styles from './MeshBackground.module.css'

export default function MeshBackground() {
  return (
    <div className={styles.wrap}>
      <MeshGradient
        style={{ width: '100%', height: '100%' }}
        colors={['#e8fff4', '#f0f8ff', '#f5f0ff', '#fff8e8', '#e8fff4']}
        speed={0.3}
      />
    </div>
  )
}
