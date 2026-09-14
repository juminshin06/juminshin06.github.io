import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { allProjects, resolvePage, routes } from '../src/data/portfolio.js'

test('three distinct internship case studies have working routes and evidence-qualified outcomes', () => {
  for (const slug of ['swim-up-hill', 'ai-3d-product-visualization', 'bubbas-daily-target']) {
    const project = allProjects.find(p => p.slug === slug)
    assert.ok(project, slug)
    assert.equal(resolvePage(`/work/${slug}/`).project.id, project.id)
    assert.ok(routes.includes(`/work/${slug}/`))
    assert.ok(project.sections.length >= 3)
    assert.ok(project.source)
  }
  assert.match(allProjects.find(p => p.slug === 'swim-up-hill').contribution, /publish/i)
  assert.match(allProjects.find(p => p.slug === 'ai-3d-product-visualization').status, /six blender/i)
  assert.match(allProjects.find(p => p.slug === 'bubbas-daily-target').outcome, /read-only/i)
})

test('new work is discoverable from home and original artifact context is preserved', async () => {
  const server = await createServer({server:{middlewareMode:true,ws:false},appType:'custom',logLevel:'error'})
  try {
    const {render} = await server.ssrLoadModule('/src/entry-server.jsx')
    for (const slug of ['swim-up-hill', 'bubbas-daily-target']) {
      assert.match(render('/'), new RegExp(`href="/work/${slug}/"`))
    }
    for (const slug of ['swim-up-hill', 'ai-3d-product-visualization', 'bubbas-daily-target']) {
      assert.match(render('/archive/'), new RegExp(`href="/work/${slug}/"`))
    }
    assert.match(render('/work/swim-up-hill/'), /href="https:\/\/swimuphill.org\//)
    assert.match(render('/work/bubbas-daily-target/'), /fictional data/)
    assert.match(render('/work/ai-3d-product-visualization/'), /Blender MCP iteration loop/)
    assert.match(render('/work/studio-os-audit/'), /AI-assisted 3D production/)
  } finally { await server.close() }
})

test('Bubbas case studies present production and 3D evidence from their source artifacts', async () => {
  const production = allProjects.find(project => project.slug === 'bubbas-production')
  const productionScreens = [
    production.image,
    ...production.content.filter(block => block.type === 'image').map(block => block.src),
  ]
  assert.equal(new Set(productionScreens).size, 8)
  assert.ok(productionScreens.every(src => src.startsWith('/assets/projects/bubbas-assist-')))

  const blender = allProjects.find(project => project.slug === 'ai-3d-product-visualization')
  const blenderRenders = [
    blender.image,
    ...blender.content.filter(block => block.type === 'image').map(block => block.src),
  ]
  assert.equal(new Set(blenderRenders).size, 6)
  assert.ok(blenderRenders.every(src => src.startsWith('/assets/projects/blender-mcp-')))

  const server = await createServer({server:{middlewareMode:true,ws:false},appType:'custom',logLevel:'error'})
  try {
    const {render} = await server.ssrLoadModule('/src/entry-server.jsx')
    const productionHtml = render('/work/bubbas-production/')
    const blenderHtml = render('/work/ai-3d-product-visualization/')
    assert.match(productionHtml, /data-evidence-grid="true"/)
    assert.match(blenderHtml, /data-evidence-grid="true"/)
    assert.equal((blenderHtml.match(/data-story-artifact=/g) || []).length, 6)
    assert.match(blenderHtml, /Product study 01/i)
    assert.match(blenderHtml, /Mascot study 02/i)
    assert.doesNotMatch(blenderHtml, /CupNoodle|120-frame|missing external label texture/i)
    assert.doesNotMatch(blenderHtml, /Studio\.OS/i)
  } finally { await server.close() }
})
