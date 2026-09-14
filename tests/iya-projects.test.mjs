import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import { allProjects, resolvePage } from '../src/data/portfolio.js'

const expectedAssets = {
  'ars-pharma': ['ars-package', 'ars-research', 'ars-location-ui', 'ars-brand-system'],
  'honda-spatial': Array.from(
    { length: 33 },
    (_, index) => `honda-deck-${String(index + 1).padStart(2, '0')}`,
  ),
  'ethicon-care': [
    'jj-medtech',
    'jj-training-decision',
    'jj-keyword-assessment',
    'jj-feedback-loop',
    'jj-review-assessments',
  ],
}

function assertProjectAssets(project) {
  const paths = [project.image, ...project.content.map(item => item.src)]
  const names = new Set(paths.map(path => path.match(/([^/]+)\.(?:png|jpe?g)$/i)?.[1]))
  assert.deepEqual(names, new Set(expectedAssets[project.slug]))

  const manifest = JSON.parse(readFileSync(new URL('../public/assets/optimized/manifest.json', import.meta.url)))
  const sources = new Set(manifest.images.map(image => image.source))
  for (const name of expectedAssets[project.slug]) {
    assert.ok(
      [...sources].some(source => new RegExp(`public/assets/projects/${name}\\.(?:png|jpe?g)$`, 'i').test(source)),
      `Missing optimized source for ${name}`,
    )
  }
}

test('the ARS Pharma service system is a complete case study discoverable from home', async () => {
  const project = allProjects.find(item => item.slug === 'ars-pharma')
  assert.ok(project)
  assert.equal(resolvePage('/work/ars-pharma/').project.id, project.id)
  assert.ok(project.sections.length >= 4)
  assert.ok(project.content.length >= 3)
  assert.match(project.outcome, /proposal|concept/i)
  assertProjectAssets(project)

  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    assert.match(render('/'), /href="\/work\/ars-pharma\/"/)
    assert.match(render('/work/ars-pharma/'), /one-handed|single thumb/i)
  } finally { await server.close() }
})

test('the existing Honda case incorporates Omniverse interaction research without duplication', () => {
  const hondaProjects = allProjects.filter(item => item.id === 'honda-spatial' || /American Honda/i.test(item.organization))
  assert.equal(hondaProjects.length, 1)
  const [project] = hondaProjects
  assert.ok(project.sections.some(section => /Omniverse/i.test(`${section.title} ${section.body}`)))
  assert.ok(project.sections.some(section => /constraint|conflict|limitation/i.test(`${section.title} ${section.body}`)))
  assert.ok(project.content.length >= 3)
  assert.match(project.outcome, /Honda R&D/i)
  assertProjectAssets(project)
})

test('the existing J&J case documents the clinician assessment workflow without duplication', async () => {
  const projects = allProjects.filter(item => item.id === 'ethicon-care' || /Johnson & Johnson MedTech/i.test(item.organization))
  assert.equal(projects.length, 1)

  const [project] = projects
  assert.equal(resolvePage('/work/ethicon-care/').project.id, project.id)
  assert.ok(project.sections.length >= 4)
  assert.equal(project.content.length, 4)
  assert.ok(project.sections.some(section => /DISH|keyword/i.test(`${section.title} ${section.body}`)))
  assert.ok(project.sections.some(section => /feedback|rationale/i.test(`${section.title} ${section.body}`)))
  assert.ok(project.sections.some(section => /review/i.test(`${section.title} ${section.body}`)))
  assert.match(project.outcome, /prototype/i)
  assert.match(project.outcome, /not.*clinically validated|not.*deployed/i)
  assert.ok(project.resources.some(resource => /figma\.com\/design\/8d3knnB1fjp0VTysWr4ATz/.test(resource.href)))
  assert.match(project.source, /Figma/i)
  assertProjectAssets(project)

  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/work/ethicon-care/')
    assert.match(html, /Wound Assessment Training/)
    assert.match(html, /Review All Assessments/)
    assert.match(html, /View Figma source/)
  } finally { await server.close() }
})

test('four homepage practice projects keep a balanced two-column tablet layout', () => {
  const css = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
  assert.doesNotMatch(css, /\.practiceGrid\s*>\s*article:first-child\s*{[^}]*grid-column:\s*1\s*\/\s*-1/)
})
