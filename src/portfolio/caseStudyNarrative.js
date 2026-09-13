export const getCaseStudyMode = project => project.caseStudyMode === 'detailed' ? 'detailed' : 'concise'

export const getProjectFacts = project => [
  ['Role', project.role],
  ['Timeline', project.duration],
  ['Outcome', project.status],
  ['Team', project.team],
].filter(([, value]) => Boolean(value)).map(([label, value]) => ({ label, value }))

export const getSectionPhase = (section, mode) => section.phase || (mode === 'detailed' ? 'Process' : 'Project overview')

export function buildPhaseNavigation(sections = [], mode = 'concise') {
  if (mode !== 'detailed') return []
  return sections.reduce((groups, section) => {
    const label = getSectionPhase(section, mode)
    if (label === 'Outcome') return groups
    const existing = groups.find(group => group.label === label)
    if (existing) existing.sectionIds.push(section.id)
    else groups.push({ id: section.id, label, sectionIds: [section.id] })
    return groups
  }, [])
}

export function findActiveSectionId(sectionPositions = [], viewportHeight = 0) {
  const readingLine = Math.max(260, viewportHeight * 0.34)
  let current = sectionPositions[0]?.id
  for (const section of sectionPositions) {
    if (section.top <= readingLine) current = section.id
  }
  return current
}

export function getHashSectionId(hash = '') {
  if (!hash.startsWith('#')) return ''
  try {
    return decodeURIComponent(hash.slice(1))
  } catch {
    return ''
  }
}
