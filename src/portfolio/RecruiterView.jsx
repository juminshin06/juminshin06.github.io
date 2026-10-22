import { ArrowUpRight, FileText, Mail, Link2 } from 'lucide-react'
import profile from '../data/profile.json'
import { recruiterSummary } from './hiring'
import { ProjectImage, resumeUrl, TextLink } from './Shell'
import RoleFilter from './RoleFilter'
import TechTools from './Toolkit'
import s from './Portfolio.module.css'

const currentEducation = profile.education[0]

function RecruiterProject({ project, role }) {
  const summary = recruiterSummary(project, role)
  return <article className={s.recruiterProject} data-recruiter-project={summary.slug}>
    <a className={s.recruiterThumb} href={summary.href} tabIndex={-1} aria-hidden="true">
      {summary.image && <ProjectImage src={summary.image} alt="" sizes="(max-width: 600px) 100vw, 220px" />}
    </a>
    <div className={s.recruiterProjectBody}>
      <p className={s.recruiterProjectMeta}>{summary.organization} · {summary.year}</p>
      <h3><a href={summary.href}>{summary.title}</a></h3>
      <dl className={s.recruiterFacts}>
        <div><dt>Role</dt><dd>{summary.role}</dd></div>
        {summary.problem && <div><dt>Problem</dt><dd>{summary.problem}</dd></div>}
        {summary.contribution && <div><dt>What I did</dt><dd>{summary.contribution}</dd></div>}
        {summary.outcome && <div><dt>Outcome</dt><dd>{summary.outcome}</dd></div>}
      </dl>
      {summary.skills.length > 0 && <ul className={s.recruiterSkills} aria-label="Relevant skills">
        {summary.skills.map(skill => <li key={skill}>{skill}</li>)}
      </ul>}
      <TextLink href={summary.href}>View full case study</TextLink>
    </div>
  </article>
}

// The 60-second portfolio: who I am, what I do, the most relevant work, skills, resume, contact.
export default function RecruiterView({ projects, role, onRoleChange }) {
  return <div className={s.recruiterView} data-recruiter-view="true">
    <section className={s.recruiterIntro} aria-labelledby="recruiter-heading">
      <h1 id="recruiter-heading" tabIndex={-1}>{profile.name}</h1>
      <p className={s.recruiterRole}>{profile.role}</p>
      <p className={s.recruiterStatement}>I turn research into working interfaces across AI, spatial computing and digital products.</p>
      <p className={s.recruiterFactsLine}>
        <span>{profile.location}</span>
        <span>{currentEducation.degree}, USC ({currentEducation.period})</span>
      </p>
    </section>

    <section className={s.recruiterSection} aria-labelledby="recruiter-what">
      <h2 id="recruiter-what">What I do</h2>
      <ul className={s.recruiterCapabilities}>
        {profile.capabilities.map(item => <li key={item.title}><strong>{item.title}</strong><span>{item.description}</span></li>)}
      </ul>
    </section>

    <section className={s.recruiterSection} aria-labelledby="recruiter-work">
      <div className={s.recruiterSectionHead}>
        <h2 id="recruiter-work">Selected work</h2>
        <RoleFilter role={role} onChange={onRoleChange} id="recruiter-role-filter" />
      </div>
      <div className={s.recruiterProjects} key={role}>
        {projects.map(project => <RecruiterProject key={project.slug} project={project} role={role} />)}
      </div>
      <TextLink href="/archive/">All projects</TextLink>
    </section>

    <section className={s.recruiterSection} aria-labelledby="recruiter-skills">
      <h2 id="recruiter-skills">Core skills</h2>
      <TechTools home />
    </section>

    <section className={`${s.recruiterSection} ${s.recruiterClose}`} aria-labelledby="recruiter-contact">
      <h2 id="recruiter-contact">Resume & contact</h2>
      <div className={s.recruiterActions}>
        <a className={s.recruiterAction} href={resumeUrl} target="_blank" rel="noreferrer"><FileText size={18} aria-hidden="true" /><span>Resume (PDF)</span><ArrowUpRight size={16} aria-hidden="true" /></a>
        <a className={s.recruiterAction} href={`mailto:${profile.email}`}><Mail size={18} aria-hidden="true" /><span>{profile.email}</span><ArrowUpRight size={16} aria-hidden="true" /></a>
        <a className={s.recruiterAction} href={profile.linkedin} target="_blank" rel="noreferrer"><Link2 size={18} aria-hidden="true" /><span>LinkedIn</span><ArrowUpRight size={16} aria-hidden="true" /></a>
      </div>
      <TextLink href="/about/">Experience and background</TextLink>
    </section>
  </div>
}
