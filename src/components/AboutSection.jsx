import { useState } from 'react'
import styles from './AboutSection.module.css'
import profilePhoto from '../assets/profile.png'

const links = [
  { label: 'LinkedIn',   href: 'https://www.linkedin.com/in/juminshin' },
  { label: 'GitHub',     href: 'https://github.com/juminshin06/juminshin06' },
  { label: 'Scholar',    href: 'https://scholar.google.com/citations?user=RxmsjhAAAAAJ&hl=ko' },
  { label: 'Instagram',  href: 'https://www.instagram.com/' },
  { label: 'Resume',     href: '/resume.pdf' },
]

const education = [
  {
    year: '2024 –',
    degree: 'M.S. Integrated Design, Business & Technology',
    school: 'University of Southern California',
    initials: 'USC', logoBg: '#990000',
  },
  {
    year: '2022 – 23',
    degree: 'International Exchange Program',
    school: 'Exchange Student',
    initials: 'EX', logoBg: '#444444',
  },
  {
    year: '– 2024',
    degree: 'BFA Design Convergence  ·  BS Game Software',
    school: 'Hongik University — Dual Degree',
    initials: 'HU', logoBg: '#1a4fa8',
  },
]

const workExperience = [
  {
    period: 'Sep – Dec 2025',
    title: 'Student Assistant · TA',
    company: 'USC Iovine and Young Academy',
    impact: 'Rebuilt course materials for ACAD-325 Human Technology Interaction, embedding live industry case studies and structured design critique into a 30-student HCI seminar.',
    featured: false,
  },
  {
    period: 'Nov 2023 – Jun 2024',
    title: 'UX Researcher & Designer',
    company: 'Macromill Embrain',
    impact: 'Led research for Samsung Electronics, Hyundai Motors, and SK — Galaxy personalization studies, SUV in-cabin experience design, and an AI employee platform presented at an executive generative AI workshop.',
    featured: true,
  },
  {
    period: 'Aug – Dec 2022',
    title: 'Web Developer',
    company: 'Zephframe · Remote',
    impact: 'Shipped scroll-triggered interactive experiences and Unreal Engine virtual showrooms demonstrating an AI-powered modular smart door concept to international clients.',
    featured: false,
  },
  {
    period: 'Mar – Jun 2022',
    title: 'UX Designer',
    company: 'Cheil Worldwide · Samsung Electronics',
    impact: 'Designed and launched promotional sites for London, Berlin, and Paris markets, creating the global debut UI for Samsung Galaxy Fold4 and Flip4.',
    featured: false,
  },
]

const research = [
  {
    period: 'Mar – Dec 2023',
    title: 'LLM-Based Interactive Storytelling Authoring Tool',
    institution: 'Hongik University · Prof. Byung-Chull Bae',
    skills: ['Python', 'Figma'],
    impact: 'Prototyped an AI-powered authoring environment for branching narratives. Presented at ICIDS 2023 (Kobe, Japan) and KIISE (Jeju, South Korea).',
  },
  {
    period: 'Jan – Mar 2022',
    title: 'EV Charging Port Interface Design',
    institution: 'Hyundai Motor Company · Industry–Academia',
    skills: ['C++', 'Figma', 'Film'],
    impact: 'Secured $200 research grant with Prof. Kicheol Pak; prototyped and user-tested a mobility-adaptive charging port UI improving accessibility for diverse driver contexts.',
  },
  {
    period: 'Dec 2020 – Mar 2021',
    title: 'Podcast GUI & Mobile Interaction Research',
    institution: 'Samsung Electronics · Industry–Academia',
    skills: ['Figma', 'After Effects'],
    impact: 'Secured $1,000 grant with Prof. Min-Jeong Kang to conduct compensated usability testing for Samsung MX Division\'s podcast format and interactive GUI concepts.',
  },
]

