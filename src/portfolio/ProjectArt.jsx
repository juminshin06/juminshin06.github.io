import { ArrowRight, MoveUpRight } from 'lucide-react'
import { ProjectImage } from './Shell'
import { categoryLabels } from '../data/portfolio'
import s from './Portfolio.module.css'

export default function ProjectArt({ project, eager = false, presentation = false }) {
  const imagePresentation = presentation ? project.imagePresentation : undefined
  if (project.image) return <div className={`${s.projectArt} ${s.imageArt} ${imagePresentation === 'browser' ? s.browserCapture : ''}`} data-image-presentation={imagePresentation}><ProjectImage src={project.image} alt={project.imageAlt || project.title} eager={eager} /></div>
  if (project.art === 'audit') return <div className={`${s.projectArt} ${s.auditArt}`}>
    <div className={s.artTop}><span>STUDIO.OS / UX AUDIT</span><span>2026</span></div>
    <div className={s.auditTitle}>Clearer decisions.<br />Visible evidence.</div>
    <div className={s.auditMeasures}><span><strong>10</strong>screens</span><span><strong>29</strong>recommendations</span></div>
    <div className={s.artBottom}><span>Navigation / AI trust / Workflow</span><span>Improvement proposal</span></div>
  </div>
  if (project.slug === 'bubbas-production') return <div className={`${s.projectArt} ${s.productionArt}`}>
    <div className={s.artTop}><span>CREATIVE PRODUCTION</span><span>2026</span></div>
    <div className={s.batchMetric}><span>10</span><ArrowRight aria-hidden="true" /><span>300<span className={s.metricPlus}>+</span></span></div>
    <p className={s.artDescription}>One workflow.<br />From prototype to production.</p>
    <div className={s.artBottom}><span>Videos per automated batch</span><span>Adopted in production</span></div>
  </div>
  if (project.slug === 'honda-spatial') return <div className={`${s.projectArt} ${s.spatialArt}`}>
    <div className={s.artTop}><span>AMERICAN HONDA × USC IYA</span><MoveUpRight aria-hidden="true" size={24} /></div>
    <div className={s.spatialTitle}>Shared<br /><span>perspectives.</span></div>
    <div className={s.artBottom}><span>Apple Vision Pro<br />3D annotation</span><span>Design review<br />2026</span></div>
  </div>
  return <div className={`${s.projectArt} ${s.researchArt}`}>
    <div className={s.artTop}><span>{project.organization}</span><span>{project.year}</span></div>
    <span className={s.abstractTitle}>{project.title}</span>
    <div className={s.artBottom}><span>{categoryLabels[project.category]}</span><span>{project.status}</span></div>
  </div>
}
