import { useEffect, useRef, useState } from 'react'
import { ArrowUpRight, ArrowRight, Menu, X, Download, Mail, Link2, FileText, BookOpen, Archive as ArchiveIcon, Sparkles } from 'lucide-react'
import profile from '../data/profile.json'
import imageManifest from '../../public/assets/optimized/manifest.json'
import LogoCharacter from './LogoCharacter'
import Critters from './Critters'
import s from './Portfolio.module.css'

export const resumeUrl = '/assets/JuminShin_Resume.pdf'

// Jumin's local time (Los Angeles); it fills in on the client so prerendered pages never go stale.
function LiveClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const format = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', minute: '2-digit', second: '2-digit' })
    const update = () => setTime(format.format(new Date()))
    update()
    const timer = window.setInterval(update, 1000)
    return () => window.clearInterval(timer)
  }, [])
  return <p className={s.localTime} data-local-time="true">{time && <time>{time}</time>}</p>
}
export function TextLink({ href, children, external = false, className = '' }) {
  return <a className={`${s.textLink} ${className}`} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
    {children}<ArrowUpRight size={17} aria-hidden="true" />
  </a>
}
// The header stays clear over the top of the page and frosts once content scrolls under it
// (or while the mobile menu is open), so the first screen reads as one surface.
function useScrolled(offset = 8) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > offset)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [offset])
  return scrolled
}

export function Header({ active }) {
  const [open, setOpen] = useState(false)
  const scrolled = useScrolled()
  const toggle = useRef(null)
  const closeMenu = event => {
    if (event.key === 'Escape') { setOpen(false); toggle.current?.focus() }
  }
  return <header className={s.header} data-solid={scrolled || open ? 'true' : 'false'} onKeyDown={closeMenu}>
    <a className={s.brand} href="/" aria-label="Jumin Shin, home"><LogoCharacter /><span>Jumin Shin</span></a>
    <div className={s.headerRight}>
      <nav className={s.desktopNav} aria-label="Primary">
        <a href="/#work" aria-current={active === 'home' ? 'page' : undefined}>Work</a>
        <a href="/about/" aria-current={active === 'about' ? 'page' : undefined}>About me</a>
        <a href="/research/" aria-current={active === 'research' ? 'page' : undefined}>Research</a>
        <a href={resumeUrl} target="_blank" rel="noreferrer">Resume<ArrowUpRight size={16} aria-hidden="true" /></a>
      </nav>
      <LiveClock />
    </div>
    <div className={s.mobileTools}>
      <a href={resumeUrl} target="_blank" rel="noreferrer" aria-label="Open resume PDF" title="Resume PDF"><Download size={21} /></a>
      <button ref={toggle} aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-navigation" onClick={() => setOpen(!open)} title={open ? 'Close menu' : 'Open menu'}>{open ? <X size={23} /> : <Menu size={23} />}</button>
    </div>
    {open && <nav id="mobile-navigation" className={s.mobileNav} aria-label="Mobile navigation">
      {[['Work', '/#work'], ['About me', '/about/'], ['Research', '/research/'], ['Archive', '/archive/']].map(([label, href]) => <a key={label} href={href} onClick={() => setOpen(false)}>{label}<ArrowRight size={24} /></a>)}
      <a href={`mailto:${profile.email}`}>Email<ArrowUpRight size={22} /></a>
      <a href={profile.linkedin} target="_blank" rel="noreferrer">LinkedIn<ArrowUpRight size={22} /></a>
    </nav>}
  </header>
}
export function Footer() {
  return <footer className={s.footer} id="contact">
    <Critters />
    <div className={s.footerTop}>
      <div className={s.footerHeading}>
        <p className={s.label}>Contact</p>
        <h2>Let’s connect.</h2>
      </div>
      <div className={s.footerActions}>
        <div className={s.contactLinks} data-contact-links="true">
          <a className={s.contactLink} href={`mailto:${profile.email}`} aria-label={`Email ${profile.email}`} title={profile.email}>
            <span className={s.contactIcon}><Mail size={18} aria-hidden="true" /></span><strong>Email</strong><ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a className={s.contactLink} href={profile.linkedin} target="_blank" rel="noreferrer">
            <span className={s.contactIcon}><Link2 size={18} aria-hidden="true" /></span><strong>LinkedIn</strong><ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a className={s.contactLink} href={resumeUrl} target="_blank" rel="noreferrer">
            <span className={s.contactIcon}><FileText size={18} aria-hidden="true" /></span><strong>Resume</strong><ArrowUpRight size={17} aria-hidden="true" />
          </a>
          <a className={s.contactLink} href={profile.scholar} target="_blank" rel="noreferrer">
            <span className={s.contactIcon}><BookOpen size={18} aria-hidden="true" /></span><strong>Scholar</strong><ArrowUpRight size={17} aria-hidden="true" />
          </a>
        </div>
        <nav className={s.footerExploreLinks} data-footer-explore="true" aria-label="Explore more">
          <a className={s.contactLink} href="/archive/"><span className={s.contactIcon}><ArchiveIcon size={18} aria-hidden="true" /></span><strong>Archive</strong><ArrowUpRight size={17} aria-hidden="true" /></a>
          <a className={s.contactLink} href="/life/"><span className={s.contactIcon}><Sparkles size={18} aria-hidden="true" /></span><strong>Life</strong><ArrowUpRight size={17} aria-hidden="true" /></a>
        </nav>
      </div>
    </div>
    <div className={s.footerBottom}>
      <a className={s.brand} href="/">Jumin Shin</a>
      <span className={s.copyright}>© {new Date().getFullYear()}</span>
    </div>
  </footer>
}
export function SectionHeading({ title, note, id }) {
  return <div className={s.sectionHeading} id={id}><h2>{title}</h2>{note && <span className={s.label}>{note}</span>}</div>
}
export function ProjectImage({ src, alt, eager = false, className = '', sizes = '(max-width: 700px) 100vw, (max-width: 1200px) 75vw, 1200px' }) {
  const basename = src?.split('/').pop().replace(/\.[^.]+$/, '')
  const record = imageManifest.images.find(image => image.variants[0].path === `/assets/optimized/${basename}.webp`)
  const variants = record?.variants.filter((variant, index, all) => all.findIndex(v => v.width === variant.width) === index)
  return <img className={className} src={record?.variants[0].path || src}
    width={record?.variants[0].width} height={record?.variants[0].height}
    srcSet={variants?.map(image => `${image.path} ${image.width}w`).join(', ')}
    sizes={sizes}
    alt={alt || ''} loading={eager ? 'eager' : 'lazy'} fetchpriority={eager ? 'high' : undefined} decoding="async" />
}

// The black-and-white editorial portrait, used on the homepage About and the About page.
export function EditorialPortrait({ eager = false }) {
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
      loading={eager ? 'eager' : 'lazy'}
      fetchpriority={eager ? 'high' : undefined}
      decoding="async"
    />
  </picture>
}
