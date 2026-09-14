import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createServer } from 'vite'
import profile from '../src/data/profile.json' with { type: 'json' }

test('the work-led homepage uses the natural hero portrait without editorial labels', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    assert.match(profile.role, /UX/)
    assert.match(html, /aria-label="About Jumin Shin"/)
    const hero = html.slice(html.indexOf('<section'), html.indexOf('</section>'))
    assert.match(hero, /data-hero-portrait="true"/)
    assert.match(hero, /alt="Editorial portrait of Jumin Shin"/)
    assert.match(hero, /jumin-editorial-portrait-v2(?:-720)?\.webp/)
    assert.match(hero, /Research · Interaction · Prototyping · AI/)
    assert.doesNotMatch(hero, /Los Angeles/)
    assert.doesNotMatch(hero, /J\.S\. \/ 26/)
    assert.doesNotMatch(hero, /<figcaption>|Portrait \/ 2026/)
    for (const asset of [
      '../public/assets/jumin-editorial-portrait-v2.png',
      '../public/assets/optimized/jumin-editorial-portrait-v2.webp',
      '../public/assets/optimized/jumin-editorial-portrait-v2-720.webp',
    ]) assert.equal(existsSync(new URL(asset, import.meta.url)), true, `missing portrait asset: ${asset}`)
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

test('the homepage uses the editorial type system without project phase navigation', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')

    assert.match(html, /data-home-editorial-type="true"/)
    assert.doesNotMatch(html, /aria-label="In this project"/)
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
    const expectedLeadOrder = [
      'bubbas-production',
      'pacepop',
      'honda-spatial',
      'ethicon-care',
    ]
    const expectedSupportingOrder = [
      'swim-up-hill',
      'haily',
      'ars-pharma',
      'story-authoring',
      'bubbas-daily-target',
      'ai-3d-product-visualization',
      'handsign',
      'samsung-podcast',
    ]
    assert.doesNotMatch(html, /Project index|aria-label="Project shortcuts"/)

    const featured = html.slice(html.indexOf('id="work"'), html.indexOf('aria-labelledby="capability-heading"'))
    const featuredOrder = expectedLeadOrder.map(slug => featured.indexOf(`/work/${slug}/`))
    assert.ok(featuredOrder.every((position, index) => position >= 0 && (index === 0 || position > featuredOrder[index - 1])))

    const capabilityPosition = html.indexOf('aria-labelledby="capability-heading"')
    const moreWorkPosition = html.indexOf('aria-labelledby="more-work-heading"')
    assert.ok(capabilityPosition < moreWorkPosition)

    const supporting = html.slice(moreWorkPosition, html.indexOf('aria-labelledby="home-about-heading"'))
    const supportingOrder = expectedSupportingOrder.map(slug => supporting.indexOf(`/work/${slug}/`))
    assert.ok(supportingOrder.every((position, index) => position >= 0 && (index === 0 || position > supportingOrder[index - 1])))
  } finally { await server.close() }
})

test('homepage project covers use four lead and eight compact presentations', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    const featured = html.slice(html.indexOf('id="work"'), html.indexOf('aria-labelledby="capability-heading"'))
    const supporting = html.slice(html.indexOf('aria-labelledby="more-work-heading"'), html.indexOf('aria-labelledby="home-about-heading"'))

    assert.equal((html.match(/data-project-cover="micro"/g) || []).length, 0)
    assert.equal((featured.match(/data-project-cover="lead"/g) || []).length, 4)
    assert.equal((supporting.match(/data-project-cover="compact"/g) || []).length, 8)
    assert.match(featured, /data-cover-tone="bubbas-blue"/)
    assert.match(featured, /data-cover-layout="immersive"/)
    assert.match(featured, /bubbas-assist-media/)
    assert.match(featured, /300\+ videos per batch/)
    assert.doesNotMatch(featured, /alt="Bubba(?:'|&#x27;)s Rough Cut Prep/)
    assert.doesNotMatch(html, /class="[^"]*\bundefined\b/)

    const bubbasRow = featured.split('data-case-study-entry="true"')[1].split('</article>')[0]
    assert.equal((bubbasRow.match(/Bubba(?:'|&#x27;)s LA/g) || []).length, 1)
  } finally { await server.close() }
})

test('Bubbas uses an immersive product close-up on the homepage and case study', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const home = render('/')
    const detail = render('/work/bubbas-production/')
    const bubbasEntry = home.slice(home.indexOf('data-project-slug="bubbas-production"'), home.indexOf('</article>', home.indexOf('data-project-slug="bubbas-production"')))

    assert.match(bubbasEntry, /data-cover-tone="bubbas-blue"/)
    assert.match(bubbasEntry, /data-cover-layout="immersive"/)
    assert.doesNotMatch(bubbasEntry, /coverSecondary/)
    assert.match(detail, /data-project-slug="bubbas-production"/)
    assert.equal((detail.match(/data-story-artifact=/g) || []).length, 7)

    const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))
    assert.match(currentCss, /\.projectCover\[data-cover-tone='bubbas-blue'\]\s*{[^}]*background:\s*#[0-9a-f]{6}/is)
    assert.match(currentCss, /\.projectCover\[data-project-cover='lead'\]\[data-cover-layout='immersive'\]\s+\.coverPrimary\s*{/s)
    assert.match(currentCss, /\.casePage\[data-project-slug='bubbas-production'\]\s+\.storyEvidenceGrid\s*{[^}]*grid-column:\s*1\s*\/\s*-1/s)
    assert.match(currentCss, /\.casePage\[data-project-slug='bubbas-production'\]\s+\.storyArtifactMedia\s*{[^}]*border-radius:\s*8px/s)
  } finally { await server.close() }
})

