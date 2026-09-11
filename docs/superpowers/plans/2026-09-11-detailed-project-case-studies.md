# Detailed Project Case Studies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the Honda and HAiLY case studies with source-backed process detail and replace the visible Studio.OS audit with an evidence-backed Blender MCP product-visualization case study.

**Architecture:** Keep project narratives data-driven in the existing JSON collections and add two small reusable case-study blocks for labeled details and inline flows. Preserve the existing case-study shell, route resolver, responsive image helper, and homepage layout; add a canonical Blender project plus a prerender-only compatibility alias for the former Studio.OS URL.

**Tech Stack:** React 18, Vite 5, CSS Modules, Node test runner, Blender 5 background rendering, existing Sharp image preparation script, supervised browser QA

**Spec:** `docs/superpowers/specs/2026-09-11-detailed-project-case-studies-design.md`

## Global Constraints

- Do not publish complete Figma or HAiLY decks.
- Do not publish HAiLY pages marked "Privileged and Confidential," demo credentials, identifiable records, or internal pilot metrics as Jumin's outcome.
- Keep the verified HAiLY outcome limited to the second-place USC & Techstars Startup Weekend result.
- Distinguish Jumin's Honda interface leadership from engineering work completed by the wider eight-person team.
- Label newly composed workflows and architecture explanations as retrospective reconstructions.
- Do not invent usability findings, implementation status, adoption, revenue impact, prompts, or iteration counts.
- Do not publish the editable Blender source file or attribute the generic Blender MCP add-on code to Jumin.
- Preserve the current homepage project count, two-column layout, evidence image dimensions, reduced-motion behavior, and case-study section navigation.
- Keep `/work/studio-os-audit/` functional as a compatibility alias while excluding it from visible collections, canonical metadata, and the sitemap.
- Do not edit generated `dist` output.
- Preserve unrelated working-tree changes and verify the exact staged diff before every commit.

---

## File Structure

- Create `src/portfolio/CaseStudyBlocks.jsx`: render reusable labeled detail lists and compact inline process flows.
- Modify `src/portfolio/CaseStudy.jsx`: render optional `section.details` and `section.flow` data.
- Modify `src/portfolio/Portfolio.module.css`: style the new blocks as ruled editorial content and keep them responsive.
- Modify `src/data/editorial.json`: expand Honda and HAiLY narratives and evidence mappings.
- Modify `src/data/internships.json`: replace the Studio.OS project record with the Blender product-visualization record.
- Modify `src/data/portfolio.js`: resolve the old Studio.OS path to the new canonical project and expose prerender-only legacy routes.
- Modify `src/portfolio/Home.jsx`: replace the Studio.OS supporting-project slug and title.
- Modify `src/portfolio/CaseStudy.jsx`: add the concise public display title for the Blender project.
- Modify `scripts/prerender.mjs`: generate the legacy path without including it in `sitemap.xml`.
- Create `scripts/render-blender-case.py`: render selected evidence frames from a supplied `.blend` path without modifying the source file.
- Create `tests/detailed-case-studies.test.mjs`: validate source-backed content, privacy exclusions, project replacement, assets, SSR output, and the legacy route.
- Modify `tests/internships.test.mjs`: replace obsolete Studio.OS expectations with Blender-project and alias expectations.
- Modify `tests/iya-projects.test.mjs`: validate the expanded Honda evidence set and narrative depth.
- Modify `tests/presentation.test.mjs`: update the expected homepage supporting-project order.
- Create `public/assets/projects/honda-sticky-notes.png`: selected deck evidence for native spatial notes.
- Create `public/assets/projects/honda-part-controls.png`: selected deck evidence for the HTTP/file-watcher bridge.
- Create `public/assets/projects/honda-space-conflict.png`: selected deck evidence for the Full Space/Shared Space conflict.
- Create `public/assets/projects/honda-presence-options.png`: selected deck evidence comparing occlusion approaches.
- Create `public/assets/projects/cup-noodle-frame-030.png`: early animation frame.
- Create `public/assets/projects/cup-noodle-frame-060.png`: middle animation frame and primary cover.
- Create `public/assets/projects/cup-noodle-frame-090.png`: late animation frame.
- Create `public/assets/projects/cup-noodle-scene-breakdown.png`: camera-view scene breakdown generated from the source scene.
- Regenerate `public/assets/optimized/manifest.json` and new WebP derivatives through `scripts/prepare-images.mjs`.

