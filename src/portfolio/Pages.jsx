import { useState } from 'react'
import { ArrowUpRight, ArrowRight } from 'lucide-react'
import { allProjects, researchProjects, categoryLabels } from '../data/portfolio'
import profile from '../data/profile.json'
import events from '../data/events.json'
import { ProjectImage, SectionHeading, TextLink, resumeUrl } from './Shell'
import s from './Portfolio.module.css'

const archiveCategories = ['All', 'Human-AI', 'Research', 'Spatial', 'Product', 'Experiment']
const researchThemes = [
  {
    title: 'Human-AI collaboration',
    question: 'How can people without programming knowledge shape branching stories with language models?',
    context: 'An authoring-tool prototype exploring narrative structure and AI-generated story elements.',
    slug: 'story-authoring',
    link: 'Interactive story authoring',
  },
  {
    title: 'Accessible experiences',
    question: 'How might an interactive interface support music expression for children with hearing impairments?',
    context: 'A collaborative interface proposal published at HCI Korea in 2022.',
    slug: 'sing-in-sign',
    link: 'Sing In Sign',
  },
]

export function About() {
  return <div className={s.innerPage}>
    <header className={s.pageHeading}>
      <p className={s.label}>About / {profile.location}</p>
      <h1>A people-first approach to UX.</h1>
    </header>
    <section className={s.aboutIntro} aria-label="About Jumin Shin">
      <figure><ProjectImage src="/assets/optimized/profile_hover2.webp" alt="Jumin Shin working at a laptop" eager sizes="(max-width: 600px) calc(100vw - 40px), 40vw" /><figcaption>Jumin Shin / {profile.role}</figcaption></figure>
      <div>
        <h2>{profile.tagline}</h2>
        {profile.bio.slice(0, 2).map(paragraph => <p className={s.bodyText} key={paragraph}>{paragraph}</p>)}
        <div className={s.aboutLinks}>
          <TextLink href={resumeUrl} external>Resume</TextLink>
          {profile.linkedin && <TextLink href={profile.linkedin} external>LinkedIn</TextLink>}
          {profile.github && <TextLink href={profile.github} external>GitHub</TextLink>}
        </div>
      </div>
    </section>
    <section className={s.capabilities} aria-labelledby="capabilities-heading">
      <SectionHeading id="capabilities-heading" title="UX skills & capabilities" />
      <div>
        {profile.capabilities.map(capability => <article key={capability.title}>
          <h3>{capability.title}</h3>
          <p className={s.bodyText}>{capability.description}</p>
        </article>)}
      </div>
    </section>
    <section className={s.experience} aria-labelledby="experience-heading">
      <SectionHeading id="experience-heading" title="Experience" />
      {profile.experience.map(experience => <article className={s.experienceRow} key={`${experience.organization}-${experience.title}`}>
        <p className={s.label}>{experience.period}</p>
        <div>
          <h3>{experience.organization}</h3>
          <p className={s.experienceRole}>{experience.title}</p>
        </div>
        <p className={s.bodyText}>{experience.description}</p>
      </article>)}
    </section>
    <section className={s.education} aria-labelledby="education-heading">
      <SectionHeading id="education-heading" title="Education" />
      {profile.education.map(education => <article className={s.educationRow} key={education.school}>
        <p className={s.label}>{education.period}</p>
        <div><h3>{education.school}</h3><p className={s.bodyText}>{education.degree}</p></div>
      </article>)}
    </section>
    <section className={s.recognition} aria-labelledby="recognition-heading">
      <SectionHeading id="recognition-heading" title="Recognition" />
      {profile.recognition.map(recognition => <div className={s.educationRow} key={recognition.title}>
        <span className={s.label}>{recognition.year}</span>
        <p>{recognition.title}</p>
      </div>)}
    </section>
    <div className={s.archiveCta}>
      <p>Community, workshops and moments along the way.</p>
      <TextLink href="/life/">Life outside the work</TextLink>
    </div>
  </div>
}