test('Honda and J&J covers foreground the product without template overlays', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const home = render('/')
    const entries = Object.fromEntries(['honda-spatial', 'ethicon-care'].map(slug => {
      const start = home.indexOf(`data-project-slug="${slug}"`)
      return [slug, home.slice(start, home.indexOf('</article>', start))]
    }))

    for (const entry of Object.values(entries)) {
      assert.match(entry, /data-cover-layout="immersive"/)
      assert.match(entry, /data-cover-frame="plain"/)
      assert.doesNotMatch(entry, /coverSecondary/)
    }
    assert.match(entries['honda-spatial'], /honda-deck-28/)
    assert.match(entries['ethicon-care'], /jj-training-decision/)

    const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))
    for (const slug of ['honda-spatial', 'ethicon-care']) {
      assert.match(currentCss, new RegExp(`\\.caseStudyMedia\\[data-project-slug='${slug}'\\] \\.projectAction\\s*\\{[^}]*display:\\s*none`, 's'))
      assert.match(currentCss, new RegExp(`\\.caseStudyMedia\\[data-project-slug='${slug}'\\] \\.coverPrimary\\s*\\{`, 's'))
    }
    assert.match(currentCss, /\.caseStudyMedia\[data-project-slug='ethicon-care'\] \.coverPrimary img\s*{[^}]*object-fit:\s*contain[^}]*transform:\s*none/s)
  } finally { await server.close() }
})

test('homepage project framing keeps company names concise and roles visible', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    const featured = html.slice(html.indexOf('id="work"'), html.indexOf('aria-labelledby="capability-heading"'))
    const supporting = html.slice(html.indexOf('aria-labelledby="more-work-heading"'), html.indexOf('aria-labelledby="home-about-heading"'))

    assert.match(featured, /data-project-company="true"/)
    assert.doesNotMatch(featured, /Two roles \/ one temporary room|12-assessment review flow/)
    assert.match(featured, />American Honda</)
    assert.match(featured, />Ethicon R&amp;D, Johnson &amp; Johnson MedTech</)
    assert.doesNotMatch(featured, /American Honda x USC Iovine and Young Academy/)
    assert.doesNotMatch(featured, /Ethicon R&amp;D, Johnson &amp; Johnson MedTech x USC Iovine and Young Academy/)
    assert.equal((supporting.match(/data-project-role="true"/g) || []).length, 8)
    assert.match(supporting, /Package, service, and UI designer/)
    assert.doesNotMatch(supporting, /ARS Pharma x USC Iovine and Young Academy/)
  } finally { await server.close() }
})

test('case study introductions pair the project story with its hero artifact', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    for (const slug of ['bubbas-production', 'pacepop', 'honda-spatial', 'ethicon-care']) {
      const html = render(`/work/${slug}/`)
      const overview = html.indexOf('id="overview"')
      const header = html.slice(html.lastIndexOf('<header', overview), html.indexOf('</header>', overview))
      assert.match(header, /data-case-intro-layout="split"/)
      assert.match(header, /data-case-hero-media="true"/)
      assert.match(header, /data-project-facts="true"/)
      assert.equal((html.match(/data-case-hero-media="true"/g) || []).length, 1)
    }
  } finally { await server.close() }
})