---

### Task 1: Add Reusable Detailed-Narrative Blocks

**Files:**
- Create: `src/portfolio/CaseStudyBlocks.jsx`
- Modify: `src/portfolio/CaseStudy.jsx`
- Modify: `src/portfolio/Portfolio.module.css`
- Create: `tests/detailed-case-studies.test.mjs`

**Interfaces:**
- Consumes: `section.details?: Array<{ label: string, body: string }>` and `section.flow?: { label: string, steps: Array<{ label: string, detail: string }>, caption: string }`
- Produces: `SectionDetails({ items })` with `data-detail-list="true"` and `SectionFlow({ flow })` with `data-section-flow="true"`

- [ ] **Step 1: Write the failing component test**

Create `tests/detailed-case-studies.test.mjs` with a server-rendered component contract:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { SectionDetails, SectionFlow } from '../src/portfolio/CaseStudyBlocks.jsx'

test('case-study detail and flow blocks preserve semantic reading order', () => {
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
})
```

- [ ] **Step 2: Run the focused test and confirm the missing-module failure**

Run: `node --test tests/detailed-case-studies.test.mjs`

Expected: FAIL with `Cannot find module '../src/portfolio/CaseStudyBlocks.jsx'`.

- [ ] **Step 3: Implement the semantic blocks**

Create `src/portfolio/CaseStudyBlocks.jsx`:

```jsx
import s from './Portfolio.module.css'

export function SectionDetails({ items = [] }) {
  if (!items.length) return null
  return <dl className={s.sectionDetails} data-detail-list="true">
    {items.map(item => <div key={item.label}>
      <dt>{item.label}</dt>
      <dd>{item.body}</dd>
    </div>)}
  </dl>
}

export function SectionFlow({ flow }) {
  if (!flow?.steps?.length) return null
  return <figure className={s.sectionFlow} data-section-flow="true">
    <span>{flow.label}</span>
    <ol>{flow.steps.map(step => <li key={step.label}>
      <strong>{step.label}</strong>
      <p>{step.detail}</p>
    </li>)}</ol>
    <figcaption>{flow.caption}</figcaption>
  </figure>
}
```

Import both functions in `CaseStudy.jsx` and render them inside `.storyContent`, after the section body and before `section.comparison`:

```jsx
<SectionDetails items={section.details} />
<SectionFlow flow={section.flow} />
```

- [ ] **Step 4: Add quiet editorial styling**

Add CSS rules that use full-width ruled rows rather than cards:

```css
.sectionDetails { margin-top: 32px; border-top: 1px solid var(--ink); }
.sectionDetails > div { display: grid; grid-template-columns: minmax(110px, 1fr) minmax(0, 3fr); gap: 24px; padding: 18px 0; border-bottom: 1px solid var(--line); }
.sectionDetails dt, .sectionFlow > span { color: var(--accent); font-size: 12px; font-weight: 600; }
.sectionDetails dd { font-size: 15px; line-height: 1.62; color: var(--muted); }
.sectionFlow { margin-top: 34px; }
.sectionFlow > ol { list-style: none; margin-top: 14px; padding: 0; border-top: 1px solid var(--ink); }
.sectionFlow li { display: grid; grid-template-columns: minmax(110px, 1fr) minmax(0, 3fr); gap: 24px; padding: 16px 0; border-bottom: 1px solid var(--line); }
.sectionFlow li strong { font-size: 14px; font-weight: 570; }
.sectionFlow li p { font-size: 15px; line-height: 1.62; color: var(--muted); }
.sectionFlow figcaption { margin-top: 10px; color: var(--muted); font-size: 12px; line-height: 1.55; }
```

Inside the existing `@media (max-width: 600px)` block, set both row layouts to `grid-template-columns: 1fr` and reduce their gap to `7px`.

- [ ] **Step 5: Run the component and existing presentation tests**

Run: `node --test tests/detailed-case-studies.test.mjs tests/presentation.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit only the narrative-block changes**

Review: `git diff -- src/portfolio/CaseStudyBlocks.jsx src/portfolio/CaseStudy.jsx src/portfolio/Portfolio.module.css tests/detailed-case-studies.test.mjs`

