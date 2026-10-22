import { useEffect, useRef } from 'react'
import { ArrowDown } from 'lucide-react'
import { homepageProjects } from '../data/portfolio'
import AgentHero from './AgentHero'
import { setGuide } from './guide'
import IntroBackdrop from './IntroBackdrop'
import { ProjectImage } from './Shell'
import s from './Portfolio.module.css'

// Four lead covers float around the edges, each with a small organization tag.
const floating = homepageProjects.slice(0, 4)
const shortTag = organization => organization.split(/ \/ |, /)[0]
// A brighter, more legible picture for cards whose cover reads poorly at this small size.
const cardImage = { 'honda-spatial': '/assets/projects/honda-spatial-ui.png' }

// Each card can be picked up and dropped anywhere in the intro; the one in hand comes to the
// front. A click that never moved still opens the project.
let topLayer = 1
function FloatingCard({ project, index }) {
  const cardRef = useRef(null)
  const drag = useRef(null)
  const offset = useRef({ x: 0, y: 0 })

  const onPointerDown = event => {
    if (event.button !== 0) return
    const card = cardRef.current
    drag.current = { startX: event.clientX, startY: event.clientY, baseX: offset.current.x, baseY: offset.current.y, moved: false }
    try { card.setPointerCapture(event.pointerId) } catch { /* pointer already gone */ }
    topLayer += 1
    card.style.zIndex = String(topLayer)
  }
  const onPointerMove = event => {
    const state = drag.current
    if (!state) return
    const dx = event.clientX - state.startX
    const dy = event.clientY - state.startY
    if (!state.moved && Math.hypot(dx, dy) < 4) return
    state.moved = true
    cardRef.current.dataset.dragging = 'true'
    offset.current = { x: state.baseX + dx, y: state.baseY + dy }
    cardRef.current.style.transform = `translate(${offset.current.x}px, ${offset.current.y}px)`
  }
  const onPointerUp = event => {
    const card = cardRef.current
    if (card.hasPointerCapture?.(event.pointerId)) card.releasePointerCapture(event.pointerId)
    delete card.dataset.dragging
    // Keep the moved flag until the click that follows this release has been handled.
    window.setTimeout(() => { drag.current = null }, 0)
  }
  const onClick = event => { if (drag.current?.moved) event.preventDefault() }

  return <a
    ref={cardRef}
    href={`/work/${project.slug}/`}
    tabIndex={-1}
    draggable={false}
    className={s.introCard}
    data-intro-card={index}
    data-cursor="Drag"
    onPointerDown={onPointerDown}
    onPointerMove={onPointerMove}
    onPointerUp={onPointerUp}
    onPointerCancel={onPointerUp}
    onClick={onClick}
    onDragStart={event => event.preventDefault()}
  >
    <span className={s.introCardImage}><ProjectImage src={cardImage[project.slug] || project.cover?.primary || project.image} alt="" sizes="220px" /></span>
    <span className={s.introCardTag}>{shortTag(project.organization)}</span>
  </a>
}

// The first screen: who this is, an AI prompt that answers from the portfolio, and two quiet
// ways in. Everything else waits below.
export default function IntroScreen({ onRecruiter, recruiterRef }) {
  const sectionRef = useRef(null)

  // The guide follows the prompt field itself, not the whole hero, so a long answer can't hide the
  // way in. Two thresholds give it hysteresis: it counts as visible once 70% shows and as gone
  // only below 20%, so scrolling at the edge never makes the NPC and the chat button flicker.
  useEffect(() => {
    const prompt = sectionRef.current?.querySelector('[data-agent-hero] form')
    if (!prompt || !window.IntersectionObserver) return
    // Decide right away from where the prompt sits, so the corner button never flashes on load.
    const box = prompt.getBoundingClientRect()
    const shown = Math.min(box.bottom, window.innerHeight) - Math.max(box.top, 72)
    setGuide({ promptVisible: shown / box.height >= 0.7 })
    const observer = new IntersectionObserver(([entry]) => {
      const ratio = entry.isIntersecting ? entry.intersectionRatio : 0
      if (ratio >= 0.7) setGuide({ promptVisible: true })
      else if (ratio <= 0.2) setGuide({ promptVisible: false })
    }, { threshold: [0, 0.2, 0.7, 1], rootMargin: '-72px 0px 0px 0px' })
    observer.observe(prompt)
    return () => { observer.disconnect(); setGuide({ promptVisible: false }) }
  }, [])

  return <section ref={sectionRef} className={s.intro} aria-labelledby="intro-heading" data-intro="true">
    <IntroBackdrop />
    <div className={s.introCards} aria-hidden="true">
      {floating.map((project, index) => <FloatingCard key={project.slug} project={project} index={index} />)}
    </div>

    <div className={s.introContent}>
      <div className={s.heroIdentity}>
        <h1 id="intro-heading">Jumin Shin</h1>
        <p className={s.introRole}>UX Design Engineer</p>
      </div>
      <p className={s.introStatement}>I turn research into working interfaces across AI, spatial computing and digital products.</p>
      <div className={s.introAgent}>
        <AgentHero />
      </div>
      <p className={s.introLinks}>
        <a href="#work">View my work<ArrowDown size={14} aria-hidden="true" /></a>
        <span aria-hidden="true">·</span>
        <button ref={recruiterRef} type="button" onClick={onRecruiter} data-recruiter-entry="true">60 sec recruiter view</button>
      </p>
    </div>

  </section>
}
