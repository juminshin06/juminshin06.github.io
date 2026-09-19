import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ArrowUpRight, Play, X } from 'lucide-react'
import { allProjects } from '../data/portfolio'
import { ProjectImage, TextLink } from './Shell'
import { DesignDecision, NarrativeCopy, NarrativeHeading, ProblemStatement, SectionDetails, SectionFlow } from './CaseStudyBlocks'
import { buildDesignProcessNavigation, buildPhaseNavigation, findActiveSectionId, getCaseStudyMode, getHashSectionId, getProjectFacts, getSectionPhase } from './caseStudyNarrative'
import ProjectArt from './ProjectArt'
import s from './Portfolio.module.css'

const displayTitles = {
  'bubbas-production': 'AI-assisted production',
  'honda-spatial': 'Spatial design review',
  'ethicon-care': 'Post-operative care',
  'story-authoring': 'Human-AI storytelling',
  'ai-3d-product-visualization': 'AI-assisted 3D production',
  pacepop: 'PACEPOP: temporary connection for real-world groups',
}

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

  return <figure className={`${s.storyArtifact} ${isFullSizeAvailable ? '' : s.storyArtifactRestricted} ${block.presentation === 'browser' ? s.storyArtifactBrowser : ''} ${block.presentation === 'slide' ? s.storyArtifactSlide : ''} ${block.presentation === 'phone' ? s.storyArtifactPhone : ''}`} data-story-artifact={sectionId} data-image-presentation={block.presentation}>
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
  const hasDesignProcess = Boolean(project.designProcess)
  const projectFacts = getProjectFacts(project)
  const next = allProjects[(allProjects.findIndex(item => item.id === project.id) + 1) % allProjects.length]
  const primaryResources = project.resources.filter(resource => resource.primary)
  const secondaryResources = project.resources.filter(resource => !resource.primary)
  const assignments = useMemo(() => assignArtifacts(project), [project])
  const phaseNavigation = useMemo(() => (
    hasDesignProcess ? buildDesignProcessNavigation(project) : buildPhaseNavigation(project.sections, mode)
  ), [hasDesignProcess, mode, project])
  const activePhase = phaseNavigation.find(item => item.sectionIds.includes(activeSection))
  let artifactNumber = 1

  useEffect(() => {
    const ids = hasDesignProcess
      ? ['overview', 'problem', ...project.designProcess.stages.map(stage => stage.id), 'resolution']
      : ['overview', ...project.sections.map(section => section.id), 'outcome']
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean)
    let frame
    const update = () => {
      frame = undefined
      const positions = sections.map(section => ({ id: section.id, top: section.getBoundingClientRect().top }))
      setActiveSection(findActiveSectionId(positions, window.innerHeight))
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
  }, [hasDesignProcess, project])

  useEffect(() => {
    const sectionId = getHashSectionId(window.location.hash)
    const target = sectionId ? document.getElementById(sectionId) : null
    if (!target) return undefined
    let frame
    let cancelled = false
    setActiveSection(sectionId)
    const alignTarget = () => {
      if (cancelled) return
      if (frame) cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }))
    }
    const precedingImages = [...article.current.querySelectorAll('img')].filter(image => (
      target.compareDocumentPosition(image) & Node.DOCUMENT_POSITION_PRECEDING
    ))
    const pendingImages = precedingImages.filter(image => !image.complete)
    pendingImages.forEach(image => image.addEventListener('load', alignTarget, { once: true }))
    window.addEventListener('load', alignTarget, { once: true })
    alignTarget()
    const settleTimer = window.setTimeout(alignTarget, 450)
    document.fonts?.ready.then(alignTarget)
    return () => {
      cancelled = true
      if (frame) cancelAnimationFrame(frame)
      window.clearTimeout(settleTimer)
      pendingImages.forEach(image => image.removeEventListener('load', alignTarget))
      window.removeEventListener('load', alignTarget)
    }
  }, [project])

  return <article ref={article} className={s.casePage} data-case-study-mode={mode} data-project-slug={project.slug}>
    <header className={s.caseHeader} id="overview">
      <a className={s.backLink} href="/#work"><ArrowLeft size={17} />Work</a>
      <div className={s.caseHeaderGrid} data-case-intro-layout="split">
        <div className={s.caseIntroColumn}>
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
        </div>
        <figure className={`${s.caseVisual} ${project.image ? s.caseImage : ''}`} data-case-hero-media="true">
          <ProjectArt project={project} eager presentation />
          <figcaption>{project.visualCaption || (project.image ? 'Project artifact' : 'Documented project scope')}</figcaption>
        </figure>
      </div>
    </header>

    <section className={s.caseContributionPanel} aria-label="My contribution">
      <span className={s.label}>My contribution</span>
      <p>{project.contribution}</p>
    </section>

    {hasDesignProcess ? <ProblemStatement problem={project.designProcess.problem} /> : null}

    {phaseNavigation.length > 0 && <nav
      className={s.caseToc}
      aria-label="Case study sections"
      data-phase-navigation="true"
      data-process-navigation={hasDesignProcess ? 'true' : undefined}
    >
      <span className={s.caseTocLabel}>{hasDesignProcess ? 'Design process' : 'In this project'}</span>
      {phaseNavigation.map(item => <a key={item.id} href={`#${item.id}`} aria-current={activePhase?.id === item.id ? 'location' : undefined}>{item.label}</a>)}
      {!hasDesignProcess ? <a href="#outcome" aria-current={activeSection === 'outcome' ? 'location' : undefined}>Outcome</a> : null}
    </nav>}

    <div className={s.caseBody}>
      {project.sections.map(section => {
        const evidence = assignments.bySection.get(section.id) || []
        const isPhoneSet = evidence.length > 1 && evidence.every(block => block.presentation === 'phone')
        const isPhonePair = isPhoneSet && evidence.length === 2
        const isPhoneQuad = isPhoneSet && evidence.length === 4
        const isPhoneGallery = isPhoneSet && evidence.length > 2 && !isPhoneQuad
        const evidenceLayout = isPhonePair ? 'phone-pair' : (isPhoneQuad ? 'phone-quad' : (isPhoneGallery ? 'phone-gallery' : 'standard'))
        const phase = getSectionPhase(section, mode)
        return <section data-reveal data-story-phase={phase} className={s.storySection} id={section.id} key={section.id}>
          <div className={s.storyLabel}>{phase}</div>
          <div className={s.storyNarrative}>
            <NarrativeHeading accent={section.titleAccent}>{section.title}</NarrativeHeading>
            <NarrativeCopy lead={section.lead} body={section.body} className={s.storyCopy} />
            <SectionDetails items={section.details} />
            <SectionFlow flow={section.flow} />
            <DesignDecision comparison={section.comparison} />
          </div>
          {evidence.length > 0 ? <div className={`${s.storyEvidenceGrid} ${evidence.length === 1 ? s.storyEvidenceGridSingle : ''} ${isPhonePair ? s.storyEvidenceGridPhonePair : ''} ${isPhoneQuad ? s.storyEvidenceGridPhoneQuad : ''} ${isPhoneGallery ? s.storyEvidenceGridPhoneGallery : ''}`} data-evidence-grid="true" data-evidence-layout={evidenceLayout}>
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

      <section className={s.outcome} id="outcome" data-outcome-section="true">
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
