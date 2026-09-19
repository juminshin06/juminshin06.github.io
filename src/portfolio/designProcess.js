export const DESIGN_STAGE_IDS = ['empathize', 'define', 'ideate', 'prototype', 'test']

export const DESIGN_STAGE_LABELS = {
  empathize: 'Empathize',
  define: 'Define',
  ideate: 'Ideate',
  prototype: 'Prototype',
  test: 'Test',
}

export const getDesignProcess = project => project.designProcess || null

export function validateDesignProcess(project) {
  const process = getDesignProcess(project)
  if (!process) return [`${project.slug}: designProcess is required`]

  const received = (process.stages || []).map(stage => stage.id)
  const errors = []
  if (received.join(',') !== DESIGN_STAGE_IDS.join(',')) {
    errors.push(`${project.slug}: expected ${DESIGN_STAGE_IDS.join(', ')}; received ${received.join(', ')}`)
  }
  if (!process.problem?.statement) errors.push(`${project.slug}: problem statement is required`)
  if (!process.resolution?.evidence) errors.push(`${project.slug}: resolution evidence is required`)
  return errors
}

export const buildDesignProcessNavigation = project => [
  ...(project.designProcess?.stages || []).map(stage => ({
    id: stage.id,
    label: DESIGN_STAGE_LABELS[stage.id],
  })),
  { id: 'resolution', label: 'Resolution' },
]

export const collectStageEvidence = (project, stage) => {
  const ids = new Set(stage.evidenceSectionIds || [])
  return (project.content || []).filter(block => block.type === 'image' && ids.has(block.sectionId))
}