test('mobile case studies expose swipeable evidence with restrained PACEPOP corners', () => {
  const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
  const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))
  const mobileCss = currentCss.slice(currentCss.lastIndexOf('@media (max-width: 600px)'))

  assert.match(mobileCss, /\.storyEvidenceGrid:not\(\.storyEvidenceGridSingle\)\s*{[^}]*display:\s*flex[^}]*overflow-x:\s*auto[^}]*scroll-snap-type:\s*x\s+mandatory/s)
  assert.match(mobileCss, /\.casePage\[data-project-slug='pacepop'\]\s+\.storyArtifactPhone img\s*{[^}]*border-radius:\s*18px[^}]*clip-path:\s*inset\(1px\s+round\s+18px\)/s)
  assert.match(mobileCss, /\.caseToc\s*{[^}]*scroll-padding-inline:/s)
})

test('the hero portrait uses correctly sized responsive sources', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    const hero = html.slice(html.indexOf('<section'), html.indexOf('</section>'))
    assert.match(hero, /jumin-editorial-portrait-v2-720\.webp 720w/)
    assert.match(hero, /jumin-editorial-portrait-v2\.webp 1122w/)
    assert.match(hero, /width="1122" height="1402"/)
  } finally { await server.close() }
})

test('the homepage hero presents USC as a quiet academic affiliation', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    const hero = html.slice(html.indexOf('<section'), html.indexOf('</section>'))
    assert.match(hero, /USC_logo\.svg/)
    assert.match(hero, /USC Iovine and Young Academy/)
    assert.match(hero, /M\.S\. Student/)
    assert.match(hero, /Integrated Design, Business and Technology/)
    assert.equal(existsSync(new URL('../public/assets/USC_logo.svg', import.meta.url)), true)

    const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))
    assert.match(currentCss, /\.heroAffiliation\s*{[^}]*display:\s*flex[^}]*border:\s*0/s)
    assert.match(currentCss, /\.heroAffiliation\s*>\s*img\s*{[^}]*width:\s*30px/s)
  } finally { await server.close() }
})

test('phone evidence is clipped to a rounded screen without exposed capture edges', () => {
  const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
  const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))

  assert.match(currentCss, /\.storyArtifactPhone img\s*{[^}]*border-radius:\s*clamp\([^}]*clip-path:\s*inset\([^}]*round/s)
})

test('PACEPOP presents dense phone evidence as a responsive visual gallery', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/work/pacepop/')
    assert.equal((html.match(/data-image-presentation="phone"/g) || []).length, 18)
    assert.equal((html.match(/data-evidence-layout="phone-pair"/g) || []).length, 2)
    assert.equal((html.match(/data-evidence-layout="phone-gallery"/g) || []).length, 2)
    assert.equal((html.match(/data-evidence-layout="phone-quad"/g) || []).length, 2)

    const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))
    assert.match(currentCss, /\.storyEvidenceGridPhonePair\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s)
    assert.match(currentCss, /\.storyEvidenceGridPhoneGallery\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s)
    assert.match(currentCss, /\.storyEvidenceGridPhoneQuad\s*{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s)
  } finally { await server.close() }
})

test('compact project covers use a block wrapper for their block content', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    const supporting = html.slice(html.indexOf('aria-labelledby="more-work-heading"'), html.indexOf('aria-labelledby="home-about-heading"'))

    assert.equal((supporting.match(/<div class="[^"]*compactThumb/g) || []).length, 8)
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
    assert.match(currentCss, /\.caseStudyList\s*{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s)
    assert.match(currentCss, /\.caseStudyRow\s*{[^}]*display:\s*block[^}]*min-height:\s*0/s)
    assert.match(currentCss, /\.caseStudyCaption\s*{[^}]*max-width:\s*580px/s)
    assert.doesNotMatch(currentCss, /\.caseStudyRow:nth-child\(even\)\s+\.caseStudyMedia/)
    assert.match(currentCss, /\.caseStudyMedia \.projectArt\s*{[^}]*aspect-ratio:\s*1\.55/s)
    assert.doesNotMatch(currentCss, /\.caseStudyTopline\b|\.caseStudyEvidence\b/)
    assert.match(currentCss, /\.compactProjectList\s*{[^}]*display:\s*grid[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)[^}]*border-top:\s*1px solid var\(--ink\)/s)
    assert.doesNotMatch(currentCss, /\.compactProject:nth-child\(1\)[^}]*grid-column:\s*span\s+7/s)
  } finally { await server.close() }
})

