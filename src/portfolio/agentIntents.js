import { allProjects } from '../data/portfolio'
import profile from '../data/profile.json'

export const projectBySlug = slug => allProjects.find(project => project.slug === slug)

// The questions the hero plays as its demo and offers as chips. Each answer is written by the
// portfolio assistant (third person) from the knowledge base and the 2026 resume; the project
// rows come straight from the project data. Typed questions go to the chat instead.
export const intents = [
  {
    id: 'strengths',
    chip: 'Her strengths',
    prompt: 'What is Jumin’s biggest strength?',
    lead: 'Jumin’s strongest differentiator is working between design and technology: she brings UX research and interface design, and she can also prototype and build with front-end technologies, especially in AI, healthcare and emerging-tech work.',
    projects: ['bubbas-production', 'honda-spatial', 'ethicon-care'],
  },
  {
    id: 'ai',
    chip: 'AI work',
    prompt: 'What AI work has Jumin done?',
    lead: 'At Bubba’s LA, Jumin owned the UX/UI and front-end build of an AI rough-cut platform that grew from a 10-video prototype to 300+ videos per batch and went into production. She also designed an AI post-op assistant with Ethicon R&D and HAiLY, an AI agent for missed hospital charges.',
    projects: ['bubbas-production', 'ethicon-care', 'haily'],
  },
  {
    id: 'engineering',
    chip: 'Design engineering',
    prompt: 'Does Jumin build what she designs?',
    lead: 'Yes. Jumin designed and built Swim Up Hill’s website end to end, with six user journeys running live, and owned the front-end build of Bubba’s LA’s AI production platform. She works in JavaScript, React, HTML/CSS and Python.',
    projects: ['swim-up-hill', 'bubbas-production', 'honda-spatial'],
  },
  {
    id: 'health',
    chip: 'Healthcare UX',
    prompt: 'Which of her projects are in healthcare?',
    lead: 'Her healthcare work includes the UI/UX of an AI post-op assistant with Ethicon R&D (Johnson & Johnson MedTech), a campus emergency-allergy service for ARS Pharma, and HAiLY, which took 2nd place at USC & Techstars Startup Weekend.',
    projects: ['ethicon-care', 'ars-pharma', 'haily'],
    links: [{ href: `mailto:${profile.email}`, label: 'Email Jumin' }],
  },
]
