import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Play, X } from 'lucide-react'
import { allProjects } from '../data/portfolio'
import { ProjectImage, TextLink } from './Shell'
import { NarrativeCopy, SectionDetails, SectionFlow } from './CaseStudyBlocks'
import { getCaseStudyMode, getProjectFacts } from './caseStudyNarrative'
import ProjectArt from './ProjectArt'
import s from './Portfolio.module.css'

const displayTitles = {
  'bubbas-production': 'AI-assisted production',
  'honda-spatial': 'Spatial design review',
  'ethicon-care': 'Post-operative care',
  'story-authoring': 'Human-AI storytelling',
  'ai-3d-product-visualization': 'AI-assisted 3D production',
  'embrain-research': 'Research to product direction',
}

const formatSectionLabel = id => id
  .split('-')
  .map((word, index) => index === 0 ? word[0].toUpperCase() + word.slice(1) : word)
  .join(' ')

function Resource({ block }) {
  const [loaded, setLoaded] = useState(false)
  return <section className={s.resource}>
    <div className={s.resourceHeader}><h3>{block.label}</h3><TextLink href={block.src} external>Open separately</TextLink></div>
    {loaded ? <>
      <button className={s.closeEmbed} onClick={() => setLoaded(false)}><X size={18} />Close preview</button>
      <iframe className={s.embed} src={block.src} title={block.label} allow={block.allow || ''} allowFullScreen />
    </> : <button className={s.loadEmbed} onClick={() => setLoaded(true)}><Play size={21} aria-hidden="true" />{block.type === 'pdf' ? 'Preview document' : 'Load interactive preview'}</button>}
  </section>
}

function EvidenceFigure({ block, sectionId, number }) {
  const image = <ProjectImage src={block.src} alt={block.caption} sizes="(max-width: 900px) 100vw, 46vw" />
  const isFullSizeAvailable = block.fullSize !== false

  return <figure className={`${s.storyArtifact} ${isFullSizeAvailable ? '' : s.storyArtifactRestricted} ${block.presentation === 'browser' ? s.storyArtifactBrowser : ''} ${block.presentation === 'slide' ? s.storyArtifactSlide : ''}`} data-story-artifact={sectionId} data-image-presentation={block.presentation}>
    {isFullSizeAvailable
      ? <a className={s.storyArtifactMedia} href={block.src} target="_blank" rel="noreferrer" aria-label={`Open full-size evidence: ${block.caption}`}>{image}</a>
      : <div className={s.storyArtifactMedia}>{image}</div>}
    <figcaption><span>Evidence {String(number).padStart(2, '0')}</span>{block.caption}{isFullSizeAvailable ? <ArrowUpRight size={15} aria-hidden="true" /> : null}</figcaption>
  </figure>
}

function assignArtifacts(project) {
  const images = (project.content || []).filter(block => block.type === 'image')
  const bySection = new Map(project.sections.map(section => [section.id, []]))
  images.forEach((block, index) => {
    const fallbackIndex = Math.min(
      project.sections.length - 1,
      Math.floor(((index + 1) * project.sections.length) / (images.length + 1)),
    )
    const sectionId = block.sectionId || project.sections[fallbackIndex]?.id
    if (bySection.has(sectionId)) bySection.get(sectionId).push(block)
  })
  return {
    bySection,
    resources: (project.content || []).filter(block => block.type !== 'image'),
  }
}

