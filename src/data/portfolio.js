import legacy from './projects.json' with { type: 'json' }
import editorial from './editorial.json' with { type: 'json' }
import internships from './internships.json' with { type: 'json' }

export const categoryLabels = { All: 'All', 'Human-AI': 'AI & UX', Research: 'UX research', Spatial: 'Spatial UX', Product: 'Product design', Experiment: 'Prototyping' }

export const featuredProjects = editorial.featured.map(project => ({
  ...project,
  content: project.content || legacy.find(item => item.id === project.id)?.content.filter(block => block.type === 'image') || [],
}))
const featuredIds = new Set(featuredProjects.map(project => project.id))
const archived = legacy.filter(project => !featuredIds.has(project.id)).map(project => {
  const edit = editorial.archiveOverrides[project.id]
  return {
    ...project, ...edit,
    image: project.thumbnail,
    imageAlt: `${edit.title}: original project artifact`,
    art: 'image',
    caseStudyMode: 'concise',
    contribution: `My role: ${project.role}. ${project.team === 'Solo' ? 'An independent project.' : 'A collaborative project.'}`,
    outcome: edit.status,
    sections: [{ id: 'context', phase: 'Project overview', title: 'The project in context', body: edit.summary }],
    facts: [], resources: [],
    content: project.content.filter(block => ['image', 'pdf', 'iframe'].includes(block.type)),
  }
})
export const practiceProjects = [...internships, ...editorial.additional.filter(project => project.slug === 'ars-pharma')]
export const projectPriority = [
  'bubbas-production',
  'pacepop',
  'honda-spatial',
  'ethicon-care',
  'swim-up-hill',
  'haily',
  'ars-pharma',
  'story-authoring',
  'bubbas-daily-target',
  'ai-3d-product-visualization',
  'handsign',
  'samsung-podcast',
  'wood-chip',
  'newegg',
  'ai-native-mvp',
  'sing-in-sign',
  'fairads',
  'b4q4-widgets',
  'lemonlight',
  'clozumin',
  'ev-charging-security',
  'learning-mobility',
  'cookids',
]
const projectRank = new Map(projectPriority.map((slug, index) => [slug, index]))
const unorderedProjects = [...featuredProjects, ...internships, ...editorial.additional, ...archived]
export const allProjects = [...unorderedProjects].sort((a, b) => (
  (projectRank.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (projectRank.get(b.slug) ?? Number.MAX_SAFE_INTEGER)
))
export const researchProjects = allProjects.filter(project => ['story-authoring', 'sing-in-sign', 'samsung-podcast'].includes(project.slug))
export const legacyProjectAliases = {
  '/work/studio-os-audit/': 'ai-3d-product-visualization',
}
export const normalizePath = path => {
  const clean = path.split(/[?#]/)[0].replace(/\/index\.html$/, '/').replace(/\/+$/, '')
  return clean ? `${clean}/` : '/'
}
export const routes = ['/', '/research/', '/about/', '/archive/', '/life/', ...allProjects.map(p => `/work/${p.slug}/`)]
export const legacyRoutes = Object.keys(legacyProjectAliases)
export function resolvePage(path) {
  const normalized = normalizePath(path)
  const pages = { '/': 'home', '/research/': 'research', '/about/': 'about', '/archive/': 'archive', '/life/': 'life' }
  if (pages[normalized]) return { type: pages[normalized] }
  const canonicalSlug = legacyProjectAliases[normalized]
  const project = allProjects.find(p => canonicalSlug ? p.slug === canonicalSlug : `/work/${p.slug}/` === normalized)
  return project ? { type: 'project', project } : { type: 'not-found' }
}
export function pageMetadata(path) {
  const page = resolvePage(path)
  const descriptions = {
    home: 'Jumin Shin is a UX Design Engineer connecting user research, interaction design, prototyping and front-end implementation across AI, spatial computing and digital products.',
    research: 'UX research on human-AI collaboration, accessible experiences and product design. Publications at ICIDS, KIISE, KSDS and HCI Korea.',
    about: 'User research, UX/UI design and technical prototyping. Jumin Shin\'s experience, education, capabilities and resume.',
    archive: 'Explore Jumin Shin\'s UX/UI case studies, user research, spatial experiences, product design and interactive prototypes.',
    life: 'Community, workshops and moments outside the studio, collected by Jumin Shin.',
    'not-found': 'This page could not be found. Explore Jumin Shin\'s case studies and research.',
  }
  const names = { home: 'UX Design Engineer', research: 'UX Research', about: 'About', archive: 'Work archive', life: 'Life', 'not-found': 'Page not found' }
  const thumbnail = /\.(png|jpe?g)$/i.test(page.project?.image || '')
    ? page.project.image.split('/').pop().replace(/\.[^.]+$/, '')
    : undefined
  return {
    title: `${page.project?.title || names[page.type]} | Jumin Shin`,
    description: page.project?.summary || descriptions[page.type],
    path: page.type === 'not-found' ? '/404.html' : page.type === 'project' ? `/work/${page.project.slug}/` : normalizePath(path),
    image: `/assets/optimized/${thumbnail || (page.type === 'home' ? 'jj-medtech' : 'profile')}.webp`,
    notFound: page.type === 'not-found',
  }
}
