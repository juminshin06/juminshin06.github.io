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
    const previous = groups.at(-1)
    if (previous?.label === label) previous.sectionIds.push(section.id)
    else groups.push({ id: section.id, label, sectionIds: [section.id] })
    return groups
  }, [])
}
