import { ArrowRight } from 'lucide-react'
import { homepageProjects } from '../data/portfolio'
import profile from '../data/profile.json'
import { TextLink } from './Shell'
import ProjectCover from './ProjectCover'
import TechTools from './Toolkit'
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

// The first few projects get the composed lead covers; the rest use the lighter gallery cover.
const leadCount = 4

const homeSchools = [
  { name: 'USC Iovine and Young Academy', degree: 'M.S. Integrated Design, Business & Technology', logo: '/assets/logo-usc.png' },
  { name: 'TU Berlin', degree: 'International Exchange Program', logo: '/assets/logo-tu-berlin.png' },
  { name: 'Hongik University', degree: 'BFA Design Convergence · B.Eng. Game Software', logo: '/assets/logo-hongik.png' },
]

function FeedCard({ project, index }) {
  const lead = index < leadCount
  const title = caseStudyTitles[project.slug] || project.title
  const href = `/work/${project.slug}/`
  const marker = lead ? { 'data-case-study-entry': 'true' } : { 'data-more-work-project': 'true' }
  return <li data-reveal {...marker} className={`${s.feedCard} ${lead ? '' : s.productWorkCard}`} data-project-slug={project.slug}>
    <a href={href} className={`${s.feedMedia} ${lead ? s.caseStudyMedia : s.productWorkMedia}`} data-project-slug={project.slug} data-cursor="Open" aria-label={`View case study: ${title}`}>
      <ProjectCover project={project} variant={lead ? 'lead' : 'gallery'} eager={index === 0} />
    </a>
    <div className={s.feedMeta} data-project-caption="true">
      <h3><a href={href}>{title}</a></h3>
      <span className={s.feedYear}>{project.year}</span>
      <p className={s.feedLine}>
        <span className={s.caseStudyCompany} data-project-company="true">{project.organization}</span>
        <span className={s.feedRole} data-project-role="true">{project.role}</span>
      </p>
      <span className={s.projectProcessCue} data-project-process-cue="true">{project.processCue}</span>
    </div>
  </li>
}

function EditorialPortrait() {
  return <picture>
    <source
      srcSet="/assets/optimized/jumin-editorial-portrait-v2-720.webp 720w, /assets/optimized/jumin-editorial-portrait-v2.webp 1122w"
      sizes="(max-width: 600px) calc(100vw - 40px), (max-width: 1200px) 40vw, 480px"
      type="image/webp"
    />
    <img
      src="/assets/jumin-editorial-portrait-v2.png"
      width="1122"
      height="1402"
      alt="Editorial portrait of Jumin Shin"
      loading="lazy"
      decoding="async"
    />
  </picture>
}

export default function Home() {
  return <div className={s.homePage} data-home-editorial-type="true">
    <section className={s.hero} aria-label="Jumin Shin, UX Design Engineer">
      <div className={s.heroCopy}>
        <div className={s.heroIdentity}>
          <h1>Jumin Shin</h1>
          <p className={s.heroRole}>UX Design Engineer</p>
        </div>
        <p className={s.heroStatement}>I turn research into working interfaces across AI, spatial computing and digital products.</p>
        <p className={s.heroMeta}>Research · Interaction · Prototyping · AI</p>
        <div className={s.heroAffiliation} aria-label="Graduate student at USC Iovine and Young Academy">
          <img src="/assets/logo-usc.png" width="30" height="31" alt="" aria-hidden="true" />
          <span>
            <strong>USC Iovine and Young Academy</strong>
            <small>M.S. Student · Integrated Design, Business and Technology</small>
          </span>
        </div>
      </div>
    </section>

    <section className={s.feed} id="work" aria-label="Selected work">
      <ol className={s.feedList} data-work-feed="true">
        {homepageProjects.map((project, index) => <FeedCard key={project.id} project={project} index={index} />)}
      </ol>
      <a className={s.researchCallout} href="/research/" data-research-cta="true">
        <span>Research notes and publications</span>
        <strong>Human-AI collaboration, accessibility and product direction.</strong>
        <ArrowRight size={28} aria-hidden="true" />
      </a>
      <div className={s.archiveCta}><p>Research, experiments and earlier projects remain available in the archive.</p><TextLink href="/archive/">View all projects</TextLink></div>
    </section>

    <section className={s.homeAbout} aria-labelledby="home-about-heading">
      <figure data-reveal className={`${s.aboutPortrait} ${s.aboutPortraitEditorial}`} data-hero-portrait="true">
        <a href="/about/" aria-label="About Jumin Shin" title="About Jumin Shin">
          <EditorialPortrait />
        </a>
        <figcaption><span>Jumin Shin</span><span>UX Design Engineer</span></figcaption>
      </figure>
      <div data-reveal className={s.homeAboutCopy}>
        <span className={s.label}>About</span>
        <h2 id="home-about-heading">A designer who makes ideas testable.</h2>
        <p className={s.aboutStatement}>I connect user research, interaction design and hands-on prototyping.</p>
        <p className={s.bodyText}>From UX research with Samsung and Hyundai to AI-assisted production workflows, I turn complex requirements into interfaces and prototypes. I’m pursuing an M.S. in Integrated Design, Business and Technology at USC.</p>
        <TextLink href="/about/">Experience and background</TextLink>
        <div className={s.miniExperience}>{profile.experience.map(p => <article key={`${p.organization}-${p.period}`} data-home-experience="true"><strong>{p.organization}</strong><span>{p.title}</span><small>{p.period}</small></article>)}</div>
        <section className={s.homeEducation} aria-labelledby="home-education-heading">
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