Commit message: `feat: add detailed case study narrative blocks`

---

### Task 2: Expand The Honda Spatial Design Review

**Files:**
- Modify: `src/data/editorial.json`
- Modify: `tests/detailed-case-studies.test.mjs`
- Modify: `tests/iya-projects.test.mjs`
- Create: `public/assets/projects/honda-sticky-notes.png`
- Create: `public/assets/projects/honda-part-controls.png`
- Create: `public/assets/projects/honda-space-conflict.png`
- Create: `public/assets/projects/honda-presence-options.png`

**Interfaces:**
- Consumes: Honda Figma deck slides 3, 5, 7, 13, 14–20, 22–32 and Task 1's `details`/`flow` schema
- Produces: an eight-section `honda-spatial` project with eight evidence images and explicit team-scope language

- [ ] **Step 1: Add failing Honda depth and attribution assertions**

Append to `tests/detailed-case-studies.test.mjs`:

```js
import { existsSync, readFileSync } from 'node:fs'
import { allProjects } from '../src/data/portfolio.js'

test('Honda explains platform constraints, workarounds, presence experiments and team scope', () => {
  const project = allProjects.find(item => item.slug === 'honda-spatial')
  assert.equal(project.sections.length, 8)
  const narrative = JSON.stringify(project)
  for (const term of ['Full Immersive Space', 'Shared Space', 'SwiftUI', 'file watcher', 'PeekABoo', 'Muse Pen', 'Gaussian']) {
    assert.match(narrative, new RegExp(term, 'i'))
  }
  assert.match(project.contribution, /interface design|interface direction/i)
  assert.match(project.contribution, /team/i)
  assert.equal(project.content.filter(block => block.type === 'image').length, 8)
  for (const block of project.content) {
    if (block.type === 'image') assert.ok(existsSync(new URL(`../public${block.src}`, import.meta.url)), block.src)
  }
})
```

- [ ] **Step 2: Run the Honda test and verify the section-count failure**

Run: `node --test --test-name-pattern="Honda explains" tests/detailed-case-studies.test.mjs`

Expected: FAIL because Honda currently has four sections and four images.

- [ ] **Step 3: Capture the four additional deck artifacts**

Use the open Figma deck in audience mode and capture only the slide canvas for:

- slide 5 → `honda-sticky-notes.png`
- slide 7 → `honda-part-controls.png`
- slide 13 → `honda-space-conflict.png`
- slide 14 → `honda-presence-options.png`

Exclude browser chrome and presentation controls. Preserve the complete diagram or prototype state, do not retouch labels, and save each file at a minimum width of 1600 px.

- [ ] **Step 4: Replace the Honda narrative with the approved eight-section sequence**

Use these exact IDs and titles in `src/data/editorial.json`:

```json
[
  { "id": "review-context", "title": "A shared review needed more than a shared model" },
  { "id": "interaction-gaps", "title": "Four gaps made ordinary review actions difficult" },
  { "id": "space-architecture", "title": "The collaboration model conflicted at the space level" },
  { "id": "spatial-notes", "title": "Native windows restored a basic review behavior" },
  { "id": "part-interaction", "title": "A local bridge made vehicle parts respond" },
  { "id": "presence-occlusion", "title": "Three presence models exposed different tradeoffs" },
  { "id": "review-toolkit", "title": "The interface brought review tools back to the vehicle" },
  { "id": "future-directions", "title": "The prototype clarified what the platform needs next" }
]
```

Include the verified deck facts from the spec. Give `space-architecture`, `spatial-notes`, and `presence-occlusion` either a `comparison`, `details`, or `flow` block. Keep `outcome` limited to documented constraints, prototypes, future directions, and the Honda R&D demonstration.

Map the existing four images and four new images to the section whose decision each supports. Set captions to describe what is visible and whether the graphic is a team slide or retrospective explanation.

- [ ] **Step 5: Run Honda and IYA tests**

Run: `node --test tests/detailed-case-studies.test.mjs tests/iya-projects.test.mjs`

Expected: PASS with one Honda project, eight sections, eight local evidence images, and Honda R&D in the documented outcome.

- [ ] **Step 6: Commit only Honda content and assets**

Review: `git diff -- src/data/editorial.json tests/detailed-case-studies.test.mjs tests/iya-projects.test.mjs` and `git status --short public/assets/projects/honda-*.png`.

