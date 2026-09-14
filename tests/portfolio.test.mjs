import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'
import { allProjects, featuredProjects, normalizePath, resolvePage, routes, pageMetadata } from '../src/data/portfolio.js'
import { getCaseStudyMode, getSectionPhase } from '../src/portfolio/caseStudyNarrative.js'

const approvedProjectOrder = [
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

test('projects follow the approved UX Design Engineer hiring priority', () => {
  assert.deepEqual(allProjects.map(project => project.slug), approvedProjectOrder)
})

test('every original project remains reachable with a unique public URL', () => {
  const original = JSON.parse(readFileSync(new URL('../src/data/projects.json', import.meta.url)))
  for (const project of original) {
    const published = allProjects.find(item => item.id === project.id)
    assert.ok(published, `Missing original project: ${project.id}`)
    assert.equal(resolvePage(`/work/${published.slug}/`).project.id, project.id)
  }
  assert.equal(new Set(allProjects.map(p => p.slug)).size, allProjects.length)
  assert.equal(featuredProjects.length, 4)
})

test('direct links, trailing slashes and missing pages resolve consistently', () => {
  assert.equal(normalizePath('/research'), '/research/')
  assert.equal(resolvePage('/research/').type, 'research')
  assert.equal(resolvePage('/about').type, 'about')
  assert.equal(resolvePage('/work/nonexistent/').type, 'not-found')
  assert.equal(resolvePage('/').type, 'home')
  for (const path of routes) assert.notEqual(resolvePage(path).type, 'not-found')
})

test('local published media and resources exist', () => {
  for (const project of allProjects) {
    const paths = [project.image, ...project.resources.map(r => r.href), ...(project.content || []).map(b => b.src)]
    for (const path of paths.filter(p => p?.startsWith('/'))) {
      assert.ok(existsSync(new URL(`../public${path}`, import.meta.url)), `${project.slug}: missing ${path}`)
    }
  }
})

test('static index filenames resolve to their directory page', () => {
  for (const path of routes) {
    assert.deepEqual(resolvePage(`${path}index.html`), resolvePage(path), path)
  }
})

test('every route has distinct metadata and an existing social preview', () => {
  const titles = new Set()
  for (const route of routes) {
    const meta = pageMetadata(route)
    assert.ok(meta.description.length > 30)
    assert.ok(!titles.has(meta.title), `Duplicate title: ${meta.title}`)
    titles.add(meta.title)
    assert.equal(meta.path, route)
    assert.ok(existsSync(new URL(`../public${meta.image}`, import.meta.url)), meta.image)
  }
  assert.equal(pageMetadata('/missing/').notFound, true)
})

test('homepage metadata leads with the UX Design Engineer position', () => {
  const meta = pageMetadata('/')
  assert.match(meta.title, /UX Design Engineer/)
  assert.match(meta.description, /UX Design Engineer/)
})

test('responsive image dimensions describe existing files', () => {
  const manifest = JSON.parse(readFileSync(new URL('../public/assets/optimized/manifest.json', import.meta.url)))
  for (const image of manifest.images) for (const variant of image.variants) {
    assert.ok(variant.width > 0 && variant.height > 0)
    assert.ok(variant.width <= variant.maxWidth)
    assert.ok(existsSync(new URL(`../public${variant.path}`, import.meta.url)), variant.path)
  }
})

test('archive projects keep the concise editorial reading mode', () => {
  const conciseProjects = allProjects.filter(project => getCaseStudyMode(project) === 'concise')

  assert.equal(conciseProjects.length, 13)
  for (const project of conciseProjects) {
    assert.equal(project.sections.length, 1, project.slug)
    assert.equal(getSectionPhase(project.sections[0], 'concise'), 'Project overview', project.slug)
  }
})
