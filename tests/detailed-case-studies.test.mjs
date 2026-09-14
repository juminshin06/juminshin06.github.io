import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { renderToStaticMarkup } from 'react-dom/server'
import { createServer } from 'vite'
import { allProjects, resolvePage, routes } from '../src/data/portfolio.js'

test('Macromill Embrain remains experience only and is not a published project', () => {
  assert.ok(!allProjects.some(project => project.slug === 'embrain-research'))
  assert.ok(!routes.includes('/work/embrain-research/'))
  assert.equal(resolvePage('/work/embrain-research/').type, 'not-found')
})

test('case-study detail and flow blocks preserve semantic reading order', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { SectionDetails, SectionFlow } = await server.ssrLoadModule('/src/portfolio/CaseStudyBlocks.jsx')
    const details = renderToStaticMarkup(SectionDetails({ items: [
      { label: 'Constraint', body: 'CloudXR requires a Full Immersive Space.' },
      { label: 'Implication', body: 'Spatial Personas require a Shared Space.' },
    ] }))
    assert.match(details, /data-detail-list="true"/)
    assert.match(details, /<dt>Constraint<\/dt><dd>CloudXR requires/)

    const flow = renderToStaticMarkup(SectionFlow({ flow: {
      label: 'System flow',
      steps: [
        { label: 'Detect', detail: 'Find a pending encounter.' },
        { label: 'Validate', detail: 'Ask the physician for one decision.' },
      ],
      caption: 'Retrospective reconstruction.',
    } }))
    assert.match(flow, /data-section-flow="true"/)
    assert.match(flow, /<ol>/)
    assert.match(flow, /Retrospective reconstruction/)
  } finally {
    await server.close()
  }
})

test('Honda explains platform constraints, workarounds, presence experiments and team scope', () => {
  const project = allProjects.find(item => item.slug === 'honda-spatial')
  assert.equal(project.sections.length, 8)
  const narrative = JSON.stringify(project)
  for (const term of ['Full Immersive Space', 'Shared Space', 'SwiftUI', 'file watcher', 'PeekABoo', 'Muse Pen', 'Gaussian']) {
    assert.match(narrative, new RegExp(term, 'i'))
  }
  assert.match(project.contribution, /interface design|interface direction/i)
  assert.match(project.contribution, /team/i)
  const slides = project.content.filter(block => block.type === 'image')
  assert.equal(slides.length, 33)
  assert.deepEqual(slides.map(block => block.src), Array.from(
    { length: 33 },
    (_, index) => `/assets/projects/honda-deck-${String(index + 1).padStart(2, '0')}.jpg`,
  ))
  for (const block of slides) {
    assert.equal(block.presentation, 'slide')
    assert.ok(existsSync(new URL(`../public${block.src}`, import.meta.url)), block.src)
  }
})

test('HAiLY presents a privacy-safe missed-charge workflow without unsupported pilot claims', () => {
  const project = allProjects.find(item => item.slug === 'haily')
  assert.equal(project.sections.length, 7)
  const narrative = JSON.stringify(project)
  for (const term of ['missed charge', 'three to four', 'FHIR', 'HL7', 'physician', 'administrator', 'second place']) {
    assert.match(narrative, new RegExp(term, 'i'))
  }
  for (const restricted of ['Privileged and Confidential', '94%', 'demo password', '@gmail.com']) {
    assert.doesNotMatch(narrative, new RegExp(restricted, 'i'))
  }
  const slides = (project.content || []).filter(block => block.type === 'image')
  assert.equal(slides.length, 10)
  for (const block of slides) {
    assert.equal(block.presentation, 'slide')
    assert.match(block.src, /haily-slide-/)
    assert.ok(existsSync(new URL(`../public${block.src}`, import.meta.url)), block.src)
  }
  assert.match(project.outcome, /second place/i)
})

test('Blender case-study uses the original product and mascot renders from Drive', () => {
  for (const file of [
    'blender-mcp-v01.png',
    'blender-mcp-v02.png',
    'blender-mcp-v03.png',
    'blender-mcp-v04.png',
    'blender-mcp-mascot.png',
    'blender-mcp-mascot-variant.png',
  ]) {
    assert.ok(existsSync(new URL(`../public/assets/projects/${file}`, import.meta.url)), file)
  }
})