Commit message: `feat: expand Honda spatial design review`

---

### Task 3: Build The Privacy-Safe HAiLY Case Study

**Files:**
- Modify: `src/data/editorial.json`
- Modify: `tests/detailed-case-studies.test.mjs`

**Interfaces:**
- Consumes: supplied HAiLY presentation and Task 1's `details`/`flow` schema
- Produces: a seven-section `haily` project with reconstructed workflow data and no published confidential slide images

- [ ] **Step 1: Add failing HAiLY structure and privacy tests**

Append:

```js
test('HAiLY turns billing research into a privacy-safe two-sided product story', () => {
  const project = allProjects.find(item => item.slug === 'haily')
  assert.equal(project.sections.length, 7)
  const publicText = JSON.stringify(project)
  for (const term of ['missed charge', 'three to four', 'FHIR', 'HL7', 'physician', 'administrator', 'second place']) {
    assert.match(publicText, new RegExp(term, 'i'))
  }
  for (const prohibited of ['Privileged and Confidential', '94%', 'demo password', '@gmail.com']) {
    assert.doesNotMatch(publicText, new RegExp(prohibited, 'i'))
  }
  assert.equal(project.content.filter(block => block.type === 'image').length, 0)
  assert.match(project.outcome, /second place/i)
  assert.doesNotMatch(project.outcome, /revenue|recovered|manual review time/i)
})
```

- [ ] **Step 2: Run the HAiLY test and verify the one-section failure**

Run: `node --test --test-name-pattern="HAiLY turns" tests/detailed-case-studies.test.mjs`

Expected: FAIL because HAiLY currently has one section.

- [ ] **Step 3: Expand HAiLY with seven source-backed sections**

Use these exact IDs and titles:

```json
[
  { "id": "missed-charge-workflow", "title": "A missed charge becomes a chain of manual follow-ups" },
  { "id": "administrative-friction", "title": "The work happens across lists, records and reminders" },
  { "id": "product-intervention", "title": "HAiLY sits inside the handoff rather than replacing it" },
  { "id": "service-architecture", "title": "The agent routes evidence to one accountable decision" },
  { "id": "two-sided-interface", "title": "Administrators and physicians need different levels of context" },
  { "id": "product-phases", "title": "The concept grows from recovery to prevention" },
  { "id": "pitch-and-result", "title": "Product UX connected the workflow to a viable pitch" }
]
```

Encode the current-state workflow as a `flow` with these steps: `Pending encounter`, `Administrator review`, `Record verification`, `Physician reminder`, `Charge submission`. Encode the service architecture as: `EHR / EMR`, `FHIR R4 / HL7`, `Audit / Detect / Route`, `Physician validation`, `Billing`. Add a three-item `details` block for retrospective recovery, real-time prevention, and continuous intelligence.

Use “three to four reminders” instead of an unsupported symbol-only statistic. State that the deck described the workflow; do not state that Jumin personally observed every step. Keep the first fact as `2nd / USC & Techstars Startup Weekend` and remove market-scale figures from the prominent facts row.

- [ ] **Step 4: Run the focused and complete content tests**

Run: `node --test tests/detailed-case-studies.test.mjs`

Expected: PASS with seven sections, no confidential source images, and no prohibited outcome claims.

Run: `npm test`

Expected: all current tests pass or only obsolete Studio.OS tests remain for Task 5.

- [ ] **Step 5: Commit the HAiLY content change**

Review: `git diff -- src/data/editorial.json tests/detailed-case-studies.test.mjs`.

Commit message: `feat: expand privacy-safe HAiLY case study`

---

### Task 4: Render Blender Evidence From The Source Scene

**Files:**
- Create: `scripts/render-blender-case.py`
- Create: `public/assets/projects/cup-noodle-frame-030.png`
- Create: `public/assets/projects/cup-noodle-frame-060.png`
- Create: `public/assets/projects/cup-noodle-frame-090.png`
- Create: `public/assets/projects/cup-noodle-scene-breakdown.png`
- Modify: `tests/detailed-case-studies.test.mjs`

**Interfaces:**
- Consumes: environment variable `BLENDER_CASE_SOURCE` pointing to `CupNoodle.blend`
- Produces: four 1600 x 900 PNG evidence images without saving changes back to the `.blend` file