const publications = [
  {
    year: '2023',
    title: 'Designing a Language Model-Based Authoring Tool Prototype for Interactive Storytelling',
    venue: 'ICIDS 2023 · Kobe, Japan',
    badge: null,
  },
  {
    year: '2023',
    title: 'A Study on the Design of Exterior Doors and Indicators for Improved Usability of EV Charging Ports',
    venue: 'Korean Society of Design Science',
    badge: null,
  },
  {
    year: '2023',
    title: 'Designing a Prototype for an Interactive Story Authoring Tool Utilizing Generative Language Models',
    venue: 'KIISE · Jeju Island, South Korea',
    badge: null,
  },
  {
    year: '2022',
    title: 'Sing In Sign: An Interactive Music Expression Interface for Children with Hearing Impairments',
    venue: 'HCI Korea',
    badge: '1st author',
  },
]

const awardGroups = [
  {
    category: 'Competitions & Recognition',
    items: [
      { year: '2026', title: '1st Place · Newegg Gamer Zone Educational Technology Workshop' },
      { year: '2026', title: 'Award Recipient · USC IYA Vibe Coding Hackathon' },
      { year: '2022', title: 'Certificate of Recognition' },
      { year: '2021', title: '1st Place · AI and Art Contest (Video)' },
      { year: '2021', title: "Seoul Mayor's Award · Human City Design Workshop" },
      { year: '2021', title: 'Korea + Sweden Young Design Award' },
      { year: '2020', title: 'Korea + Sweden Young Design Award' },
      { year: '2020', title: 'Excellence Prize' },
    ],
  },
  {
    category: 'Scholarships & Grants',
    items: [
      { year: '2023',      title: 'Lotte Scholarship Foundation' },
      { year: '2021–22',   title: 'Korea Student Aid Foundation — Arts & Sports Vision' },
      { year: '2019–23',   title: 'Hongik University Internal Scholarship' },
    ],
  },
  {
    category: 'Industry Collaboration',
    items: [
      { year: '2021–22', title: 'Co-launched a Lifestyle Product Line with CAVA LIFE' },
    ],
  },
]

