# Portfolio Project Cover System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace raw homepage project screenshots with a responsive, data-driven editorial cover system built from the portfolio's real interface assets.

**Architecture:** Add project-owned cover metadata to the existing editorial and internship data, then render it through a focused `ProjectCover` component with `lead`, `compact`, and `micro` variants. Keep `ProjectArt` as the case-study and no-image fallback, and isolate the new visual system to homepage components and CSS.

**Tech Stack:** React 18, Vite 5, CSS Modules, Node test runner, existing `ProjectImage` responsive-image helper

**Spec:** `docs/superpowers/specs/2026-09-11-project-cover-system-design.md`

## Global Constraints

- Use existing project screenshots and optimized image derivatives only; do not generate or flatten replacement mockup images.
- Do not change project facts, summaries, routes, ordering, detail-page content, or detail-page evidence sizing.
- Preserve the current near-white paper, charcoal ink, and vermilion accent while adding restrained project-specific stage colors.
- Use solid backgrounds only; no gradients, orbs, blur decoration, branded laptop hardware, or heavy 3D perspective.
- Keep the real interface as the largest and highest-contrast element in each cover.
- Keep all cover data factual and sourced from the existing project records.
- Preserve accessible project-link labels, visible keyboard focus, and reduced-motion behavior.
- Reuse `ProjectImage` so responsive `srcset`, dimensions, lazy loading, and the optimized-image manifest continue to work.
- Do not edit generated `dist` output.
- Preserve unrelated working-tree changes and stage only task-owned files in commits.

---

## File Structure

- Create `src/portfolio/ProjectCover.jsx`: render the data-driven cover variants and fall back to `ProjectArt` when needed.
- Modify `src/portfolio/Home.jsx`: use `ProjectCover` in lead rows, supporting rows, and the hero project index.
- Modify `src/portfolio/Portfolio.module.css`: define stage, frame, project-tone, responsive, hover, focus, and reduced-motion styles.
- Modify `src/data/editorial.json`: add cover metadata for Bubba's production, Honda, Johnson & Johnson, story authoring, Embrain, and ARS Pharma.
- Modify `src/data/internships.json`: add cover metadata for Swim Up Hill, Studio.OS, and Daily Target.
- Create `tests/project-covers.test.mjs`: validate cover data, allowed variants, and local asset existence.
- Modify `tests/presentation.test.mjs`: validate homepage variant integration and accessibility through server-rendered markup and CSS contracts.

---

### Task 1: Define And Validate Project Cover Metadata

**Files:**
- Create: `tests/project-covers.test.mjs`
- Modify: `src/data/editorial.json`
- Modify: `src/data/internships.json`

**Interfaces:**
- Consumes: existing project records from `editorial.json` and `internships.json`
- Produces: `project.cover` objects with `tone`, `layout`, `primary`, `primaryFrame`, optional `secondary`, optional `secondaryFrame`, and `annotation`

- [ ] **Step 1: Write the failing metadata and asset-integrity test**

Create `tests/project-covers.test.mjs` with the exact homepage slug set, allowed values, and filesystem checks:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import editorial from '../src/data/editorial.json' with { type: 'json' }
import internships from '../src/data/internships.json' with { type: 'json' }

