import test from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'vite'

async function load() {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  const hiring = await server.ssrLoadModule('/src/portfolio/hiring.js')
  const { homepageProjects } = await server.ssrLoadModule('/src/data/portfolio.js')
  return { server, hiring, homepageProjects }
}

test('role filter keeps every project and only reorders by relevance', async () => {
  const { server, hiring, homepageProjects } = await load()
  try {
    const slugs = homepageProjects.map(project => project.slug)
    assert.deepEqual(hiring.rankForRole(homepageProjects, 'all').map(project => project.slug), slugs)
    for (const role of ['ux', 'ai', 'design-engineering', 'frontend']) {
      const ranked = hiring.rankForRole(homepageProjects, role).map(project => project.slug)
      assert.equal(ranked.length, slugs.length, `${role} hides projects`)
      assert.deepEqual([...ranked].sort(), [...slugs].sort())
    }
    assert.equal(hiring.rankForRole(homepageProjects, 'frontend')[0].slug, 'swim-up-hill')
    assert.ok(['bubbas-production', 'story-authoring'].includes(hiring.rankForRole(homepageProjects, 'ai')[0].slug))
  } finally { await server.close() }
})

test('recruiter summaries come from existing project copy', async () => {
  const { server, hiring, homepageProjects } = await load()
  try {
    for (const project of homepageProjects) {
      const summary = hiring.recruiterSummary(project, 'ux')
      assert.equal(summary.role, project.role)
      assert.equal(summary.href, `/work/${project.slug}/`)
      const source = JSON.stringify(project)
      for (const field of ['problem', 'contribution', 'outcome']) {
        if (summary[field]) assert.ok(source.includes(summary[field].slice(0, 40)), `${project.slug} ${field} is not from the project data`)
      }
      for (const skill of summary.skills) assert.ok(source.toLowerCase().includes(skill.split('/')[0].toLowerCase()), `${project.slug} skill ${skill} is not mentioned`)
    }
  } finally { await server.close() }
})

test('role and recruiter mode round-trip through the URL and ignore invalid values', async () => {
  const { server, hiring } = await load()
  try {
    assert.deepEqual(hiring.parseHiringView('?role=ux&mode=recruiter'), { role: 'ux', recruiter: true })
    assert.deepEqual(hiring.parseHiringView('?role=design-engineering'), { role: 'design-engineering', recruiter: false })
    assert.deepEqual(hiring.parseHiringView('?role=nope&mode=other'), { role: 'all', recruiter: false })
    assert.deepEqual(hiring.parseHiringView(''), { role: 'all', recruiter: false })
    assert.equal(hiring.hiringSearch('', { role: 'ai', recruiter: true }), '?role=ai&mode=recruiter')
    assert.equal(hiring.hiringSearch('?role=ai&mode=recruiter', { role: 'all', recruiter: false }), '')
    assert.equal(hiring.hiringSearch('?utm=x', { role: 'frontend', recruiter: false }), '?utm=x&role=frontend')
  } finally { await server.close() }
})

test('the prerendered homepage offers the recruiter view and role filter in the default state', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    assert.match(html, /data-recruiter-entry="true"/)
    assert.match(html, /60-sec recruiter view/)
    assert.match(html, /data-role-filter="true"/)
    assert.equal((html.match(/data-role-option=/g) || []).length, 5)
    assert.match(html, /data-role-option="all"[^>]*aria-pressed="true"|aria-pressed="true"[^>]*data-role-option="all"/)
    assert.doesNotMatch(html, /data-recruiter-view="true"|data-mode-bar="true"/)
  } finally { await server.close() }
})
