// Hiring views: role-based prioritization and the recruiter summary of each project.
// Everything here is derived from the existing project data; nothing is written per project,
// so a new project is ranked and summarized as soon as it has its usual fields.

export const ROLES = [
  { id: 'all', label: 'All' },
  { id: 'ux', label: 'UX Design' },
  { id: 'ai', label: 'AI / HCI' },
  { id: 'design-engineering', label: 'Design Engineering' },
  { id: 'frontend', label: 'Front-end' },
]
const roleIds = new Set(ROLES.map(role => role.id))
export const roleLabel = id => ROLES.find(role => role.id === id)?.label || 'All'

// What each role looks for in a project. A match in the project's tags (category, descriptors,
// role) counts three times a match in its prose (summary, contribution, outcome).
const signals = {
  ux: [/\bUX\b/i, /user research/i, /usability/i, /interaction design/i, /interaction/i, /service design/i, /product design/i, /\binterviews?\b/i, /\bUI\b/, /interface states?/i, /research/i],
  ai: [/\bAI\b/, /human-ai/i, /\bLLMs?\b/, /\bagent(ic|s)?\b/i, /generative/i, /language model/i, /automat/i, /\bMCP\b/],
  'design-engineering': [/prototyp/i, /implement/i, /front-?end/i, /\bbuilt\b|\bbuild\b/i, /\bHTML\b|\bReact\b|\bJavaScript\b/, /\bUnity\b|visionOS|Omniverse/, /\bMCP\b|\bBlender\b/, /interactive/i, /working (mobile )?(prototype|dashboard)/i, /dashboard/i, /\bscal(ed|ing)\b|adopted/i],
  frontend: [/front-?end/i, /\bHTML\b|\bReact\b|\bJavaScript\b|\bCSS\b/, /website/i, /responsive/i, /publish/i, /\bweb\b/i, /implementation/i],
}

const tagText = project => [project.category, ...(project.descriptors || []), project.role].filter(Boolean).join(' | ')
const proseText = project => [project.summary, project.contribution, project.outcome, project.introLead].filter(Boolean).join(' | ')

export function roleScore(project, role) {
  const patterns = signals[role]
  if (!patterns) return 0
  const tags = tagText(project)
  const prose = proseText(project)
  return patterns.reduce((total, pattern) => total + (pattern.test(tags) ? 3 : 0) + (pattern.test(prose) ? 1 : 0), 0)
}

// Most relevant first; ties keep the curated order. "All" is the curated order untouched.
export function rankForRole(projects, role) {
  if (!signals[role]) return projects
  return projects
    .map((project, index) => ({ project, index, score: roleScore(project, role) }))
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .map(entry => entry.project)
}

const sentences = text => (text || '').replace(/\s+/g, ' ').trim().split(/(?<=[.!?])\s+(?=[A-Z])/).filter(Boolean)
const firstSentence = text => sentences(text)[0] || ''

// From a project's own contribution, the sentence that speaks most to the chosen role.
function contributionFor(project, role) {
  const own = sentences(project.contribution).filter(sentence => !/^My role:|^A collaborative project/.test(sentence))
  if (!own.length) return firstSentence(project.summary)
  const patterns = signals[role]
  if (!patterns) return own[0]
  return own
    .map((sentence, index) => ({ sentence, index, score: patterns.filter(pattern => pattern.test(sentence)).length }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0].sentence
}

// Tools are listed only when the project's own text names them.
const toolMentions = [
  ['Figma', /\bFigma\b/i], ['React', /\bReact\b/], ['JavaScript', /\bJavaScript\b/i], ['HTML/CSS', /\bHTML\b/],
  ['Python', /\bPython\b/], ['Unity', /\bUnity\b/], ['Unreal Engine', /\bUnreal\b/], ['Blender', /\bBlender\b/],
  ['visionOS', /\bvisionOS\b/], ['Omniverse', /\bOmniverse\b/], ['MCP', /\bMCP\b/], ['Miro', /\bMiro\b/],
]

export function projectSkills(project) {
  const text = JSON.stringify([project.summary, project.contribution, project.outcome, project.sections, project.content, project.designProcess])
  const tools = toolMentions.filter(([, pattern]) => pattern.test(text)).map(([name]) => name)
  return [...new Set([...(project.descriptors || []), ...tools])].filter(skill => !/industry collaboration/i.test(skill)).slice(0, 6)
}

export function recruiterSummary(project, role = 'all') {
  const problem = firstSentence(project.designProcess?.problem?.friction) || firstSentence(project.introLead)
  const outcome = firstSentence(project.outcome)
  return {
    slug: project.slug,
    title: project.title,
    href: `/work/${project.slug}/`,
    organization: project.organization,
    year: project.year,
    image: project.cover?.primary || project.image,
    role: project.role,
    problem,
    contribution: contributionFor(project, role),
    outcome,
    skills: projectSkills(project),
  }
}

// URL state: ?role=ux&mode=recruiter. Unknown values fall back to the default view.
export function parseHiringView(search) {
  const params = new URLSearchParams(search)
  const role = params.get('role')
  return { role: roleIds.has(role) ? role : 'all', recruiter: params.get('mode') === 'recruiter' }
}

export function hiringSearch(search, { role, recruiter }) {
  const params = new URLSearchParams(search)
  if (role && role !== 'all') params.set('role', role)
  else params.delete('role')
  if (recruiter) params.set('mode', 'recruiter')
  else params.delete('mode')
  const query = params.toString()
  return query ? `?${query}` : ''
}