- [ ] **Step 1: Add failing Blender-asset assertions**

Append:

```js
test('Blender case evidence uses portfolio-sized renders', () => {
  const names = [
    'cup-noodle-frame-030.png',
    'cup-noodle-frame-060.png',
    'cup-noodle-frame-090.png',
    'cup-noodle-scene-breakdown.png',
  ]
  for (const name of names) {
    assert.ok(existsSync(new URL(`../public/assets/projects/${name}`, import.meta.url)), name)
  }
})
```

- [ ] **Step 2: Run the asset test and confirm all four files are missing**

Run: `node --test --test-name-pattern="Blender case evidence" tests/detailed-case-studies.test.mjs`

Expected: FAIL on `cup-noodle-frame-030.png`.

- [ ] **Step 3: Create the deterministic Blender render helper**

Create `scripts/render-blender-case.py` for Blender's Python runtime:

```python
import os
from pathlib import Path
import bpy

source = os.environ.get("BLENDER_CASE_SOURCE")
if not source:
    raise RuntimeError("BLENDER_CASE_SOURCE must point to CupNoodle.blend")

output = Path(os.environ.get("BLENDER_CASE_OUTPUT", "public/assets/projects")).resolve()
output.mkdir(parents=True, exist_ok=True)
scene = bpy.context.scene
scene.render.engine = "BLENDER_EEVEE"
scene.render.resolution_x = 1600
scene.render.resolution_y = 900
scene.render.resolution_percentage = 100
scene.camera = bpy.data.objects["Camera"]

def render_frame(frame, filename):
    scene.frame_set(frame)
    bpy.ops.render.render()
    image = bpy.data.images["Render Result"]
    image.file_format = "PNG"
    image.filepath_raw = str(output / filename)
    image.save()

render_frame(30, "cup-noodle-frame-030.png")
render_frame(60, "cup-noodle-frame-060.png")
render_frame(90, "cup-noodle-frame-090.png")

scene.frame_set(60)
breakdown = bpy.data.materials.new("Portfolio Scene Breakdown")
breakdown.use_nodes = True
shader = breakdown.node_tree.nodes.get("Principled BSDF")
shader.inputs["Base Color"].default_value = (0.72, 0.76, 0.72, 1.0)
shader.inputs["Roughness"].default_value = 0.78
scene.view_layers[0].material_override = breakdown
render_frame(60, "cup-noodle-scene-breakdown.png")
scene.view_layers[0].material_override = None
```

The breakdown frame intentionally uses the same camera and scene state; its website caption will identify key scene groups in text rather than baking invented annotations into the source render.

- [ ] **Step 4: Render the four files**

Run:

```bash
BLENDER_CASE_SOURCE="/Users/sinjumin/Documents/Bubbas_Blender_MCP_Prototype/CupNoodle.blend" \
BLENDER_CASE_OUTPUT="/Users/sinjumin/Desktop/Jumin_portpolio/juminshin06.github.io/public/assets/projects" \
"/Applications/Blender.app/Contents/MacOS/Blender" \
  -b "/Users/sinjumin/Documents/Bubbas_Blender_MCP_Prototype/CupNoodle.blend" \
  --python scripts/render-blender-case.py
```

Expected: four 1600 x 900 PNG files. The missing archived `cup_label_baked.png` texture may leave the cup body unbranded; do not recreate or fabricate that missing production texture. Use the scene as process evidence and describe only what is visible.

- [ ] **Step 5: Inspect every render and rerun the asset test**

Open all four PNG files at original detail. Confirm that the frame is nonblank, the cup and animated environment are visible, and no Blender UI or private filesystem data appears.

Run: `node --test --test-name-pattern="Blender case evidence" tests/detailed-case-studies.test.mjs`

Expected: PASS.

- [ ] **Step 6: Commit the render helper and source-derived evidence**

Review the four asset sizes and `git diff -- scripts/render-blender-case.py tests/detailed-case-studies.test.mjs`.

Commit message: `feat: add Blender product visualization evidence`

---

### Task 5: Replace Studio.OS With The Blender Case Study And Preserve Its Old URL