const projectRoot = fileURLToPath(new URL('..', import.meta.url))
const homepageSlugs = [
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
const projects = [...editorial.featured, ...editorial.additional, ...internships]
const allowedTones = new Set(['warm-gray', 'pale-green', 'clinical', 'coral', 'neutral', 'spatial', 'ink', 'paper', 'research'])
const allowedLayouts = new Set(['primary-left', 'primary-right', 'desktop-mobile', 'single'])
const allowedFrames = new Set(['browser', 'document', 'phone', 'plain'])

test('homepage cover metadata is complete and references local evidence', () => {
  for (const slug of homepageSlugs) {
    const project = projects.find(item => item.slug === slug)
    assert.ok(project, `missing homepage project: ${slug}`)
    assert.ok(project.cover, `missing cover metadata: ${slug}`)
    assert.ok(allowedTones.has(project.cover.tone), `invalid tone: ${slug}`)
    assert.ok(allowedLayouts.has(project.cover.layout), `invalid layout: ${slug}`)
    assert.ok(project.cover.annotation, `missing factual annotation: ${slug}`)

    if (project.cover.primary) {
      assert.ok(allowedFrames.has(project.cover.primaryFrame), `invalid primary frame: ${slug}`)
      assert.ok(existsSync(resolve(projectRoot, 'public', project.cover.primary.slice(1))), `missing primary asset: ${slug}`)
    }

    if (project.cover.secondary) {
      assert.ok(allowedFrames.has(project.cover.secondaryFrame), `invalid secondary frame: ${slug}`)
      assert.ok(existsSync(resolve(projectRoot, 'public', project.cover.secondary.slice(1))), `missing secondary asset: ${slug}`)
    }
  }
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test tests/project-covers.test.mjs`

Expected: FAIL with `missing cover metadata: bubbas-production`.

- [ ] **Step 3: Add the approved cover metadata to project records**

Add these exact values to the corresponding records in `src/data/editorial.json` and `src/data/internships.json`:

```json
{
  "bubbas-production": {
    "tone": "warm-gray",
    "layout": "primary-left",
    "primary": "/assets/projects/bubbas-assist-media.png",
    "primaryFrame": "browser",
    "secondary": "/assets/projects/bubbas-assist-result.png",
    "secondaryFrame": "document",
    "annotation": "300+ videos per batch"
  },
  "swim-up-hill": {
    "tone": "pale-green",
    "layout": "desktop-mobile",
    "primary": "/assets/projects/swim-up-hill-home.png",
    "primaryFrame": "browser",
    "secondary": "/assets/projects/swim-up-hill-mobile.png",
    "secondaryFrame": "phone",
    "annotation": "Designed and published"
  },
  "ethicon-care": {
    "tone": "clinical",
    "layout": "primary-right",
    "primary": "/assets/projects/jj-training-decision.png",
    "primaryFrame": "browser",
    "secondary": "/assets/projects/jj-feedback-loop.png",
    "secondaryFrame": "document",
    "annotation": "12-assessment review flow"
  },
  "ars-pharma": {
    "tone": "coral",
    "layout": "primary-left",
    "primary": "/assets/projects/ars-location-ui.png",
    "primaryFrame": "document",
    "secondary": "/assets/projects/ars-package.png",
    "secondaryFrame": "plain",
    "annotation": "Service / package / UI"
  },
  "bubbas-daily-target": {
    "tone": "neutral",
    "layout": "desktop-mobile",
    "primary": "/assets/projects/bubbas-daily-target.png",
    "primaryFrame": "browser",
    "secondary": "/assets/projects/bubbas-daily-target-mobile.png",
    "secondaryFrame": "phone",
    "annotation": "Desktop + mobile workflow"
  },
  "honda-spatial": {
    "tone": "spatial",
    "layout": "primary-right",
    "primary": "/assets/projects/honda-spatial-ui.png",
    "primaryFrame": "plain",
    "secondary": "/assets/projects/honda-toolbar.png",
    "secondaryFrame": "document",
    "annotation": "Vision Pro design review"
  },
  "story-authoring": {
    "tone": "ink",
    "layout": "single",
    "primary": "/assets/projects/Portfolio_interactive_storytelling.png",
    "primaryFrame": "document",
    "annotation": "Human-AI co-creation"
  },
  "studio-os-audit": {
    "tone": "paper",
    "layout": "primary-left",
    "primary": "/assets/projects/studio-os-briefing.png",
    "primaryFrame": "browser",
    "secondary": "/assets/projects/studio-os-bench.png",
    "secondaryFrame": "document",
    "annotation": "10 screens / 29 recommendations"
  },
  "embrain-research": {
    "tone": "research",
    "layout": "single",
    "primaryFrame": "plain",
    "annotation": "~100 research participants"
  }
}
```

Add each object as a `cover` property inside its existing project object. Do not create a standalone object keyed by slug.

- [ ] **Step 4: Run the metadata test**

Run: `node --test tests/project-covers.test.mjs`

Expected: PASS.

- [ ] **Step 5: Run the existing data tests**

Run: `npm test`

Expected: all tests pass with the new metadata ignored by existing consumers.

- [ ] **Step 6: Commit the metadata contract**

```bash
git add src/data/editorial.json src/data/internships.json tests/project-covers.test.mjs
git commit -m "feat: define editorial project covers"
```

---

### Task 2: Build The ProjectCover Component And Integrate Homepage Variants

**Files:**
- Create: `src/portfolio/ProjectCover.jsx`
- Modify: `src/portfolio/Home.jsx`
- Modify: `tests/presentation.test.mjs`

**Interfaces:**
- Consumes: `ProjectCover({ project, variant = 'lead', eager = false })` and `project.cover` from Task 1
- Produces: SSR markup with `data-project-cover`, `data-cover-tone`, `data-cover-layout`, and `data-cover-frame` contracts for CSS and tests

- [ ] **Step 1: Write the failing homepage-rendering test**

Append this test to `tests/presentation.test.mjs`:

```js
test('homepage project covers use editorial lead, compact and micro variants', async () => {
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
    assert.match(featured, /data-cover-tone="warm-gray"/)
    assert.match(featured, /data-cover-layout="desktop-mobile"/)
    assert.match(featured, /bubbas-assist-result/)
    assert.match(featured, /300\+ videos per batch/)
    assert.match(featured, /aria-hidden="true"/)
    assert.doesNotMatch(featured, /alt="Bubba(?:'|&#x27;)s Rough Cut Prep/)
  } finally { await server.close() }
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node --test --test-name-pattern="homepage project covers" tests/presentation.test.mjs`

Expected: FAIL because no `data-project-cover` markup exists.

- [ ] **Step 3: Create the focused cover renderer**

Create `src/portfolio/ProjectCover.jsx` with these responsibilities and signatures:

```jsx
import { ProjectImage } from './Shell'
import ProjectArt from './ProjectArt'
import s from './Portfolio.module.css'

function CoverFrame({ src, frame = 'plain', eager = false, className = '' }) {
  return <figure className={`${s.coverFrame} ${className}`} data-cover-frame={frame} aria-hidden="true">
    {frame === 'browser' && <span className={s.coverBrowserBar}><i /><i /><i /></span>}
    <ProjectImage src={src} alt="" eager={eager} sizes="(max-width: 700px) 92vw, (max-width: 1200px) 58vw, 820px" />
  </figure>
}

export default function ProjectCover({ project, variant = 'lead', eager = false }) {
  const cover = project.cover
  if (!cover) return <ProjectArt project={project} eager={eager} />

  const primary = variant === 'micro' && project.image ? project.image : cover.primary
  const showPrimary = Boolean(primary)
  const showSecondary = variant === 'lead' && Boolean(cover.secondary)

  return <div
    className={s.projectCover}
    data-project-cover={variant}
    data-cover-tone={cover.tone}
    data-cover-layout={cover.layout}
  >
    <div className={s.coverCanvas}>
      {showPrimary
        ? <CoverFrame src={primary} frame={cover.primaryFrame} eager={eager} className={s.coverPrimary} />
        : <div className={s.coverFallback} aria-hidden="true"><ProjectArt project={project} /></div>}
      {showSecondary && <CoverFrame src={cover.secondary} frame={cover.secondaryFrame} className={s.coverSecondary} />}
    </div>
    {variant === 'lead' && <span className={s.coverAnnotation}>{cover.annotation}</span>}
  </div>
}
```

Keep the browser dots decorative. The surrounding project link already supplies the accessible name, so cover images must keep empty alt text.

- [ ] **Step 4: Replace homepage-only ProjectArt usage**

In `src/portfolio/Home.jsx`:

```jsx
import ProjectCover from './ProjectCover'
```

Use the variants at the three call sites:

```jsx
<ProjectCover project={project} variant="lead" eager={index === 0} />
```

```jsx
<ProjectCover project={project} variant="compact" />
```

```jsx
<ProjectCover project={project} variant="micro" eager={index < 3} />
```

Remove the direct `ProjectImage` and `ProjectArt` branch from `HeroProjectTile`, remove their unused imports, and leave link labels, ordering, captions, and actions unchanged.

- [ ] **Step 5: Run the focused rendering test**

Run: `node --test --test-name-pattern="homepage project covers" tests/presentation.test.mjs`

Expected: PASS with 9 micro, 4 lead, and 5 compact covers.

- [ ] **Step 6: Run the complete test suite**

Run: `npm test`

Expected: all tests pass before styling because the component keeps existing layout wrappers intact.

- [ ] **Step 7: Commit the component and integration**

```bash
git add src/portfolio/ProjectCover.jsx src/portfolio/Home.jsx tests/presentation.test.mjs
git commit -m "feat: render responsive project cover variants"
```

---

### Task 3: Add The Editorial Stage Styling

**Files:**
- Modify: `src/portfolio/Portfolio.module.css`
- Modify: `tests/presentation.test.mjs`

**Interfaces:**
- Consumes: data attributes and class names emitted by `ProjectCover.jsx`
- Produces: fixed-aspect lead, compact, and micro compositions with project-specific tone and layout treatments

- [ ] **Step 1: Write failing CSS contract assertions**

Extend the existing `the portfolio stylesheet enforces the approved readable visual system` test with:

```js
assert.match(moduleCss, /\.projectCover\s*{[^}]*position:\s*relative[^}]*overflow:\s*hidden/s)
assert.match(moduleCss, /\.caseStudyMedia \.projectCover\s*{[^}]*aspect-ratio:\s*1\.55/s)
assert.match(moduleCss, /\.compactThumb \.projectCover\s*{[^}]*aspect-ratio:\s*1\.75/s)
assert.match(moduleCss, /\.heroProjectTile > \.projectCover\s*{[^}]*aspect-ratio:\s*1/s)
assert.match(moduleCss, /\.projectCover\[data-cover-tone=['"]warm-gray['"]\]/)
assert.match(moduleCss, /\.projectCover\[data-cover-layout=['"]desktop-mobile['"]\]/)
assert.match(moduleCss, /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?\.coverFrame/s)
assert.match(moduleCss, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.coverSecondary\s*{[^}]*display:\s*none/s)
```

- [ ] **Step 2: Run the CSS test to verify it fails**

Run: `node --test --test-name-pattern="approved readable visual system" tests/presentation.test.mjs`

Expected: FAIL because `.projectCover` styles do not exist.

- [ ] **Step 3: Add the base stage and frame rules**

Add a `/* Editorial project covers */` section near the homepage case-study styles in `Portfolio.module.css`. Implement these exact structural properties, with final spacing tuned visually:

```css
.projectCover {
  position: relative;
  width: 100%;
  overflow: hidden;
  isolation: isolate;
  background: #e8e9e4;
}
.caseStudyMedia .projectCover { aspect-ratio: 1.55; }
.compactThumb .projectCover { aspect-ratio: 1.75; transition: transform 500ms cubic-bezier(.2, .7, .2, 1); }
.heroProjectTile > .projectCover { width: 100%; height: 100%; aspect-ratio: 1; transition: transform 260ms ease, filter 260ms ease; }
.coverCanvas { position: absolute; inset: 0; }
.coverFrame { position: absolute; margin: 0; overflow: hidden; border: 1px solid rgba(20, 20, 18, .24); background: #fff; box-shadow: 0 18px 36px rgba(20, 20, 18, .14); transition: transform 320ms cubic-bezier(.2, .7, .2, 1); }
.coverFrame img { display: block; width: 100%; height: auto; }
.coverBrowserBar { display: flex; align-items: center; gap: 4px; height: 16px; padding: 0 7px; background: #191a1f; border-bottom: 1px solid #303139; }
.coverBrowserBar i { width: 4px; height: 4px; border-radius: 50%; background: #6d6f78; }
.coverNumber, .coverOrganization, .coverAnnotation { position: absolute; z-index: 4; font-size: 11px; line-height: 1.35; }
.coverNumber { top: 18px; left: 20px; color: var(--accent); font-weight: 650; }
.coverOrganization { top: 18px; right: 20px; max-width: 42%; text-align: right; }
.coverAnnotation { left: 20px; bottom: 17px; color: rgba(20, 20, 18, .66); }
```

- [ ] **Step 4: Add named project tones and layout recipes**

Implement all approved tones as solid colors:

```css
.projectCover[data-cover-tone='warm-gray'] { background: #e8e9e4; }
.projectCover[data-cover-tone='pale-green'] { background: #dfe9e2; }
.projectCover[data-cover-tone='clinical'] { background: #e1eaec; }
.projectCover[data-cover-tone='coral'] { background: #f1d8d0; }
.projectCover[data-cover-tone='neutral'] { background: #e7e5df; }
.projectCover[data-cover-tone='spatial'] { background: #272a28; color: #fff; }
.projectCover[data-cover-tone='ink'] { background: #191a17; color: #fff; }
.projectCover[data-cover-tone='paper'] { background: #ecece7; }
.projectCover[data-cover-tone='research'] { background: #e7e5ef; }
```

Implement the four layout recipes with the primary screen occupying 68–78 percent and the secondary screen 22–32 percent:

```css
.coverLead[data-cover-layout='primary-left'] .coverPrimary { left: 6%; top: 17%; width: 74%; }
.coverLead[data-cover-layout='primary-left'] .coverSecondary { right: 5%; bottom: 8%; width: 28%; z-index: 2; }
.coverLead[data-cover-layout='primary-right'] .coverPrimary { right: 6%; top: 17%; width: 74%; }
.coverLead[data-cover-layout='primary-right'] .coverSecondary { left: 5%; bottom: 8%; width: 28%; z-index: 2; }
.coverLead[data-cover-layout='desktop-mobile'] .coverPrimary { left: 6%; top: 16%; width: 76%; }
.coverLead[data-cover-layout='desktop-mobile'] .coverSecondary { right: 7%; bottom: 6%; width: 21%; max-height: 72%; z-index: 2; }
.coverLead[data-cover-layout='single'] .coverPrimary { left: 9%; top: 14%; width: 82%; }
```

For compact covers, center the primary screen at approximately 86 percent width and hide editorial labels. For micro covers, fill the tile with `project.image` when available, otherwise use the cover's primary image with `object-fit: cover`; keep the no-image `ProjectArt` fallback centered.

- [ ] **Step 5: Add interaction and responsive rules**

Preserve the existing action overlay and add restrained frame movement:

```css
.caseStudyMedia:is(:hover, :focus-visible) .coverPrimary { transform: scale(1.012); }
.caseStudyMedia:is(:hover, :focus-visible) .coverSecondary { transform: translateY(-5px); }
.compactProject:is(:hover, :focus-visible) .compactThumb .projectCover { transform: scale(1.018); }
.heroProjectTile:is(:hover, :focus-visible) > .projectCover { transform: scale(1.035); filter: saturate(.82); }

@media (max-width: 600px) {
  .caseStudyMedia .projectCover { aspect-ratio: 1.42; }
  .coverLead .coverPrimary { left: 5% !important; right: auto !important; top: 18%; width: 90% !important; }
  .coverSecondary { display: none; }
  .coverAnnotation { top: 12px; left: 14px; }
}

@media (prefers-reduced-motion: reduce) {
  .coverFrame, .projectCover { transition: none !important; }
}
```

Use layout-specific selectors rather than inline styles. Ensure deep `spatial` and `ink` stages give annotations and focus treatment sufficient contrast.

- [ ] **Step 6: Run the focused CSS test**

Run: `node --test --test-name-pattern="approved readable visual system" tests/presentation.test.mjs`

Expected: PASS.

- [ ] **Step 7: Run the full automated suite and temporary production build**

Run: `npm test`

Expected: all tests pass.

Run: `PORTFOLIO_BUILD_DIR=/tmp/jumin-portfolio-cover-build npm run build`

Expected: Vite and prerender complete without modifying tracked `dist`.

- [ ] **Step 8: Commit the editorial visual system**

```bash
git add src/portfolio/Portfolio.module.css tests/presentation.test.mjs
git commit -m "feat: style editorial project cover stages"
```

---

### Task 4: Browser QA And Final Polish

**Files:**
- Modify if required: `src/portfolio/Portfolio.module.css`
- Modify if required: `src/portfolio/ProjectCover.jsx`
- Modify if required: `tests/presentation.test.mjs`

**Interfaces:**
- Consumes: complete cover system from Tasks 1–3
- Produces: verified laptop, wide-desktop, and mobile homepage presentation with no broken media or layout regressions

- [ ] **Step 1: Start or reuse the local development server**

Run: `curl -I http://127.0.0.1:5173/`

Expected: HTTP 200. If unavailable, run `npm run dev -- --host 127.0.0.1` and keep the session alive through QA.

- [ ] **Step 2: Inspect the laptop layout around 1440 x 800**

Use the available browser UI tool to open `http://127.0.0.1:5173/#work` and verify:

- each lead cover shows one dominant real interface and one supporting artifact
- the full project screen can be understood without scrolling inside the cover
- no annotation covers important interface controls
- alternating text/media rows remain balanced
- the existing `View case study` action remains visible on hover and focus
- all nine hero index tiles remain recognizable

Capture a screenshot for visual comparison with the approved A direction.

- [ ] **Step 3: Inspect a wide desktop viewport**

Verify at approximately 1728 x 1000:

- cover compositions do not become sparse or oversized
- primary screens stay within the intended 68–78 percent range
- project-specific backgrounds remain varied but cohesive
- no image or frame exceeds its clickable media region

- [ ] **Step 4: Inspect a mobile viewport around 390 x 844**

Verify:

- primary screens occupy most of each cover
- secondary screens and long annotations are hidden
- there is no horizontal overflow
- text does not overlap project media
- project links, labels, and focus states remain usable

- [ ] **Step 5: Check runtime health**

Confirm the browser console has no errors or warnings caused by `ProjectCover`, and confirm there are no failed requests for cover assets or optimized derivatives.

- [ ] **Step 6: Apply only evidence-backed visual corrections**

If QA reveals a layout defect, first add or update the narrowest relevant assertion in `tests/presentation.test.mjs`, run it to confirm failure, then adjust only the responsible `ProjectCover` markup or CSS rule. Repeat QA for the affected viewport.

- [ ] **Step 7: Run final verification**

Run: `npm test`

Expected: all tests pass.

Run: `PORTFOLIO_BUILD_DIR=/tmp/jumin-portfolio-cover-build npm run build`

Expected: build and prerender pass.

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 8: Commit any QA corrections**

If Task 4 changed files:

```bash
git add src/portfolio/Portfolio.module.css src/portfolio/ProjectCover.jsx tests/presentation.test.mjs
git commit -m "fix: refine project covers across viewports"
```

If QA required no corrections, do not create an empty commit.
