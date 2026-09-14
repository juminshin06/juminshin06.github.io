import { ProjectImage } from './Shell'
import ProjectArt from './ProjectArt'
import s from './Portfolio.module.css'

const imageSizes = {
  lead: '(max-width: 600px) 84vw, (max-width: 1200px) 32vw, 620px',
  compact: '(max-width: 600px) 82px, 220px',
  micro: '(max-width: 900px) 104px, 160px',
}

function CoverFrame({ src, frame = 'plain', eager = false, sizes, className = '' }) {
  return <figure className={`${s.coverFrame} ${className}`} data-cover-frame={frame} aria-hidden="true">
    {frame === 'browser' && <span className={s.coverBrowserBar}><i /><i /><i /></span>}
    <ProjectImage src={src} alt="" eager={eager} sizes={sizes} />
  </figure>
}

export default function ProjectCover({ project, variant = 'lead', eager = false }) {
  const cover = project.cover
  if (!cover) return <ProjectArt project={project} eager={eager} />

  const primary = variant === 'micro' && project.image ? project.image : cover.primary
  const showPrimary = Boolean(primary)
  const showSecondary = variant === 'lead' && Boolean(cover.secondary)

  return <div
    className={s.projectCover}
    data-project-cover={variant}
    data-cover-tone={cover.tone}
    data-cover-layout={cover.layout}
  >
    <div className={s.coverCanvas}>
      {showPrimary
        ? <CoverFrame src={primary} frame={cover.primaryFrame} eager={eager} sizes={imageSizes[variant]} className={s.coverPrimary} />
        : <div className={s.coverFallback} aria-hidden="true"><ProjectArt project={project} /></div>}
      {showSecondary && <CoverFrame src={cover.secondary} frame={cover.secondaryFrame} sizes="(max-width: 1200px) 14vw, 240px" className={s.coverSecondary} />}
    </div>
    {variant === 'lead' && cover.annotation && <span className={s.coverAnnotation}>{cover.annotation}</span>}
  </div>
}
