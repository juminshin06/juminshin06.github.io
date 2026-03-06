import { useState, useEffect } from 'react'
import GlobalCursor from './components/GlobalCursor'
import PixelBackground from './components/PixelBackground'
import NavBar from './components/NavBar'
import LandingSection from './components/LandingSection'
import AboutSection from './components/AboutSection'
import ProjectsSection from './components/ProjectsSection'
import ProjectPage from './components/ProjectPage'
import LifePage from './components/LifePage'
import Footer from './components/Footer'
import FloatingPDFButton from './components/FloatingPDFButton'
import rawProjects from './data/projects.json'

// Consistent sort: most recent first (matches ProjectsSection)
const sortedProjects = [...rawProjects].sort((a, b) => b.year - a.year)

export default function App() {
  const [currentProject, setCurrentProject] = useState(null)
  const [showLife, setShowLife]             = useState(false)

  useEffect(() => {
    const handler = (e) => {
      setCurrentProject(e.detail.id)
      setShowLife(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('open-project', handler)
    return () => window.removeEventListener('open-project', handler)
  }, [])

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

  // Prev / next within sorted project list
  const currentIndex = sortedProjects.findIndex(p => p.id === currentProject)

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentProject(sortedProjects[currentIndex - 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleNext = () => {
    if (currentIndex < sortedProjects.length - 1) {
      setCurrentProject(sortedProjects[currentIndex + 1].id)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  if (currentProject) {
    return (
      <>
        <GlobalCursor />
        <FloatingPDFButton />
        <NavBar onLifeClick={openLifePage} onProjectsClick={goToProjects} onAboutClick={goToAbout} />
        <ProjectPage
          projectId={currentProject}
          onBack={handleBack}
          onPrev={handlePrev}
          onNext={handleNext}
          hasPrev={currentIndex > 0}
          hasNext={currentIndex < sortedProjects.length - 1}
          prevTitle={currentIndex > 0 ? sortedProjects[currentIndex - 1].title : ''}
          nextTitle={currentIndex < sortedProjects.length - 1 ? sortedProjects[currentIndex + 1].title : ''}
        />
        <Footer />
      </>
    )
  }

  if (showLife) {
    return (
      <>
        <GlobalCursor />
        <FloatingPDFButton />
        <NavBar onLifeClick={openLifePage} onProjectsClick={goToProjects} onAboutClick={goToAbout} />
        <LifePage onBack={handleLifeBack} />
        <Footer />
      </>
    )
  }

  return (
    <>
      <PixelBackground />
      <GlobalCursor />
      <FloatingPDFButton />
      <NavBar onLifeClick={openLifePage} />
      <main>
        <LandingSection />
        <ProjectsSection />
        <AboutSection />
      </main>
      <Footer />
    </>
  )
}