**Files:**
- Modify: `src/data/internships.json`
- Modify: `src/data/portfolio.js`
- Modify: `src/portfolio/Home.jsx`
- Modify: `src/portfolio/CaseStudy.jsx`
- Modify: `scripts/prerender.mjs`
- Modify: `tests/detailed-case-studies.test.mjs`
- Modify: `tests/internships.test.mjs`
- Modify: `tests/presentation.test.mjs`

**Interfaces:**
- Produces: canonical project slug `ai-3d-product-visualization`
- Produces: `legacyRoutes = ['/work/studio-os-audit/']`
- Produces: `resolvePage('/work/studio-os-audit/')` returning the canonical Blender project
- Produces: `pageMetadata('/work/studio-os-audit/').path === '/work/ai-3d-product-visualization/'`

- [ ] **Step 1: Add failing project-replacement and alias tests**

Append:

```js
import { legacyRoutes, pageMetadata, resolvePage, routes } from '../src/data/portfolio.js'

test('Blender replaces Studio.OS publicly while preserving the old URL', () => {
  const project = allProjects.find(item => item.slug === 'ai-3d-product-visualization')
  assert.ok(project)
  assert.equal(allProjects.some(item => item.slug === 'studio-os-audit'), false)
  assert.equal(project.sections.length, 6)
  assert.match(JSON.stringify(project), /Blender MCP/i)
  assert.match(JSON.stringify(project), /120/)
  assert.equal(resolvePage('/work/studio-os-audit/').project.slug, project.slug)
  assert.equal(resolvePage('/work/ai-3d-product-visualization/').project.slug, project.slug)
  assert.ok(routes.includes('/work/ai-3d-product-visualization/'))
  assert.ok(!routes.includes('/work/studio-os-audit/'))
  assert.deepEqual(legacyRoutes, ['/work/studio-os-audit/'])
  assert.equal(pageMetadata('/work/studio-os-audit/').path, '/work/ai-3d-product-visualization/')
})
```

- [ ] **Step 2: Run the replacement test and verify the missing-project failure**

Run: `node --test --test-name-pattern="Blender replaces" tests/detailed-case-studies.test.mjs`

Expected: FAIL because the Studio.OS project is still public.

- [ ] **Step 3: Replace the internship record with the six-section Blender project**

Replace the `studio-os-audit` object in `src/data/internships.json` with:

- `id` and `slug`: `ai-3d-product-visualization`
- `title`: `Directing a 3D product scene through an AI-assisted workflow`
- `organization`: `Bubba's LA`
- `category`: `Experiment`
- `role`: `AI Research Intern / 3D prototyping`
- `status`: `120-frame Blender animation prototype`
- `image`: `/assets/projects/cup-noodle-frame-060.png`
- `cover.primary`: `/assets/projects/cup-noodle-frame-060.png`
- `cover.secondary`: `/assets/projects/cup-noodle-frame-090.png`
- `cover.tone`: `coral`
- `cover.layout`: `primary-left`
- `cover.primaryFrame` and `cover.secondaryFrame`: `plain`
- `cover.annotation`: `Blender MCP / 120 frames`

Use six sections with these IDs and titles:

```json
[
  { "id": "creative-brief", "title": "The brief called for a product world, not a single generated frame" },
  { "id": "scene-system", "title": "The scene was built as editable parts" },
  { "id": "mcp-workflow", "title": "MCP accelerated construction without replacing visual judgment" },
  { "id": "animation-construction", "title": "Motion was organized across a five-second sequence" },
  { "id": "art-direction", "title": "Each pass returned to hierarchy and legibility" },
  { "id": "final-output", "title": "The prototype preserved an editable path to the final image" }
]
```

Use details for `Product`, `Characters`, `Environment`, and `Motion`. Use a flow for `Direct`, `Inspect`, `Adjust`, and `Render`. State the verified 120 frames, 24 fps, 1920 x 1080 source setting, two cameras, and grouped animated elements. Do not state how many prompts or revisions occurred.

Map the four Blender images to `scene-system`, `animation-construction`, `art-direction`, and `final-output`. Explain in the contribution and captions that the archived external cup-label texture is unavailable, so the published render documents scene construction rather than claiming to be the final branded master.

- [ ] **Step 4: Implement canonical and compatibility routing**

In `src/data/portfolio.js`, add:

