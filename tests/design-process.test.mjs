import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DESIGN_STAGE_IDS,
  buildDesignProcessNavigation,
  collectStageEvidence,
  validateDesignProcess,
} from '../src/portfolio/designProcess.js'

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
