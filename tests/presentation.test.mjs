import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'vite'
import profile from '../src/data/profile.json' with { type: 'json' }

test('the work-led homepage places the working portrait in the personal introduction', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    assert.match(profile.role, /UX/)
    assert.match(html, /aria-label="About Jumin Shin"/)
    const hero = html.slice(html.indexOf('<section'), html.indexOf('</section>'))
    assert.doesNotMatch(hero, /profile|portrait/i)
    const about = html.slice(html.indexOf('aria-labelledby="home-about-heading"'))
    assert.match(about, /id="home-about-heading"/)
    assert.match(about, /alt="Jumin Shin working at a laptop"/)
    assert.match(about, /profile_hover2.*?\.webp/)
    assert.match(about, /loading="lazy"/)
    const aboutPage = render('/about/')
    assert.match(aboutPage, /alt="Jumin Shin working at a laptop"/)
    assert.match(aboutPage, /profile_hover2.*?\.webp/)
    assert.match(aboutPage, /UX Design Engineer/)
    assert.doesNotMatch(aboutPage, /UX\/UI Designer &amp; Researcher/)
    assert.match(html, /View case study/)
    assert.match(html, /data-reveal/)
    assert.doesNotMatch(html, /intelligent systems/)
    assert.doesNotMatch(render('/missing/'), /selected work/i)
  } finally { await server.close() }
})

test('the homepage prioritizes projects by UX Design Engineer relevance and stated preference', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    assert.match(html, /UX Design Engineer/)
    assert.match(html, /Case studies/)
    assert.match(html, /<h2 id="case-studies-heading">Case studies<\/h2>/)
    assert.match(html, /01–04/)
    assert.doesNotMatch(html, /From complex workflows to testable systems\./)
    assert.doesNotMatch(html, /AI production systems|Shipped web experiences|Healthcare interfaces|Service ecosystems/)
    assert.doesNotMatch(html, /Four projects showing how I frame problems/)
    assert.match(html, /Research/)
    assert.match(html, /Figma flow/)
    assert.match(html, /shipping the front end/)
    assert.doesNotMatch(html, /Selected work|UX in practice/)
    const expectedOrder = [
      'bubbas-production',
      'swim-up-hill',
      'ethicon-care',
      'ars-pharma',
      'bubbas-daily-target',
      'honda-spatial',
      'story-authoring',
      'studio-os-audit',
      'embrain-research',
    ]
    const hero = html.slice(html.indexOf('<section'), html.indexOf('</section>'))
    const heroOrder = [...hero.matchAll(/href="\/work\/([^/]+)\//g)].map(match => match[1])
    assert.deepEqual(heroOrder, expectedOrder)

    const featured = html.slice(html.indexOf('id="work"'), html.indexOf('aria-labelledby="capability-heading"'))
    const featuredOrder = expectedOrder.slice(0, 4).map(slug => featured.indexOf(`/work/${slug}/`))
    assert.ok(featuredOrder.every((position, index) => position >= 0 && (index === 0 || position > featuredOrder[index - 1])))

    const capabilityPosition = html.indexOf('aria-labelledby="capability-heading"')
    const moreWorkPosition = html.indexOf('aria-labelledby="more-work-heading"')
    assert.ok(capabilityPosition < moreWorkPosition)

    const supporting = html.slice(moreWorkPosition, html.indexOf('aria-labelledby="home-about-heading"'))
    const supportingOrder = expectedOrder.slice(4).map(slug => supporting.indexOf(`/work/${slug}/`))
    assert.ok(supportingOrder.every((position, index) => position >= 0 && (index === 0 || position > supportingOrder[index - 1])))
  } finally { await server.close() }
})

test('homepage project covers use lead, compact and micro presentations', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    const hero = html.slice(html.indexOf('<section'), html.indexOf('</section>'))
    const featured = html.slice(html.indexOf('id="work"'), html.indexOf('aria-labelledby="capability-heading"'))
    const supporting = html.slice(html.indexOf('aria-labelledby="more-work-heading"'), html.indexOf('aria-labelledby="home-about-heading"'))

    assert.equal((hero.match(/data-project-cover="micro"/g) || []).length, 9)
    assert.equal((featured.match(/data-project-cover="lead"/g) || []).length, 4)
    assert.equal((supporting.match(/data-project-cover="compact"/g) || []).length, 5)
    assert.match(hero, /jj-medtech/)
    assert.match(hero, /ars-package/)
    assert.match(featured, /data-cover-tone="warm-gray"/)
    assert.match(featured, /data-cover-layout="desktop-mobile"/)
    assert.match(featured, /bubbas-assist-result/)
    assert.match(featured, /300\+ videos per batch/)
    assert.doesNotMatch(featured, /alt="Bubba(?:'|&#x27;)s Rough Cut Prep/)
    assert.doesNotMatch(html, /class="[^"]*\bundefined\b/)

    const bubbasRow = featured.split('data-case-study-entry="true"')[1].split('</article>')[0]
    assert.equal((bubbasRow.match(/Bubba(?:'|&#x27;)s LA/g) || []).length, 1)
  } finally { await server.close() }
})

test('micro project covers keep optimized sources and thumbnail-sized image hints', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    const hero = html.slice(html.indexOf('<section'), html.indexOf('</section>'))

    for (const asset of ['jj-medtech', 'ars-package']) {
      const image = hero.match(new RegExp(`<img[^>]+src="/assets/optimized/${asset}\\.webp"[^>]+>`))?.[0]
      assert.ok(image, `missing optimized micro cover: ${asset}`)
      assert.match(image, new RegExp(`${asset}-800\\.webp 800w`))
      assert.match(image, /sizes="\(max-width: 900px\) 104px, 160px"/)
    }
  } finally { await server.close() }
})

