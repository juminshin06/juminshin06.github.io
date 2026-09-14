import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createServer } from 'vite'
import { legacyRoutes, pageMetadata, routes } from '../src/data/portfolio.js'
import profile from '../src/data/profile.json' with { type: 'json' }

const origin = 'https://juminshin06.github.io'
const escape = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]))
const output = process.env.PORTFOLIO_BUILD_DIR || 'dist'
const template = await readFile(resolve(output, 'index.html'), 'utf8')
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' })
try {
  const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
  for (const path of [...routes, ...legacyRoutes, '/404.html']) {
    const meta = pageMetadata(path)
    const canonical = `${origin}${meta.path}`
    const schema = path === '/' ? { '@context': 'https://schema.org', '@type': 'Person', name: profile.name, url: origin, description: meta.description, sameAs: [profile.linkedin, profile.scholar, profile.github] } : { '@context': 'https://schema.org', '@type': 'WebPage', name: meta.title, description: meta.description, url: canonical }
    const tags = [
      `<link rel="canonical" href="${canonical}" />`,
      `<meta property="og:type" content="website" />`,
      `<meta property="og:site_name" content="Jumin Shin" />`,
      `<meta property="og:title" content="${escape(meta.title)}" />`,
      `<meta property="og:description" content="${escape(meta.description)}" />`,
      `<meta property="og:url" content="${canonical}" />`,
      `<meta property="og:image" content="${origin}${meta.image}" />`,
      '<meta name="twitter:card" content="summary_large_image" />',
      meta.notFound ? '<meta name="robots" content="noindex" />' : '',
      `<script type="application/ld+json">${JSON.stringify(schema).replace(/</g, '\\u003c')}</script>`,
    ].join('\n    ')
    const html = template.replace(/<title>.*?<\/title>/, `<title>${escape(meta.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escape(meta.description)}" />`)
      .replace('<!--page-metadata-->', tags).replace('<!--app-html-->', render(path))
    const target = resolve(output, path === '/404.html' ? '404.html' : `.${path}index.html`)
    await mkdir(resolve(target, '..'), { recursive: true })
    await writeFile(target, html)
  }
  await writeFile(resolve(output, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map(path => `<url><loc>${origin}${path}</loc></url>`).join('')}</urlset>\n`)
  await writeFile(resolve(output, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`)
  console.log(`Prerendered ${routes.length} public routes, ${legacyRoutes.length} legacy route and a 404 page.`)
} finally {
  await server.close()
}