export function Research() {
  return <div className={s.innerPage}>
    <header className={s.pageHeading}>
      <p className={s.label}>UX research</p>
      <h1>Understanding users.<br />Shaping experiences.</h1>
      <p className={s.bodyText}>Exploring user needs, behaviors and contexts to inform product design, human-AI collaboration and accessible experiences.</p>
    </header>
    <section className={s.researchThemes} aria-label="Research themes and inquiry questions">
      {researchThemes.map((theme, index) => <article data-reveal key={theme.slug}>
        <p className={s.label}>{String(index + 1).padStart(2, '0')} / {theme.title}</p>
        <h2>{theme.question}</h2>
        <p className={s.bodyText}>{theme.context}</p>
        <TextLink href={`/work/${theme.slug}/`}>{theme.link}</TextLink>
      </article>)}
    </section>
    <section aria-labelledby="research-projects-heading">
      <SectionHeading id="research-projects-heading" title="Research case studies" />
      {researchProjects.map(project => {
        const fact = project.facts?.find(item => item.value && item.label)
        return <a data-reveal className={s.researchProject} href={`/work/${project.slug}/`} key={project.id}>
          <div>{project.image ? <ProjectImage src={project.image} alt={project.imageAlt || ''} /> : <div className={s.researchGlyph}>
            {fact && <><strong>{fact.value}</strong><span>{fact.label}</span></>}
          </div>}</div>
          <div>
            <p className={s.label}>{project.organization}</p>
            <h3>{project.title}</h3>
            {project.summary && <p className={s.bodyText}>{project.summary}</p>}
            {project.status && <p className={s.projectCategory}>{project.status}</p>}
          </div>
          <ArrowUpRight size={24} aria-hidden="true" />
        </a>
      })}
    </section>
    <section className={s.publicationSection} aria-labelledby="publications-heading">
      <SectionHeading id="publications-heading" title="Publications" />
      <div className={s.publications}>
        {profile.publications.map(publication => <article className={s.publication} key={publication.title}>
          <span className={s.label}>{publication.year}</span>
          <div>
            <h3>{publication.title}</h3>
            {publication.authors && <p className={s.bodyText}>{publication.authors}</p>}
            {publication.venue && <p className={s.venue}>{publication.venue}</p>}
          </div>
          {profile.scholar && <TextLink href={profile.scholar} external>Scholar</TextLink>}
        </article>)}
      </div>
    </section>
    <div className={s.archiveCta}>
      <p>Gesture interaction, explored through a working browser experiment.</p>
      <TextLink href="/work/handsign/">HandSign</TextLink>
    </div>
  </div>
}

export function Archive() {
  const [category, setCategory] = useState('All')
  const projects = category === 'All' ? allProjects : allProjects.filter(project => project.category === category)

  return <div className={s.innerPage}>
    <header className={s.pageHeading}>
      <p className={s.label}>Work archive</p>
      <h1>Projects & explorations.</h1>
      <p className={s.bodyText}>UX/UI design, user research, interaction concepts and working prototypes.</p>
    </header>
    <div className={s.archiveFilters} role="group" aria-label="Filter projects by category">
      {archiveCategories.map(filter => <button type="button" key={filter} aria-pressed={category === filter} aria-controls="archive-results" onClick={() => setCategory(filter)}>{categoryLabels[filter]}</button>)}
    </div>
    <p className={s.resultsCount} role="status" aria-live="polite" aria-atomic="true">
      {projects.length} {projects.length === 1 ? 'project' : 'projects'} / {categoryLabels[category]}
    </p>
    <div className={s.archiveList} id="archive-results">
      {projects.map((project, index) => <a className={s.archiveRow} key={project.id} href={`/work/${project.slug}/`}>
        <span className={s.projectNumber} aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
        <span className={s.archiveThumb} aria-hidden="true">
          {project.image ? <ProjectImage src={project.image} alt="" /> : <span>{project.category === 'Human-AI' ? 'AI' : project.category === 'Spatial' ? '3D' : 'R&D'}</span>}
        </span>
        <div>
          <h2>{project.title}</h2>
          {project.organization && <p>{project.organization}</p>}
          {project.status && <p className={s.archiveStatus}>{project.status}</p>}
        </div>
        <span className={s.archiveCategory}>{categoryLabels[project.category]}</span>
        <span className={s.label}>{project.year}</span>
        <ArrowUpRight size={21} aria-hidden="true" />
      </a>)}
      {projects.length === 0 && <p className={s.bodyText}>No projects in this category.</p>}
    </div>
  </div>
}

export function Life() {
  return <div className={s.innerPage}>
    <header className={s.pageHeading}>
      <p className={s.label}>Life</p>
      <h1>Beyond the studio.</h1>
      <p className={s.bodyText}>People, places and shared moments along the way.</p>
    </header>
    <div className={s.lifeGrid}>
      {events.map(event => {
        const title = (event.title || '').replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').trim()
        const description = event.id === 'life-003'
          ? 'Designed, built and pitched a functional automated messaging MVP in four hours to support medication adherence and communication for elderly patients. The team received an award at the USC IYA Vibe Coding Hackathon.'
          : event.description
        return <article key={event.id}>
          {event.image && <ProjectImage src={event.image} alt={title} />}
          <p className={s.label}>{[event.category, event.year].filter(value => value !== undefined && value !== null && value !== '').join(' / ')}</p>
          <h2>{title}</h2>
          {description && <p className={s.bodyText}>{description}</p>}
        </article>
      })}
    </div>
  </div>
}

export function NotFound() {
  return <div className={`${s.innerPage} ${s.notFound}`}>
    <p className={s.label}>404 / Page not found</p>
    <h1>This page is out of view.</h1>
    <p className={s.bodyText}>Return to the case studies to keep exploring.</p>
    <a className={s.textLink} href="/">Back to home<ArrowRight size={20} aria-hidden="true" /></a>
  </div>
}