test('compact project covers use a block wrapper for their block content', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    const supporting = html.slice(html.indexOf('aria-labelledby="more-work-heading"'), html.indexOf('aria-labelledby="home-about-heading"'))

    assert.equal((supporting.match(/<div class="[^"]*compactThumb/g) || []).length, 5)
    assert.doesNotMatch(supporting, /<span class="[^"]*compactThumb/)
  } finally { await server.close() }
})

test('homepage projects preserve their original media sizing with editorial text', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    const featured = html.slice(html.indexOf('id="work"'), html.indexOf('aria-labelledby="capability-heading"'))

    assert.equal((featured.match(/data-case-study-entry="true"/g) || []).length, 4)
    assert.equal((featured.match(/data-project-caption="true"/g) || []).length, 4)
    assert.doesNotMatch(featured, /caseStudyTopline|caseStudyEvidence/)
    assert.match(featured, /My role/)
    assert.match(featured, /Read project/)

    const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))
    assert.match(currentCss, /\.caseStudyRow\s*{[^}]*display:\s*grid[^}]*grid-template-columns:\s*minmax\(0,\s*6fr\)\s+minmax\(0,\s*6fr\)[^}]*min-height:\s*470px/s)
    assert.match(currentCss, /\.caseStudyCaption\s*{[^}]*max-width:\s*580px/s)
    assert.match(currentCss, /\.caseStudyRow:nth-child\(even\)\s+\.caseStudyMedia\s*{[^}]*order:\s*2/s)
    assert.match(currentCss, /\.caseStudyMedia \.projectArt\s*{[^}]*aspect-ratio:\s*1\.55/s)
    assert.doesNotMatch(currentCss, /\.caseStudyTopline\b|\.caseStudyEvidence\b/)
    assert.match(currentCss, /\.compactProjectList\s*{[^}]*border-top:\s*1px solid var\(--ink\)/s)
    assert.match(currentCss, /\.compactProject\s*{[^}]*grid-template-columns:\s*34px\s+minmax\(160px,\s*220px\)\s+minmax\(0,\s*1fr\)\s+24px/s)
    assert.doesNotMatch(currentCss, /\.compactProject:nth-child\(1\)[^}]*grid-column:\s*span\s+7/s)
  } finally { await server.close() }
})

test('the homepage opens with a compact left-aligned introduction and project index', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    const hero = html.slice(html.indexOf('<section'), html.indexOf('</section>'))
    assert.match(hero, /Jumin Shin/)
    assert.match(hero, /UX Design Engineer/)
    assert.match(hero, /aria-label="Project shortcuts"/)
    assert.equal((hero.match(/href="\/work\//g) || []).length, 9)
    assert.match(hero, /Bubba(?:'|&#x27;)s LA/)
    assert.match(hero, /Swim Up Hill Foundation/)
    assert.match(hero, /American Honda/)

    const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))
    assert.match(currentCss, /\.hero\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*650px\)\s+minmax\(360px,\s*460px\)/s)
    assert.match(currentCss, /\.hero\s*{[^}]*justify-content:\s*center/s)
    assert.match(currentCss, /\.hero\s*{[^}]*gap:\s*clamp\(72px,\s*8vw,\s*160px\)/s)
    assert.match(currentCss, /\.heroCopy\s*{[^}]*text-align:\s*left/s)
    assert.match(currentCss, /\.heroProjectNav\s*{[^}]*min-width:\s*0/s)
    assert.match(currentCss, /\.heroProjectGrid\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s)
    assert.match(currentCss, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.heroProjectGrid\s*{[^}]*grid-auto-flow:\s*column/s)
  } finally { await server.close() }
})

