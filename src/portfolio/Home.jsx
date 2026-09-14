import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { allProjects } from '../data/portfolio'
import profile from '../data/profile.json'
import { ProjectImage, SectionHeading, TextLink } from './Shell'
import ProjectCover from './ProjectCover'
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

const homepageProjects = new Map(allProjects.map(project => [project.slug, project]))
const leadProjects = ['bubbas-production', 'pacepop', 'honda-spatial', 'ethicon-care'].map(slug => homepageProjects.get(slug))
const supportingProjects = [
  'swim-up-hill',
  'haily',
  'ars-pharma',
  'story-authoring',
  'bubbas-daily-target',
  'ai-3d-product-visualization',
  'handsign',
  'samsung-podcast',
].map(slug => homepageProjects.get(slug)).filter(Boolean)

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
        <TextLink href={`/work/${project.slug}/`}>Read project</TextLink>
      </div>
    </div>
  </article>
}

function CompactProject({ project, index }) {
  return <a data-reveal className={s.compactProject} href={`/work/${project.slug}/`}>
    <span className={s.projectNumber}>{String(index + 5).padStart(2, '0')}</span>
    <div className={s.compactThumb} aria-hidden="true"><ProjectCover project={project} variant="compact" /></div>
    <span className={s.compactCopy}>
      <span className={s.caseStudyOrg} data-project-company="true">{project.organization}</span>
      <strong>{caseStudyTitles[project.slug] || project.title}</strong>
      <span className={s.compactRole} data-project-role="true">{project.role}</span>
    </span>
    <ArrowUpRight size={22} aria-hidden="true" />
  </a>
}

function EditorialPortrait() {
  return <figure className={s.heroPortrait} data-hero-portrait="true">
    <div className={s.heroPortraitFrame}>
      <picture>
        <source
          srcSet="/assets/optimized/jumin-editorial-portrait-v2-720.webp 720w, /assets/optimized/jumin-editorial-portrait-v2.webp 1122w"
          sizes="(max-width: 600px) calc(100vw - 40px), 360px"
          type="image/webp"
        />
        <img
          src="/assets/jumin-editorial-portrait-v2.png"
          width="1122"
          height="1402"
          alt="Editorial portrait of Jumin Shin"
          loading="eager"
          fetchpriority="high"
          decoding="async"
        />
      </picture>
    </div>
  </figure>
}

export default function Home() {
  return <div className={s.homePage} data-home-editorial-type="true">
    <section className={s.hero} aria-label="Jumin Shin, UX Design Engineer">
      <div className={s.heroCopy}>
        <h1>Jumin Shin</h1>
        <p className={s.heroRole}>UX Design Engineer</p>
        <p className={s.heroStatement}>I turn research into working interfaces across AI, spatial computing and digital products.</p>
        <p className={s.heroMeta}>Research · Interaction · Prototyping · AI</p>
        <div className={s.heroAffiliation} aria-label="Graduate student at USC Iovine and Young Academy">
          <img src="/assets/USC_logo.svg" width="30" height="31" alt="" aria-hidden="true" />
          <span>
            <strong>USC Iovine and Young Academy</strong>
            <small>M.S. Student · Integrated Design, Business and Technology</small>
          </span>
        </div>
      </div>
      <EditorialPortrait />
    </section>

    <section className={s.caseStudies} id="work" aria-labelledby="case-studies-heading">
      <header className={s.caseStudiesHeader}>
        <h2 id="case-studies-heading">Case studies</h2>
        <span className={s.caseStudiesCount}>01–04</span>
      </header>
      <div className={s.caseStudyList}>
        {leadProjects.map((project, index) => <CaseStudyRow key={project.id} project={project} index={index} />)}
      </div>
    </section>

    <section className={s.capabilityBand} aria-labelledby="capability-heading">
      <div className={s.capabilityIntro}>
        <p className={s.label}>How I work</p>
        <h2 id="capability-heading">I like to get close to the problem, then make something people can react to.</h2>
        <p className={s.capabilityAside}>Sometimes that means a Figma flow. Sometimes it means shipping the front end myself.</p>
      </div>
      <a className={s.researchCallout} href="/research/">
        <span>Research notes and publications</span>
        <strong>Human-AI collaboration, accessibility and product direction.</strong>
        <ArrowRight size={28} aria-hidden="true" />
      </a>
    </section>

    <section className={s.moreWork} aria-labelledby="more-work-heading">
      <SectionHeading id="more-work-heading" title="More product work" note="Web delivery / UX evaluation / Internal tools / Service design" />
      <div className={s.compactProjectList}>
        {supportingProjects.map((project, index) => <CompactProject key={project.id} project={project} index={index} />)}
      </div>
      <div className={s.archiveCta}><p>Research, experiments and earlier projects remain available in the archive.</p><TextLink href="/archive/">View all projects</TextLink></div>
    </section>

    <section className={s.homeAbout} aria-labelledby="home-about-heading">
      <figure data-reveal className={s.aboutPortrait}>
        <a href="/about/" aria-label="About Jumin Shin" title="About Jumin Shin">
          <ProjectImage src="/assets/optimized/profile_hover2.webp" alt="Jumin Shin working at a laptop" sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1200px) 40vw, 480px" />
        </a>
        <figcaption><span>Jumin Shin</span><span>UX Design Engineer</span></figcaption>
      </figure>
      <div data-reveal className={s.homeAboutCopy}>
        <span className={s.label}>About</span>
        <h2 id="home-about-heading">A designer who makes ideas testable.</h2>
        <p className={s.aboutStatement}>I connect user research, interaction design and hands-on prototyping.</p>
        <p className={s.bodyText}>From UX research with Samsung and Hyundai to AI-assisted production workflows, I turn complex requirements into interfaces and prototypes. I’m pursuing an M.S. in Integrated Design, Business and Technology at USC.</p>
        <TextLink href="/about/">Experience and background</TextLink>
        <div className={s.miniExperience}>{profile.experience.filter(p => /Bubba|Swim|Embrain/.test(p.organization)).map(p => <div key={p.organization}><strong>{p.organization}</strong><span>{p.title}</span></div>)}</div>
      </div>
    </section>
  </div>
}
