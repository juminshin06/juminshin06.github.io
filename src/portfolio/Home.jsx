import { useEffect, useRef } from 'react'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { homepageProjects } from '../data/portfolio'
import profile from '../data/profile.json'
import { EditorialPortrait, ProjectImage, SectionHeading, TextLink } from './Shell'
import ProjectCover from './ProjectCover'
import IntroScreen from './IntroScreen'
import TechTools from './Toolkit'
import RoleFilter from './RoleFilter'
import RecruiterView from './RecruiterView'
import useHiringView from './useHiringView'
import { rankForRole, roleLabel } from './hiring'
import s from './Portfolio.module.css'

const caseStudyTitles = {
  'bubbas-production': 'AI-assisted production',
  'honda-spatial': 'Spatial design review',
  'ethicon-care': 'Post-operative care',
  'story-authoring': 'Human-AI storytelling',
  'swim-up-hill': 'Website design and delivery',
  'ai-3d-product-visualization': 'AI-assisted 3D production',
  'bubbas-daily-target': 'Daily Target',
  'ars-pharma': 'Anaphylaxis care',
  pacepop: 'PACEPOP',
}

const LEAD_COUNT = 4

const homeSchools = [
  { name: 'USC Iovine and Young Academy', degree: 'M.S. Integrated Design, Business & Technology', logo: '/assets/logo-usc.png' },
  { name: 'TU Berlin', degree: 'International Exchange Program', logo: '/assets/logo-tu-berlin.png' },
  { name: 'Hongik University', degree: 'BFA Design Convergence · B.Eng. Game Software', logo: '/assets/logo-hongik.png' },
]

function CaseStudyRow({ project, index }) {
  const primaryFact = project.facts?.[0]
  return <article data-reveal data-case-study-entry="true" className={s.caseStudyRow}>
    <a href={`/work/${project.slug}/`} className={s.caseStudyMedia} data-project-slug={project.slug} aria-label={`View case study: ${project.title}`}>
      <ProjectCover project={project} variant="lead" eager={index === 0} />
      <span className={s.projectAction} aria-hidden="true">View case study<ArrowUpRight size={18} /></span>
    </a>
    <div className={s.caseStudyCaption} data-project-caption="true">
      <div className={s.caseStudyIdentity}>
        <span className={s.caseStudyCompany} data-project-company="true">{project.organization}</span>
        <span className={s.caseStudyNumber}>{String(index + 1).padStart(2, '0')}</span>
      </div>
      <div className={s.caseStudyCopy}>
        <h3><a href={`/work/${project.slug}/`}>{caseStudyTitles[project.slug] || project.title}</a></h3>
        <p className={s.caseStudySummary}>{project.summary}</p>
      </div>
      <div className={s.caseStudyDetails}>
        <dl>
          <div><dt>My role</dt><dd>{project.role}</dd></div>
          {primaryFact && <div><dt>{primaryFact.label}</dt><dd>{primaryFact.value}</dd></div>}
        </dl>
      </div>
    </div>
  </article>
}

function ProductWorkCard({ project }) {
  return <a data-reveal data-more-work-project="true" data-project-slug={project.slug} className={s.productWorkCard} href={`/work/${project.slug}/`}>
    <div className={s.productWorkMedia} aria-hidden="true"><ProjectCover project={project} variant="gallery" /></div>
    <span className={s.productWorkCaption}>
      <span className={s.productWorkIdentity}>
        <span className={s.caseStudyOrg} data-project-company="true">{project.organization}</span>
        <span>{project.year}</span>
      </span>
      <strong>{caseStudyTitles[project.slug] || project.title}</strong>
      <span className={s.productWorkRole} data-project-role="true">{project.role}</span>
      <ArrowUpRight size={22} aria-hidden="true" />
    </span>
  </a>
}


// Shown while recruiter mode is on: what is active, and the way back to the full portfolio.
function ModeBar({ role, onExit }) {
  return <div className={s.modeBar} data-mode-bar="true">
    <p className={s.modeBarStatus}>
      <span className={s.modePill} aria-hidden="true">Recruiter mode on</span>
      <span className="sr-only">Recruiter mode is on.</span>
      {role !== 'all' && <span className={s.modeBarRole}>Focused on {roleLabel(role)}</span>}
    </p>
    <button type="button" className={s.modeBarExit} onClick={onExit}>View full portfolio</button>
  </div>
}