test('the homepage opens with a clean portrait and presents four lead projects together', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/')
    const hero = html.slice(html.indexOf('<section'), html.indexOf('</section>'))
    assert.match(hero, /Jumin Shin/)
    assert.match(hero, /UX Design Engineer/)
    assert.match(hero, /data-hero-portrait="true"/)
    assert.doesNotMatch(html, /Project index|aria-label="Project shortcuts"/)
    assert.doesNotMatch(hero, /<figcaption>/)

    const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))
    assert.match(currentCss, /\.hero\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*650px\)\s+minmax\(360px,\s*460px\)/s)
    assert.match(currentCss, /\.hero\s*{[^}]*justify-content:\s*center/s)
    assert.match(currentCss, /\.hero\s*{[^}]*gap:\s*clamp\(72px,\s*8vw,\s*160px\)/s)
    assert.match(currentCss, /\.heroCopy\s*{[^}]*text-align:\s*left/s)
    assert.match(currentCss, /\.heroPortrait\s*{[^}]*max-width:\s*400px/s)
    assert.match(currentCss, /\.heroPortraitFrame\s*{[^}]*background:\s*(?:transparent|#fff(?:fff)?)[^}]*border:\s*0/s)
    assert.doesNotMatch(currentCss, /\.heroPortraitMark\s*{/)
    assert.doesNotMatch(currentCss, /\.projectIndexStrip\s*{|\.heroProjectGrid\s*{/)
    assert.match(currentCss, /\.caseStudyList\s*{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s)
    assert.match(currentCss, /\.compactProjectList\s*{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s)
    assert.match(currentCss, /@media\s*\(max-width:\s*1024px\)\s+and\s+\(min-width:\s*601px\)[\s\S]*?\.hero\s*{[^}]*grid-template-columns:\s*minmax\(0,\s*1\.15fr\)\s+minmax\(260px,\s*\.85fr\)/s)
    assert.match(currentCss, /@media\s*\(max-width:\s*760px\)\s+and\s+\(min-width:\s*601px\)[\s\S]*?\.caseStudyList,\s*\.compactProjectList\s*{[^}]*grid-template-columns:\s*1fr/s)
    assert.match(currentCss, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.caseStudyList\s*{[^}]*grid-template-columns:\s*1fr/s)
    assert.match(currentCss, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.compactProjectList\s*{[^}]*grid-template-columns:\s*1fr/s)
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
    assert.match(html, /data-story-artifact="interaction-gaps"/)
    assert.match(html, /Four interaction gaps documented/)
    assert.equal((html.match(/data-image-presentation="slide"/g) || []).length, 33)
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
    const honda = render('/work/honda-spatial/')
    const navigation = honda.slice(honda.indexOf('aria-label="Case study sections"'), honda.indexOf('</nav>', honda.indexOf('aria-label="Case study sections"')))
    const process = html.slice(html.indexOf('>Process</span>'), html.indexOf('</figure>', html.indexOf('>Process</span>')))

    assert.match(navigation, /In this project/)
    assert.match(navigation, /System constraint/)
    assert.doesNotMatch(navigation, /<span>0\d<\/span>/)
    assert.match(process, /Production materials/)
    assert.match(process, /Automated preparation/)
    assert.match(process, /Monitoring and control/)
    assert.doesNotMatch(process, /<ol>|<li|lucide-arrow-right/)

    const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    const currentCss = moduleCss.slice(moduleCss.indexOf('/* UX Design Engineer portfolio */'))
    assert.match(currentCss, /\.caseToc\s*{[^}]*position:\s*sticky[^}]*overflow-x:\s*auto/s)
    assert.doesNotMatch(currentCss, /\.caseToc\s*{[^}]*flex-wrap:\s*wrap/s)
    assert.match(currentCss, /\.processNarrative\s*{[^}]*grid-column:\s*2/s)
    assert.doesNotMatch(currentCss, /\.workflow\s+(?:ol|li)\b/)
  } finally { await server.close() }
})

test('the portfolio stylesheet enforces the approved readable visual system', () => {
  const rootCss = readFileSync(new URL('../src/index.css', import.meta.url), 'utf8')
  const moduleCss = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
  assert.match(rootCss, /--paper:\s*#fff(?:fff)?;/i)
  assert.match(moduleCss, /\.label\s*{[^}]*font-size:\s*13px/s)
  assert.match(moduleCss, /\.hero\s*{[^}]*min-height:\s*min\(520px,\s*calc\(100svh - 72px\)\)/s)
  assert.match(moduleCss, /\.caseStudies\s*{[^}]*padding:\s*30px\s+var\(--gutter\)\s+76px/s)
  assert.match(moduleCss, /\.caseStudiesHeader\s*{[^}]*display:\s*flex/s)
  assert.match(moduleCss, /\.caseStudiesHeader h2\s*{[^}]*font-size:\s*13px/s)
  assert.doesNotMatch(moduleCss, /\.caseStudyScopes/)
  assert.match(moduleCss, /\/\* UX Design Engineer portfolio \*\/[\s\S]*?\.caseToc\s*{[^}]*position:\s*sticky[^}]*overflow-x:\s*auto/s)
  assert.match(moduleCss, /\.caseStudyMedia:is\(:hover,\s*:focus-visible\) \.projectAction\s*{[^}]*opacity:\s*1/s)
  assert.match(moduleCss, /\.storyArtifact:not\(\.storyArtifactBrowser\) \.storyArtifactMedia\s*{[^}]*display:\s*flex[^}]*justify-content:\s*center/s)
  assert.match(moduleCss, /\.storyArtifact:not\(\.storyArtifactBrowser\) img\s*{[^}]*width:\s*auto[^}]*max-width:\s*100%[^}]*max-height:\s*min\(74svh,\s*700px\)/s)
  assert.match(moduleCss, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.caseStudyRow\s*{[^}]*grid-template-columns:\s*1fr/s)
  assert.match(moduleCss, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.caseVisual\.caseImage \.projectArt\s*{[^}]*aspect-ratio:\s*1\.35/s)
  assert.match(moduleCss, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.storyArtifact:not\(\.storyArtifactBrowser\) img\s*{[^}]*width:\s*100%[^}]*max-height:\s*none/s)
})