export default function CaseStudy({ project }) {
  const article = useRef(null)
  const [activeSection, setActiveSection] = useState('overview')
  const mode = getCaseStudyMode(project)
  const projectFacts = getProjectFacts(project)
  const next = allProjects[(allProjects.findIndex(item => item.id === project.id) + 1) % allProjects.length]
  const primaryResources = project.resources.filter(resource => resource.primary)
  const secondaryResources = project.resources.filter(resource => !resource.primary)
  const assignments = useMemo(() => assignArtifacts(project), [project])
  let artifactNumber = 1

  useEffect(() => {
    const ids = ['overview', ...project.sections.map(section => section.id), 'outcome']
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean)
    let frame
    const update = () => {
      frame = undefined
      const readingLine = Math.max(150, window.innerHeight * 0.28)
      let current = sections[0]?.id
      for (const section of sections) {
        if (section.getBoundingClientRect().top <= readingLine) current = section.id
      }
      setActiveSection(current)
    }
    const schedule = () => { if (frame === undefined) frame = requestAnimationFrame(update) }
    const resize = new ResizeObserver(schedule)
    resize.observe(article.current)
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    update()
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      resize.disconnect()
      if (frame !== undefined) cancelAnimationFrame(frame)
    }
  }, [project])

  return <article ref={article} className={s.casePage} data-case-study-mode={mode}>
    <header className={s.caseHeader} id="overview">
      <a className={s.backLink} href="/#work"><ArrowLeft size={17} />Work</a>
      <div className={s.caseIntro}>
        <p className={s.label}>{project.organization}</p>
        <h1>{displayTitles[project.slug] || project.title}</h1>
        <div data-intro-lead="true">
          <NarrativeCopy lead={project.introLead || project.summary} body={project.introSupport} className={s.caseSummary} />
        </div>
        {project.descriptors?.length > 0 && <ul className={s.caseDescriptors} data-project-descriptors="true">
          {project.descriptors.slice(0, 3).map(descriptor => <li key={descriptor}>{descriptor}</li>)}
        </ul>}
        {primaryResources.length > 0 && <div className={s.casePrimaryLinks}>{primaryResources.map(resource => <TextLink key={resource.href} href={resource.href} external>{resource.label}</TextLink>)}</div>}
      </div>
      <dl className={s.caseMetadata} data-project-facts="true">
        {projectFacts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
      </dl>
    </header>

    <nav className={s.caseToc} aria-label="Case study sections">
      <span className={s.caseTocLabel}>Jump to</span>
      <a href="#overview" aria-current={activeSection === 'overview' ? 'location' : undefined}>Overview</a>
      {project.sections.map(section => <a key={section.id} href={`#${section.id}`} aria-current={activeSection === section.id ? 'location' : undefined}>{formatSectionLabel(section.id)}</a>)}
      <a href="#outcome" aria-current={activeSection === 'outcome' ? 'location' : undefined}>Outcome</a>
    </nav>

    <figure className={`${s.caseVisual} ${project.image ? s.caseImage : ''}`}>
      <ProjectArt project={project} eager presentation />
      <figcaption>{project.visualCaption || (project.image ? 'Project artifact' : 'Documented project scope')}</figcaption>
    </figure>

    <section className={s.caseContributionPanel} aria-label="My contribution">
      <span className={s.label}>My contribution</span>
      <p>{project.contribution}</p>
    </section>

    <div className={s.caseBody}>
      {project.sections.map((section, index) => {
        const evidence = assignments.bySection.get(section.id) || []
        return <section data-reveal className={s.storySection} id={section.id} key={section.id}>
          <div className={s.storyHeading}>
            <span>0{index + 1}</span>
            <h2>{section.title}</h2>
          </div>
          <div className={s.storyContent}>
            <p>{section.body}</p>
            <SectionDetails items={section.details} />
            <SectionFlow flow={section.flow} />
            {section.comparison && <dl className={s.designDecision}>
              <div><dt>Design challenge</dt><dd>{section.comparison.observation}</dd></div>
              <div><dt>{project.art === 'audit' ? 'Proposed response' : 'Design response'}</dt><dd>{section.comparison.response}</dd></div>
            </dl>}
          </div>
          {evidence.length > 0 ? <div className={`${s.storyEvidenceGrid} ${evidence.length === 1 ? s.storyEvidenceGridSingle : ''}`} data-evidence-grid="true">
            {evidence.map(block => <EvidenceFigure key={block.src} block={block} sectionId={section.id} number={artifactNumber++} />)}
          </div> : null}
        </section>
      })}

      {project.diagram && <figure className={s.workflow}><div className={s.storyHeading}><span>Process</span><h2>{project.diagram.title}</h2></div>
        <div className={s.processNarrative}>{project.diagram.steps.map(step => <p key={step.label}><strong>{step.label}.</strong> <span>{step.detail}</span></p>)}</div>
        <figcaption>{project.diagram.caption}</figcaption>
      </figure>}

      {project.facts.length > 0 && <dl className={s.facts}>{project.facts.map(fact => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}</dl>}

      {assignments.resources.length > 0 && <div className={s.caseResources}>{assignments.resources.map((block, index) => <Resource key={`${block.src}-${index}`} block={block} />)}</div>}

      <section className={s.outcome} id="outcome">
        <span className={s.label}>Outcome</span>
        <h2>{project.status}</h2>
        <p>{project.outcome}</p>
      </section>

      {secondaryResources.length > 0 && <div className={s.resources}>{secondaryResources.map(resource => <TextLink key={resource.href} href={resource.href} external>{resource.label}</TextLink>)}</div>}
    </div>

    <a className={s.nextProject} href={`/work/${next.slug}/`}>
      <div><span className={s.label}>Next project</span><h2>{displayTitles[next.slug] || next.title}</h2><p>{next.organization}</p></div>
      <ArrowRight size={42} aria-hidden="true" />
    </a>
  </article>
}
