import { allProjects } from '../data/portfolio'
import profile from '../data/profile.json'

export const resumeUrl = '/assets/JuminShin_Resume.pdf'
export const projectBySlug = slug => allProjects.find(project => project.slug === slug)

// Questions the site can answer on its own, from its own data. The hero plays them as a demo
// and the chat falls back to them when the hosted model is unreachable.
export const intents = [
  {
    id: 'ai',
    chip: 'AI production tools',
    prompt: 'How did Jumin design AI tools for a production team?',
    keywords: ['ai', 'production', 'video', 'editor', 'workflow', 'automation', 'agent', 'tool', 'bubba', 'llm'],
    lead: 'At Bubba’s LA I designed AI-assisted tools around how the team actually works: an editor workspace that unified scattered video-prep tasks, and a daily decision dashboard for business development.',
    projects: ['bubbas-production', 'bubbas-daily-target'],
  },
  {
    id: 'spatial',
    chip: 'Spatial computing',
    prompt: 'Show me her spatial computing work',
    keywords: ['spatial', 'honda', '3d', 'vr', 'xr', 'ar', 'vision', 'omniverse', 'blender', 'headset', 'immersive'],
    lead: 'Spatial work includes a design-review sprint with American Honda that turned NVIDIA Omniverse and visionOS constraints into testable annotation flows, plus AI-assisted 3D production with Blender MCP.',
    projects: ['honda-spatial', 'ai-3d-product-visualization'],
  },
  {
    id: 'health',
    chip: 'Healthcare UX',
    prompt: 'Which projects are in healthcare?',
    keywords: ['health', 'care', 'medical', 'clinic', 'wound', 'ethicon', 'pharma', 'patient', 'anaphylaxis', 'hospital', 'physician', 'j&j', 'medtech'],
    lead: 'Healthcare projects pair clinical workflows with one clear decision: a wound-assessment prototype with Ethicon R&D, a campus anaphylaxis response system for ARS Pharma, and HAiLY for missed hospital charges.',
    projects: ['ethicon-care', 'ars-pharma', 'haily'],
  },
  {
    id: 'research',
    chip: 'Research to prototype',
    prompt: 'How does research turn into a prototype?',
    keywords: ['research', 'user', 'interview', 'study', 'prototype', 'publication', 'paper', 'hci', 'academic', 'samsung', 'hongik', 'accessib'],
    lead: 'Research runs through my work: a published prototype for human-AI storytelling, podcast research with Samsung for job seekers, and an accessible music interface for children with hearing impairments.',
    projects: ['story-authoring', 'samsung-podcast', 'sing-in-sign'],
  },
  {
    id: 'web',
    chip: 'Shipped front-end',
    prompt: 'Does she ship front-end code?',
    keywords: ['web', 'site', 'website', 'front', 'react', 'code', 'ship', 'launch', 'engineer', 'build', 'develop', 'live'],
    lead: 'Yes. I lead and build front-end work: Swim Up Hill is a live nonprofit website I led end to end, and PACEPOP’s prototype includes the front-end implementation.',
    projects: ['swim-up-hill', 'pacepop'],
  },
  {
    id: 'about',
    chip: 'About me',
    prompt: 'Who is Jumin Shin?',
    keywords: ['who', 'about', 'background', 'education', 'usc', 'resume', 'contact', 'email', 'hire', 'experience', 'bio', 'jumin'],
    lead: profile.bio[0],
    projects: [],
    links: [
      { href: '/about/', label: 'Experience and background' },
      { href: resumeUrl, label: 'Resume (PDF)', external: true },
      { href: `mailto:${profile.email}`, label: 'Email me' },
    ],
  },
]

export const fallbackIntent = {
  id: 'fallback',
  lead: 'I could not match that exactly, so here are the four lead projects. For anything else, email me.',
  projects: ['bubbas-production', 'pacepop', 'honda-spatial', 'ethicon-care'],
  links: [{ href: `mailto:${profile.email}`, label: 'Email me' }],
}

export function matchIntent(query) {
  const text = query.toLowerCase()
  let best = null
  let bestScore = 0
  for (const intent of intents) {
    const score = intent.keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0)
    if (score > bestScore) { best = intent; bestScore = score }
  }
  return best || fallbackIntent
}

// The same answer as Markdown, for the chat's offline fallback.
export function localAnswer(query) {
  const intent = matchIntent(query)
  const projects = intent.projects.map(projectBySlug).filter(Boolean)
  const lines = [intent.lead]
  if (projects.length) lines.push('', ...projects.map(project => `- [${project.title}](/work/${project.slug}/) — ${project.organization}, ${project.year}`))
  if (intent.links) lines.push('', ...intent.links.map(link => `- [${link.label}](${link.href})`))
  return lines.join('\n')
}

// Follow-ups the chat offers; the pool rotates so the same three never repeat back to back.
export const suggestedQuestions = [
  'What kind of designer are you?',
  'Which project are you most proud of?',
  'How do you use AI in your design process?',
  'What did you do at Bubba’s LA?',
  'Tell me about the Honda spatial project',
  'Have you shipped production code?',
  'What research have you published?',
  'What are you looking for next?',
  'How can I get in touch?',
  '한국어로도 답해줄 수 있어?',
]