export default function Home() {
  const { role, recruiter, setRole, setRecruiter } = useHiringView()
  const ranked = rankForRole(homepageProjects, role)
  const leadProjects = ranked.slice(0, LEAD_COUNT)
  const supportingProjects = ranked.slice(LEAD_COUNT)
  const entryRef = useRef(null)
  const wasRecruiter = useRef(recruiter)

  // Entering or leaving recruiter mode swaps the page body, so start at the top and move focus
  // to where the reader is: the recruiter intro, or back to the control that opened it.
  useEffect(() => {
    if (wasRecruiter.current === recruiter) return
    wasRecruiter.current = recruiter
    window.scrollTo({ top: 0, behavior: 'instant' })
    if (recruiter) document.getElementById('recruiter-heading')?.focus({ preventScroll: true })
    else entryRef.current?.focus({ preventScroll: true })
  }, [recruiter])

  if (recruiter) return <div className={s.homePage} data-home-editorial-type="true" data-recruiter-mode="true">
    <ModeBar role={role} onExit={() => setRecruiter(false)} />
    <RecruiterView projects={leadProjects} role={role} onRoleChange={setRole} />
  </div>

  return <div className={s.homePage} data-home-editorial-type="true">
    <IntroScreen onRecruiter={() => setRecruiter(true)} recruiterRef={entryRef} />

    <section className={s.caseStudies} id="work" aria-label="Selected work" data-work-start="true">
      <div className={s.workToolbar}>
        <h2 className={s.workHeading}>Selected work</h2>
        <RoleFilter role={role} onChange={setRole} />
        <p className="sr-only" aria-live="polite">{role === 'all' ? 'Showing all work in curated order.' : `Showing ${roleLabel(role)} work first.`}</p>
      </div>
      <div className={s.caseStudyList} key={role} data-role-ranked={role}>
        {leadProjects.map((project, index) => <CaseStudyRow key={project.id} project={project} index={index} />)}
      </div>
    </section>

    <section className={s.moreWork} aria-labelledby="more-work-heading">
      <SectionHeading id="more-work-heading" title="More product work" />
      <div className={s.productWorkGrid} key={role}>
        {supportingProjects.map(project => <ProductWorkCard key={project.id} project={project} />)}
      </div>
      <a className={s.researchCallout} href="/research/" data-research-cta="true">
        <span>Research notes and publications</span>
        <strong>Human-AI collaboration, accessibility and product direction.</strong>
        <ArrowRight size={28} aria-hidden="true" />
      </a>
      <div className={s.archiveCta}><p>Research, experiments and earlier projects remain available in the archive.</p><TextLink href="/archive/">View all projects</TextLink></div>
    </section>

    <section className={s.homeAbout} aria-labelledby="home-about-heading">
      {/* One screen, four tiles: who, what she does, where she has worked, where she studied. */}
      <div className={s.aboutBento} data-npc-avoid="true">
        <figure data-reveal className={`${s.aboutPortrait} ${s.aboutPortraitEditorial} ${s.bentoPortrait}`} data-hero-portrait="true">
          <a href="/about/" aria-label="About Jumin Shin" title="About Jumin Shin">
            <EditorialPortrait />
          </a>
          <figcaption><span>Jumin Shin</span><span>UX Design Engineer</span></figcaption>
        </figure>
        <div data-reveal className={`${s.homeAboutCopy} ${s.bentoTile} ${s.bentoIntro}`}>
          <div className={s.bentoIntroHead}>
            <span className={s.label}>About</span>
            <TextLink href="/about/">Experience and background</TextLink>
          </div>
          <h2 id="home-about-heading">A designer who makes ideas testable.</h2>
          <p className={s.aboutStatement}>I connect user research, interaction design and hands-on prototyping, from UX research with Samsung and Hyundai to AI-assisted production workflows.</p>
        </div>
        <section data-reveal className={`${s.bentoTile} ${s.bentoExperience}`} aria-labelledby="home-experience-heading">
          <h3 id="home-experience-heading" className={s.aboutSubhead}>Experience</h3>
          <div className={s.miniExperience}>{profile.experience.map(p => <article key={`${p.organization}-${p.period}`} data-home-experience="true"><strong>{p.title}</strong><span>{p.organization}</span><small>{p.period}</small></article>)}</div>
        </section>
        <section data-reveal className={`${s.homeEducation} ${s.bentoTile} ${s.bentoEducation}`} aria-labelledby="home-education-heading">
          <h3 id="home-education-heading">Education</h3>
          <ul>{homeSchools.map(school => <li data-home-education-entry="true" key={school.name}>
            <img src={school.logo} alt="" aria-hidden="true" loading="lazy" decoding="async" />
            <span><strong>{school.name}</strong><small>{school.degree}</small></span>
          </li>)}</ul>
        </section>
      </div>
      <section className={s.homeToolkit} aria-labelledby="home-toolkit-heading">
        <div className={s.homeToolkitHeading}>
          <h2 id="home-toolkit-heading">Tools I work with</h2>
          <span>Design, research and prototyping</span>
        </div>
        <TechTools home />
      </section>
    </section>
  </div>
}