```js
const legacyProjectAliases = new Map([
  ['/work/studio-os-audit/', 'ai-3d-product-visualization'],
])
export const legacyRoutes = [...legacyProjectAliases.keys()]
```

After the canonical project lookup in `resolvePage`, resolve aliases by slug. Return the canonical project object. In `pageMetadata`, use `/work/${page.project.slug}/` as `path` for every project so the alias receives the canonical URL.

In `scripts/prerender.mjs`, render `[...routes, ...legacyRoutes, '/404.html']` but continue generating the sitemap from `routes` only.

- [ ] **Step 5: Update visible titles and homepage order**

Replace `studio-os-audit` with `ai-3d-product-visualization` in `Home.jsx`'s title map and supporting-project array. Use the visible title `3D product visualization` in both `Home.jsx` and `CaseStudy.jsx`.

Update the supporting order assertion in `tests/presentation.test.mjs`. Replace Studio.OS-specific internship assertions with canonical Blender and alias assertions, and remove tests that count the ten Studio.OS audit screens.

- [ ] **Step 6: Run routing, internship and presentation tests**

Run: `node --test tests/detailed-case-studies.test.mjs tests/internships.test.mjs tests/presentation.test.mjs tests/portfolio.test.mjs`

Expected: PASS; homepage and archive contain the Blender canonical link, the old path renders the Blender project, and the old path is absent from canonical `routes`.

- [ ] **Step 7: Commit the project replacement**

Review the exact diff across the seven modified source/test files and confirm no Studio.OS asset is deleted.

Commit message: `feat: replace Studio.OS with Blender case study`

---

### Task 6: Optimize Assets, Build, And Perform Visual QA

**Files:**
- Modify: `public/assets/optimized/manifest.json`
- Create: `public/assets/optimized/honda-*.webp`
- Create: `public/assets/optimized/honda-*-800.webp`
- Create: `public/assets/optimized/cup-noodle-*.webp`
- Create: `public/assets/optimized/cup-noodle-*-800.webp`

**Interfaces:**
- Consumes: all new PNG assets from Tasks 2 and 4
- Produces: responsive 1600 px and 800 px WebP variants resolved by `ProjectImage`

- [ ] **Step 1: Regenerate responsive image derivatives**

Load the workspace dependency paths and run the repository image script with its Sharp runtime:

```bash
node scripts/prepare-images.mjs --runtime-sharp=/Users/sinjumin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp
```

Expected: each new Honda and Cup Noodle source appears in `manifest.json` with positive width, height, and byte values for both variants.

- [ ] **Step 2: Run the complete automated suite**

Run: `npm test`

Expected: all tests pass.

- [ ] **Step 3: Run a production build outside tracked `dist`**

Run: `PORTFOLIO_BUILD_DIR=/tmp/jumin-portfolio-build npm run build`

Expected: Vite and prerender complete; canonical project pages plus the Studio.OS compatibility path are written. Confirm `sitemap.xml` contains `ai-3d-product-visualization` and does not contain `studio-os-audit`.

- [ ] **Step 4: Start or reuse the local Vite server**

Open the active local site and inspect:

- `/work/honda-spatial/`
- `/work/haily/`
- `/work/ai-3d-product-visualization/`
- `/work/studio-os-audit/`
- `/#work`

- [ ] **Step 5: Complete browser QA at three viewport classes**

At approximately 1440 x 800, wide desktop, and 390 x 844, verify:

- section headings and body text fit without overlap
- full images are visible without oversized vertical scrolling
- detail and flow rows stack cleanly on mobile
- section navigation wraps and updates `aria-current`
- Honda evidence is readable and not clipped
- HAiLY contains no confidential slide or credential text
- Blender frames are nonblank and retain aspect ratio
- the old Studio.OS path renders the Blender case and declares the Blender canonical path
- homepage shows eight supporting projects in the approved two-column desktop arrangement
- there is no horizontal overflow, console error, or broken local asset request

- [ ] **Step 6: Run final verification**

Run:

```bash
git diff --check
npm test
PORTFOLIO_BUILD_DIR=/tmp/jumin-portfolio-build npm run build
```

Expected: all commands succeed.

- [ ] **Step 7: Commit optimized derivatives and verified integration**

Inspect `git status --short`, stage only task-owned optimized derivatives and manifest changes, and review the staged diff.

Commit message: `perf: optimize detailed case study media`
