import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import editorial from '../src/data/editorial.json' with { type: 'json' }
import internships from '../src/data/internships.json' with { type: 'json' }

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const homepageSlugs = [
  'bubbas-production',
  'swim-up-hill',
  'ethicon-care',
  'ars-pharma',
  'pacepop',
  'bubbas-daily-target',
  'honda-spatial',
  'story-authoring',
  'ai-3d-product-visualization',
]
const projects = [...editorial.featured, ...editorial.additional, ...internships]
const allowedTones = new Set(['warm-gray', 'pale-green', 'clinical', 'coral', 'neutral', 'spatial', 'ink', 'paper', 'research', 'bubbas-blue'])
const allowedLayouts = new Set(['primary-left', 'primary-right', 'desktop-mobile', 'single', 'immersive'])
const allowedFrames = new Set(['browser', 'document', 'phone', 'plain'])

test('homepage projects define supported editorial cover metadata', () => {
  for (const slug of homepageSlugs) {
    const project = projects.find(item => item.slug === slug)
    assert.ok(project, `missing homepage project: ${slug}`)
    assert.ok(project.cover, `missing cover metadata: ${slug}`)
    assert.ok(allowedTones.has(project.cover.tone), `invalid tone: ${slug}`)
    assert.ok(allowedLayouts.has(project.cover.layout), `invalid layout: ${slug}`)
    assert.ok(project.cover.annotation, `missing factual annotation: ${slug}`)

    if (project.cover.primary) {
      assert.ok(allowedFrames.has(project.cover.primaryFrame), `invalid primary frame: ${slug}`)
    }
    if (project.cover.secondary) {
      assert.ok(allowedFrames.has(project.cover.secondaryFrame), `invalid secondary frame: ${slug}`)
    }
  }
})

test('homepage project cover images resolve to local evidence files', () => {
  for (const slug of homepageSlugs) {
    const project = projects.find(item => item.slug === slug)
    assert.ok(project?.cover, `missing cover metadata: ${slug}`)
    for (const asset of [project.cover.primary, project.cover.secondary].filter(Boolean)) {
      assert.ok(
        existsSync(resolve(projectRoot, 'public', asset.slice(1))),
        `missing cover asset: ${slug} -> ${asset}`,
      )
    }
  }
})
