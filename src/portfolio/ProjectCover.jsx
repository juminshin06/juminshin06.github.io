import { ProjectImage } from './Shell'
import ProjectArt from './ProjectArt'
import s from './Portfolio.module.css'

function CoverFrame({ src, frame = 'plain', eager = false, className = '' }) {
  return <figure className={`${s.coverFrame} ${className}`} data-cover-frame={frame} aria-hidden="true">
    {frame === 'browser' && <span className={s.coverBrowserBar}><i /><i /><i /></span>}
    <ProjectImage src={src} alt="" eager={eager} sizes="(max-width: 700px) 92vw, (max-width: 1200px) 58vw, 820px" />
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
        ? <CoverFrame src={primary} frame={cover.primaryFrame} eager={eager} className={s.coverPrimary} />
        : <div className={s.coverFallback} aria-hidden="true"><ProjectArt project={project} /></div>}
      {showSecondary && <CoverFrame src={cover.secondary} frame={cover.secondaryFrame} className={s.coverSecondary} />}
    </div>
    {variant === 'lead' && <span className={s.coverAnnotation}>{cover.annotation}</span>}
  </div>
}