export default function AboutSection() {
  const [emailCopied, setEmailCopied] = useState(false)

  const copyEmail = () => {
    navigator.clipboard?.writeText('juminshi@usc.edu').then(() => {
      setEmailCopied(true)
      setTimeout(() => setEmailCopied(false), 1200)
    })
  }

  return (
    <section className={styles.about} id="about" aria-label="About">

      {/* ── Hero: positioning + photo ── */}
      <div className={styles.hero}>
        <div className={styles.heroText}>
          <div className={styles.nameRow}>
            <h2 className={styles.name}>Jumin Shin</h2>
            <p className={styles.roleTag}>HCI Research · UX Design · AI Systems</p>
            <div className={styles.meta}>
              <span>📍 Los Angeles, CA</span>
            </div>
          </div>

          <p className={styles.bio}>
            I work at the crossroads of HCI research, AI systems, and UX design —
            translating behavioral complexity into experiences that are
            analytically rigorous and deeply human.
          </p>

          <div className={styles.linksWrapper}>
            <div className={styles.toastRow}>
              <span className={`${styles.toast} ${emailCopied ? styles.toastVisible : ''}`}>
                ✓ Copied juminshi@usc.edu
              </span>
            </div>
            <div className={styles.links}>
              <button className={styles.linkPrimary} onClick={copyEmail}>Email</button>
              <a href={links[0].href} className={styles.linkPrimary} target="_blank" rel="noopener noreferrer">LinkedIn</a>
              <a href={links[4].href} className={styles.linkSecondary}>Resume</a>
              <div className={styles.linkDivider} />
              {links.slice(1, 4).map(({ label, href }) => (
                <a key={label} href={href} className={styles.linkGhost} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.heroPhoto}>
          {profilePhoto ? (
            <img src={profilePhoto} alt="Jumin Shin" className={styles.photo} />
          ) : (
            <div className={styles.photoPlaceholder} aria-hidden="true">
              <span>JS</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Marquee ticker ── */}
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {[0, 1].map((i) => (
            <span key={i} className={styles.tickerInner}>
              Health &nbsp;·&nbsp; Data Analytics &nbsp;·&nbsp; Generative AI &nbsp;·&nbsp; UX Research &nbsp;·&nbsp; HCI &nbsp;·&nbsp; Accessibility &nbsp;·&nbsp; Design Systems &nbsp;·&nbsp; Machine Learning &nbsp;·&nbsp; Human Behavior &nbsp;·&nbsp; Spatial Computing &nbsp;·&nbsp; Interaction Design &nbsp;·&nbsp; Computer Vision &nbsp;·&nbsp;&ensp;
            </span>
          ))}
        </div>
      </div>

      {/* ── Full-width sections ── */}
      <div className={styles.sections}>

        {/* ── Work Experience → niteesh-style rows ── */}
        <div className={styles.block}>
          <h3 className={styles.blockLabel}>Work Experience</h3>
          <div className={styles.workTable}>
            {workExperience.map((item) => (
              <div
                key={item.title}
                className={`${styles.workRow} ${item.featured ? styles.workRowFeatured : ''}`}
              >
                <div className={styles.workRowLeft}>
                  <span className={styles.workRowPeriod}>{item.period}</span>
                  {item.featured && <span className={styles.workKeyBadge}>Key</span>}
                </div>
                <div className={styles.workRowRight}>
                  <p className={styles.workRowTitle}>{item.title}</p>
                  <p className={styles.workRowCompany}>{item.company}</p>
                  <p className={styles.workRowImpact}>{item.impact}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Education → logo-prominent rows ── */}
        <div className={styles.block}>
          <h3 className={styles.blockLabel}>Education</h3>
          <div className={styles.eduList}>
            {education.map(({ year, degree, school, initials, logoBg }) => (
              <div key={degree} className={styles.eduRow}>
                <div className={styles.eduLogoWrap} style={{ background: logoBg }} aria-hidden="true">
                  <span className={styles.eduInitials}>{initials}</span>
                </div>
                <div className={styles.eduInfo}>
                  <p className={styles.eduSchool}>{school}</p>
                  <p className={styles.eduDegree}>{degree}</p>
                </div>
                <span className={styles.eduYear}>{year}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Research Projects + Publications — side by side ── */}
        <div className={styles.researchPubGrid}>
          <div className={styles.block}>
            <h3 className={styles.blockLabel}>Research Projects</h3>
            <div className={styles.simpleList}>
              {research.map((item) => (
                <div key={item.title} className={styles.simpleItem}>
                  <span className={styles.simpleYear}>{item.period}</span>
                  <p className={styles.simpleTitle}>{item.title}</p>
                  <p className={styles.simpleSub}>{item.institution}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.block}>
            <h3 className={styles.blockLabel}>Publications</h3>
            <div className={styles.simpleList}>
              {publications.map((pub) => (
                <div key={pub.title} className={styles.simpleItem}>
                  <span className={styles.simpleYear}>{pub.year}</span>
                  <p className={styles.simpleTitle}>
                    {pub.title}
                    {pub.badge && <span className={styles.minimalBadge}>{pub.badge}</span>}
                  </p>
                  <p className={styles.simpleSub}>{pub.venue}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Recognition → 2-column layout ── */}
        <div className={styles.block}>
          <h3 className={styles.blockLabel}>Recognition</h3>
          <div className={styles.recGrid}>
            {/* Left: Competitions & Recognition */}
            <div className={styles.recCol}>
              {awardGroups.slice(0, 1).map((group) => (
                <div key={group.category} className={styles.recGroup}>
                  <p className={styles.recGroupLabel}>{group.category}</p>
                  {group.items.map((aw) => (
                    <div key={`${aw.year}-${aw.title}`} className={styles.recRow}>
                      <span className={styles.recYear}>{aw.year}</span>
                      <span className={styles.recTitle}>{aw.title}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            {/* Right: Scholarships & Grants + Industry Collaboration */}
            <div className={styles.recCol}>
              {awardGroups.slice(1).map((group) => (
                <div key={group.category} className={styles.recGroup}>
                  <p className={styles.recGroupLabel}>{group.category}</p>
                  {group.items.map((aw) => (
                    <div key={`${aw.year}-${aw.title}`} className={styles.recRow}>
                      <span className={styles.recYear}>{aw.year}</span>
                      <span className={styles.recTitle}>{aw.title}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

    </section>
  )
}
