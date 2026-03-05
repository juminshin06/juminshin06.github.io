import { useState, useEffect } from 'react'
import GlobalCursor from './components/GlobalCursor'
import NavBar from './components/NavBar'
import LandingSection from './components/LandingSection'
import AboutSection from './components/AboutSection'
import ProjectsSection from './components/ProjectsSection'
import ProjectPage from './components/ProjectPage'
import LifePage from './components/LifePage'
import Footer from './components/Footer'
import CardDeck from './components/CardDeck'

export default function App() {
  const [currentProject, setCurrentProject] = useState(null)
  const [showLife, setShowLife]             = useState(false)

  // Listen for open-project events from ProjectsSection rows and CardDeck
  useEffect(() => {
    const handler = (e) => {
      setCurrentProject(e.detail.id)
      setShowLife(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('open-project', handler)
    return () => window.removeEventListener('open-project', handler)
  }, [])

  // ── Navigation helpers ───────────────────────────
  const openLifePage = () => {
    setShowLife(true)
    setCurrentProject(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const goToProjects = () => {
    setShowLife(false)
    setCurrentProject(null)
    setTimeout(() => {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  const goToAbout = () => {
    setShowLife(false)
    setCurrentProject(null)
    setTimeout(() => {
      document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  const handleBack = () => {
    setCurrentProject(null)
    setTimeout(() => {
      document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' })
    }, 50)
  }

  const handleLifeBack = () => {
    setShowLife(false)
    window.scrollTo({ top: 0 })
  }

  // ── Project detail page ──────────────────────────
  if (currentProject) {
    return (
      <>
        <GlobalCursor />
        <NavBar
          onLifeClick={openLifePage}
          onProjectsClick={goToProjects}
          onAboutClick={goToAbout}
        />
        <ProjectPage projectId={currentProject} onBack={handleBack} />
        <Footer />
      </>
    )
  }

  // ── Life page ────────────────────────────────────
  if (showLife) {
    return (
      <>
        <GlobalCursor />
        <NavBar
          onLifeClick={openLifePage}
          onProjectsClick={goToProjects}
          onAboutClick={goToAbout}
        />
        <LifePage onBack={handleLifeBack} />
        <Footer />
      </>
    )
  }

  // ── Main portfolio ───────────────────────────────
  return (
    <>
      <GlobalCursor />
      <NavBar onLifeClick={openLifePage} />
      <main>
        <LandingSection />
        <ProjectsSection />
        <AboutSection />
      </main>
      <Footer />
      <CardDeck />
    </>
  )
}