test('detailed case studies use an editorial introduction and ordered facts', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const html = render('/work/honda-spatial/')
    assert.match(html, /data-case-study-mode="detailed"/)
    assert.match(html, /data-intro-lead="true"/)
    assert.match(html, /data-project-descriptors="true"/)
    const facts = html.slice(html.indexOf('data-project-facts="true"'), html.indexOf('</dl>', html.indexOf('data-project-facts="true"')))
    assert.ok(facts.indexOf('Role') < facts.indexOf('Timeline'))
    assert.ok(facts.indexOf('Timeline') < facts.indexOf('Outcome'))
    assert.ok(facts.indexOf('Outcome') < facts.indexOf('Team'))
  } finally { await server.close() }
})

test('case study navigation exposes authored phases without numeric section headings', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const detailed = render('/work/honda-spatial/')
    assert.match(detailed, /data-phase-navigation="true"/)
    const navigationStart = detailed.indexOf('data-phase-navigation="true"')
    const navigation = detailed.slice(navigationStart, detailed.indexOf('</nav>', navigationStart))
    const navigationLabels = [...navigation.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map(match => match[1])
    assert.doesNotMatch(navigation, />Overview</)
    assert.equal(navigationLabels[0], 'Problem')
    assert.match(detailed, /data-story-phase="Problem"/)
    assert.match(detailed, /data-story-phase="Design response"/)
    assert.doesNotMatch(detailed, /class="[^"]*storyHeading[^"]*">\s*<span>0[1-9]<\/span>/)
    const concise = render('/work/newegg/')
    assert.match(concise, /data-case-study-mode="concise"/)
    assert.doesNotMatch(concise, /data-phase-navigation="true"/)
    assert.match(concise, /data-story-phase="Project overview"/)
  } finally { await server.close() }
})

test('case study evidence and decisions use the open editorial treatment', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const honda = render('/work/honda-spatial/')
    assert.match(honda, /data-design-decision="true"/)
    assert.match(honda, />Problem</)
    assert.match(honda, />Design response</)
    assert.match(honda, /data-image-presentation="slide"/)
    assert.match(honda, /data-outcome-section="true"/)
    const css = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
    assert.match(css, /\.storyArtifactSlide img\s*{[^}]*object-fit:\s*contain/s)
    assert.match(css, /\.outcome\s*{[^}]*background:\s*var\(--paper\)/s)
    assert.doesNotMatch(css, /\.designDecision > div\s*{[^}]*border:\s*1px solid/s)
  } finally { await server.close() }
})
