import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DESIGN_STAGE_IDS,
  buildDesignProcessNavigation,
  collectStageEvidence,
  validateDesignProcess,
} from '../src/portfolio/designProcess.js'
import { homepageProjects } from '../src/data/portfolio.js'

test('the stage contract uses the approved fixed order', () => {
  assert.deepEqual(DESIGN_STAGE_IDS, ['empathize', 'define', 'ideate', 'prototype', 'test'])
})

test('validation identifies incomplete and duplicate stage sequences', () => {
  const project = { slug: 'sample', designProcess: { problem: {}, stages: [
    { id: 'empathize' }, { id: 'define' }, { id: 'define' }, { id: 'prototype' },
  ], resolution: {} } }
  assert.deepEqual(validateDesignProcess(project), [
    'sample: expected empathize, define, ideate, prototype, test; received empathize, define, define, prototype',
    'sample: problem statement is required',
    'sample: resolution evidence is required',
  ])
})

test('stage evidence ignores unknown section ids and preserves image order', () => {
  const project = { content: [
    { type: 'image', sectionId: 'known', src: '/known.png' },
    { type: 'pdf', sectionId: 'known', src: '/file.pdf' },
  ] }
  assert.deepEqual(collectStageEvidence(project, { evidenceSectionIds: ['missing', 'known'] }), [
    { type: 'image', sectionId: 'known', src: '/known.png' },
  ])
})

test('navigation always contains five stages and resolution', () => {
  const stages = DESIGN_STAGE_IDS.map(id => ({ id, title: id }))
  assert.deepEqual(buildDesignProcessNavigation({ designProcess: { stages } }).map(item => item.id), [
    'empathize', 'define', 'ideate', 'prototype', 'test', 'resolution',
  ])
})

test('all twelve homepage projects have a complete design process', () => {
  assert.equal(homepageProjects.length, 12)
  for (const project of homepageProjects) {
    assert.deepEqual(validateDesignProcess(project), [], project.slug)
    assert.equal(project.designProcess.stages.length, 5, project.slug)
    assert.ok(project.processCue?.includes('→'), `${project.slug}: process cue`)
  }
})

test('process claims avoid unsupported research proof', () => {
  const narrative = JSON.stringify(homepageProjects.map(project => project.designProcess))
  for (const unsupported of [
    /\b\d+\s+(?:interviewees|participants|users)\b/i,
    /(?<!not )clinical(?:ly)? validated/i,
    /users (?:loved|preferred|praised)/i,
    /stakeholders? praised/i,
  ]) assert.doesNotMatch(narrative, unsupported)
})

test('every homepage evidence image is assigned to a design-process stage', () => {
  for (const project of homepageProjects) {
    const evidenceSectionIds = new Set(project.designProcess.stages.flatMap(stage => stage.evidenceSectionIds || []))
    const unassigned = (project.content || []).filter(block => (
      block.type === 'image' && (!block.sectionId || !evidenceSectionIds.has(block.sectionId))
    ))
    assert.deepEqual(unassigned.map(block => block.src), [], project.slug)
  }
})
