import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildPhaseNavigation,
  getCaseStudyMode,
  getProjectFacts,
  getSectionPhase,
} from '../src/portfolio/caseStudyNarrative.js'

test('narrative model distinguishes detailed and concise projects', () => {
  assert.equal(getCaseStudyMode({ caseStudyMode: 'detailed' }), 'detailed')
  assert.equal(getCaseStudyMode({ caseStudyMode: 'concise' }), 'concise')
  assert.equal(getCaseStudyMode({}), 'concise')
})

test('project facts use the approved editorial order and skip empty values', () => {
  assert.deepEqual(getProjectFacts({
    role: 'UI lead', duration: 'Feb - May 2026', status: 'Prototype', team: '',
  }), [
    { label: 'Role', value: 'UI lead' },
    { label: 'Timeline', value: 'Feb - May 2026' },
    { label: 'Outcome', value: 'Prototype' },
  ])
})

test('section phases are explicit for detailed work and safe for concise work', () => {
  assert.equal(getSectionPhase({ phase: 'Problem' }, 'detailed'), 'Problem')
  assert.equal(getSectionPhase({ title: 'Context' }, 'detailed'), 'Process')
  assert.equal(getSectionPhase({ title: 'Context' }, 'concise'), 'Project overview')
})

test('phase navigation groups contiguous sections with the same phase', () => {
  assert.deepEqual(buildPhaseNavigation([
    { id: 'context', phase: 'Context' },
    { id: 'gap-one', phase: 'Problem' },
    { id: 'gap-two', phase: 'Problem' },
    { id: 'response', phase: 'Design response' },
  ], 'detailed'), [
    { id: 'context', label: 'Context', sectionIds: ['context'] },
    { id: 'gap-one', label: 'Problem', sectionIds: ['gap-one', 'gap-two'] },
    { id: 'response', label: 'Design response', sectionIds: ['response'] },
  ])
  assert.deepEqual(buildPhaseNavigation([{ id: 'context', title: 'Context' }], 'concise'), [])
})