test('the homepage presents the working process and contact invitation in a personal voice', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')

    const workingProcess = html.slice(html.indexOf('aria-labelledby="capability-heading"'), html.indexOf('aria-labelledby="more-work-heading"'))
    assert.match(workingProcess, /I like to get close to the problem/)
    assert.match(workingProcess, /Sometimes that means a Figma flow/)
    assert.match(workingProcess, /Research notes and publications/)
    assert.doesNotMatch(workingProcess, /Listen closely/)
    assert.doesNotMatch(workingProcess, /Make the messy parts visible/)
    assert.doesNotMatch(workingProcess, /Put a prototype in someone(?:’|&#x27;)s hands/)
    assert.doesNotMatch(workingProcess, /In the work/)
    assert.doesNotMatch(html, /Research\. Design\. Build\./)

    assert.match(html, /Thanks for making it this far/)
    assert.match(html, /I(?:’|&#x27;)d love to hear what you(?:’|&#x27;)re working on/)
    assert.doesNotMatch(html, /Better experiences.*start with a conversation/s)

    const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))
    assert.match(currentCss, /\.capabilityBand\s*{[^}]*background:\s*var\(--paper\)[^}]*color:\s*var\(--ink\)/s)
    assert.doesNotMatch(currentCss, /\.workNotes?\b/)
    const capabilityRule = currentCss.match(/\.capabilityBand\s*{([^}]*)}/)?.[1] || ''
    const researchRule = currentCss.match(/\.researchCallout\s*{([^}]*)}/)?.[1] || ''
    assert.doesNotMatch(capabilityRule, /border-(?:top|bottom)/)
    assert.doesNotMatch(researchRule, /border-top/)
    assert.match(currentCss, /\.footerTop\s*{[^}]*display:\s*grid/s)
    assert.match(currentCss, /\.footerTop h2\s*{[^}]*font-size:\s*42px/s)
  } finally { await server.close() }
})

test('the Jumin Shin wordmark has no decorative red dot', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    assert.match(html, /<h1>Jumin Shin<\/h1>/)
    assert.doesNotMatch(html, /Jumin Shin<span/)
    const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    assert.doesNotMatch(moduleCss, /\.brand\s*>\s*span/)
  } finally { await server.close() }
})

test('case-study evidence is integrated with the decision it supports', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/work/honda-spatial/')
    assert.match(html, /data-story-artifact="omniverse-constraints"/)
    assert.match(html, /Four documented interaction gaps/)
    assert.match(html, /My contribution/)
    assert.doesNotMatch(html, /Project artifacts/)
    assert.doesNotMatch(html, /class="[^"]*\bundefined\b/)
  } finally { await server.close() }
})

test('case studies use quiet editorial navigation and process prose', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/work/bubbas-production/')
    const navigation = html.slice(html.indexOf('aria-label="Case study sections"'), html.indexOf('</nav>', html.indexOf('aria-label="Case study sections"')))
    const process = html.slice(html.indexOf('>Process</span>'), html.indexOf('</figure>', html.indexOf('>Process</span>')))

    assert.match(navigation, /Jump to/)
    assert.match(navigation, /Production context/)
    assert.doesNotMatch(navigation, /<span>0\d<\/span>/)
    assert.match(process, /Production materials/)
    assert.match(process, /Automated preparation/)
    assert.match(process, /Monitoring and control/)
    assert.doesNotMatch(process, /<ol>|<li|lucide-arrow-right/)

    const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))
    assert.match(currentCss, /\.caseToc\s*{[^}]*position:\s*static[^}]*flex-wrap:\s*wrap[^}]*border:\s*0/s)
    assert.match(currentCss, /\.processNarrative\s*{[^}]*grid-column:\s*2/s)
    assert.doesNotMatch(currentCss, /\.workflow\s+(?:ol|li)\b/)
  } finally { await server.close() }
})

test('the portfolio stylesheet enforces the approved readable visual system', () => {
  const rootCss = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
  assert.match(rootCss, /--paper:\s*#fff(?:fff)?;/i)
  assert.match(moduleCss, /\.label\s*{[^}]*font-size:\s*13px/s)
  assert.match(moduleCss, /\.hero\s*{[^}]*min-height:\s*min\(540px,\s*calc\(100svh - 72px\)\)/s)
  assert.match(moduleCss, /\.caseStudies\s*{[^}]*padding:\s*30px\s+var\(--gutter\)\s+76px/s)
  assert.match(moduleCss, /\.caseStudiesHeader\s*{[^}]*display:\s*flex/s)
  assert.match(moduleCss, /\.caseStudiesHeader h2\s*{[^}]*font-size:\s*13px/s)
  assert.doesNotMatch(moduleCss, /\.caseStudyScopes/)
  assert.match(moduleCss, /\/\* UX Design Engineer portfolio \*\/[\s\S]*?\.caseToc\s*{[^}]*position:\s*static[^}]*flex-wrap:\s*wrap/s)
  assert.match(moduleCss, /\.caseStudyMedia:is\(:hover,\s*:focus-visible\) \.projectAction\s*{[^}]*opacity:\s*1/s)
  assert.match(moduleCss, /\.storyArtifact:not\(\.storyArtifactBrowser\) \.storyArtifactMedia\s*{[^}]*display:\s*flex[^}]*justify-content:\s*center/s)
  assert.match(moduleCss, /\.storyArtifact:not\(\.storyArtifactBrowser\) img\s*{[^}]*width:\s*auto[^}]*max-width:\s*100%[^}]*max-height:\s*min\(74svh,\s*700px\)/s)
  assert.match(moduleCss, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.caseStudyRow\s*{[^}]*grid-template-columns:\s*1fr/s)
  assert.match(moduleCss, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.caseVisual\.caseImage \.projectArt\s*{[^}]*aspect-ratio:\s*auto/s)
  assert.match(moduleCss, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.storyArtifact:not\(\.storyArtifactBrowser\) img\s*{[^}]*width:\s*100%[^}]*max-height:\s*none/s)
})