test('Studio.OS is replaced by a Blender MCP case study while its old URL remains reachable', () => {
  const project = allProjects.find(item => item.slug === 'ai-3d-product-visualization')
  assert.ok(project)
  assert.equal(project.sections.length, 5)
  assert.ok(routes.includes('/work/ai-3d-product-visualization/'))
  assert.ok(!routes.includes('/work/studio-os-audit/'))
  assert.equal(resolvePage('/work/studio-os-audit/').project.id, project.id)

  const narrative = JSON.stringify(project)
  for (const term of ['Blender MCP', 'product', 'lighting', 'mascot']) {
    assert.match(narrative, new RegExp(term, 'i'))
  }
  assert.doesNotMatch(narrative, /Studio\.OS|CupNoodle|120-frame|missing external label texture/i)
  assert.equal(project.content.filter(block => block.type === 'image').length, 6)
  for (const block of project.content) {
    assert.ok(existsSync(new URL(`../public${block.src}`, import.meta.url)), block.src)
  }
})

const editorialDetailedSlugs = [
  'bubbas-production',
  'honda-spatial',
  'ethicon-care',
  'story-authoring',
  'swim-up-hill',
  'ai-3d-product-visualization',
  'bubbas-daily-target',
  'pacepop',
  'haily',
  'ars-pharma',
]

test('the detailed projects have authored editorial narrative fields', () => {
  for (const slug of editorialDetailedSlugs) {
    const project = allProjects.find(item => item.slug === slug)
    assert.equal(project.caseStudyMode, 'detailed', slug)
    assert.ok(project.introLead?.length > 20, `${slug}: introLead`)
    assert.ok(project.introSupport?.length > 20, `${slug}: introSupport`)
    assert.ok(project.descriptors?.length >= 2 && project.descriptors.length <= 3, `${slug}: descriptors`)
    assert.ok(project.sections.every(section => section.phase), `${slug}: section phase`)
    assert.equal(project.sections[0]?.phase, 'Problem', `${slug}: first phase`)
    assert.ok(project.sections.some(section => ['Design response', 'Prototype'].includes(section.phase)), `${slug}: response`)
    assert.ok(project.sections.some(section => section.lead), `${slug}: mixed-weight lead`)
  }
})

test('PACEPOP frames temporary group coordination as a two-person design engineering project', () => {
  const project = allProjects.find(item => item.slug === 'pacepop')
  assert.ok(project)
  assert.equal(project.team, 'Two-person team')
  for (const responsibility of ['Product strategy', 'UX research', 'Product design', 'Prototyping', 'Front-end development']) {
    assert.match(project.role, new RegExp(responsibility, 'i'))
  }
  assert.equal(project.sections[0]?.phase, 'Problem')
  assert.equal(project.image, '/assets/projects/pacepop-cover-v2.png')
  assert.equal(project.cover?.primary, '/assets/projects/pacepop-cover-v2.png')

  const narrative = JSON.stringify(project)
  for (const idea of ['permanent group chat', 'contact information', 'QR', 'temporary', 'retention', 'Host', 'Runner']) {
    assert.match(narrative, new RegExp(idea, 'i'))
  }
  assert.doesNotMatch(narrative, /localhost|127\.0\.0\.1/i)

  const evidence = project.content.filter(block => block.type === 'image')
  assert.deepEqual(evidence.map(block => block.src), [
    '/assets/projects/pacepop-start.png',
    '/assets/projects/pacepop-scan.png',
    '/assets/projects/pacepop-join.png',
    '/assets/projects/pacepop-access.png',
    '/assets/projects/pacepop-runner-live.png',
    '/assets/projects/pacepop-host-setup.png',
    '/assets/projects/pacepop-host-lobby.png',
    '/assets/projects/pacepop-water-rest.png',
    '/assets/projects/pacepop-runner-detail.png',
    '/assets/projects/pacepop-help.png',
    '/assets/projects/pacepop-give-up.png',
    '/assets/projects/pacepop-chat.png',
    '/assets/projects/pacepop-kudo.png',
    '/assets/projects/pacepop-finish.png',
    '/assets/projects/pacepop-team-result.png',
    '/assets/projects/pacepop-host-alerts.png',
    '/assets/projects/pacepop-host-roster.png',
    '/assets/projects/pacepop-host-simulator.png',
  ])
  assert.doesNotMatch(narrative, /pacepop-(?:host-live|retention)/i)
  for (const section of project.sections) {
    const sectionEvidence = evidence.filter(block => block.sectionId === section.id)
    assert.ok(sectionEvidence.length >= 2, `${section.id} needs multiple screens`)
  }
  for (const block of evidence) {
    assert.equal(block.presentation, 'phone')
    assert.ok(existsSync(new URL(`../public${block.src}`, import.meta.url)), block.src)
  }
})

test('authored section leads do not duplicate the supporting body', () => {
  for (const slug of editorialDetailedSlugs) {
    const project = allProjects.find(item => item.slug === slug)
    for (const section of project.sections.filter(item => item.lead)) {
      assert.equal(section.body.startsWith(section.lead), false, `${slug}/${section.id}`)
    }
  }
})
