# Design Thinking Case Studies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the twelve homepage projects around an evidence-backed existing problem, the five Design Thinking stages, and a resolution that explains how the final design addressed the problem.

**Architecture:** Add one validated `designProcess` content contract and use it as the rendering source for the twelve in-scope projects while preserving existing section IDs and media assignments. Shared React components render the problem, stages, and resolution; existing project records, routes, covers, images, and archive behavior remain intact.

**Tech Stack:** React 18, Vite 5, CSS Modules, Node test runner, server-side static rendering

**Spec:** `docs/superpowers/specs/2026-09-19-design-thinking-case-studies-design.md`

## Global Constraints

- Apply the new structure to exactly the four lead projects and eight `More product work` projects shown on the homepage.
- Every in-scope project must expose `empathize`, `define`, `ideate`, `prototype`, and `test` exactly once and in that order.
- Every in-scope project must contain an existing problem and a resolution headed “How the design addressed the problem”.
- Do not invent participant counts, quotations, survey percentages, usability findings, clinical validation, stakeholder praise, or business impact.
- Preserve official titles, routes, project order, image paths, resources, and distinctions between individual and team contribution.
- Retrospective synthesis must be labeled; stakeholder review, technical validation, competition judging, publication, deployment, and production adoption must not be renamed user testing.
- Keep the current white paper, charcoal, gray, vermilion, Geist, ruled editorial layout, and image-led homepage.
- Do not edit generated `dist` output or introduce a new UI framework.

## Review Focus

- A process stage references an unknown section ID: retain its narrative but render no broken evidence container; test this in Task 1.
- A homepage project is missing or contains duplicate stage IDs: validation must report the project slug and invalid sequence; test this in Task 1.
- A concise legacy project has limited evidence: it must still render five short stages without empty labels or invented metrics; test this in Task 2.
- Sticky stage navigation on a small screen: it must scroll horizontally without increasing page width; test this in Task 5 and visual QA.
- Reduced-motion or server-rendered output: all process content must remain visible before animation; test this in Task 6.

---

## File Structure

- Create `src/portfolio/designProcess.js`: stage constants, process validation, evidence lookup, and navigation helpers.
- Create `tests/design-process.test.mjs`: data-contract and helper tests for all twelve projects.
- Modify `src/data/editorial.json`: process content for the four editorial featured projects, HAiLY, ARS Pharma, Story Authoring, and the three promoted legacy overrides.
- Modify `src/data/internships.json`: process content for PACEPOP, Swim Up Hill, and Bubba's Daily Target.
- Modify `src/data/portfolio.js`: preserve new process fields when legacy overrides are combined and export the homepage scope once.
- Modify `src/portfolio/CaseStudy.jsx`: render problem, fixed stage navigation, stage evidence, and resolution.
- Modify `src/portfolio/CaseStudyBlocks.jsx`: render process-stage text, problem metadata, and before/after resolution.
- Modify `src/portfolio/Home.jsx`: consume the shared homepage scope and add concise process cues.
- Modify `src/portfolio/Portfolio.module.css`: responsive editorial layouts for the problem, stages, resolution, and homepage cues.
- Modify `tests/case-study-narrative.test.mjs`: replace phase-grouping expectations with fixed process navigation expectations.
- Modify `tests/detailed-case-studies.test.mjs`: assert rendered problem, five stages, evidence, and resolution.
- Modify `tests/presentation.test.mjs`: assert homepage cues and responsive visual-system selectors.
- Modify `tests/portfolio.test.mjs`: update concise-project expectations for the three promoted homepage records without changing route or project preservation checks.

---

### Task 1: Define And Validate The Design Process Contract

**Files:**
- Create: `src/portfolio/designProcess.js`
- Create: `tests/design-process.test.mjs`
- Modify: `src/data/portfolio.js`

**Interfaces:**
- Produces: `DESIGN_STAGE_IDS`, `DESIGN_STAGE_LABELS`, `getDesignProcess(project)`, `validateDesignProcess(project)`, `buildDesignProcessNavigation(project)`, and `collectStageEvidence(project, stage)`.
- `validateDesignProcess(project)` returns an array of error strings and does not throw during rendering.
- `collectStageEvidence(project, stage)` returns image blocks whose `sectionId` is included in `stage.evidenceSectionIds`; unknown IDs return an empty contribution rather than an error.

- [ ] **Step 1: Write contract tests that fail before the helper exists**

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DESIGN_STAGE_IDS,
  buildDesignProcessNavigation,
  collectStageEvidence,
  validateDesignProcess,
} from '../src/portfolio/designProcess.js'

test('the stage contract uses the approved fixed order', () => {
  assert.deepEqual(DESIGN_STAGE_IDS, ['empathize', 'define', 'ideate', 'prototype', 'test'])
})

test('validation identifies incomplete and duplicate stage sequences', () => {
  const project = { slug: 'sample', designProcess: { problem: {}, stages: [
    { id: 'empathize' }, { id: 'define' }, { id: 'define' }, { id: 'prototype' },
  ], resolution: {} } }
  assert.deepEqual(validateDesignProcess(project), [
    'sample: expected empathize, define, ideate, prototype, test; received empathize, define, define, prototype',
    'sample: problem statement is required',
    'sample: resolution evidence is required',
  ])
})

test('stage evidence ignores unknown section ids and preserves image order', () => {
  const project = { content: [
    { type: 'image', sectionId: 'known', src: '/known.png' },
    { type: 'pdf', sectionId: 'known', src: '/file.pdf' },
  ] }
  assert.deepEqual(collectStageEvidence(project, { evidenceSectionIds: ['missing', 'known'] }), [
    { type: 'image', sectionId: 'known', src: '/known.png' },
  ])
})

test('navigation always contains five stages and resolution', () => {
  const stages = DESIGN_STAGE_IDS.map(id => ({ id, title: id }))
  assert.deepEqual(buildDesignProcessNavigation({ designProcess: { stages } }).map(item => item.id), [
    'empathize', 'define', 'ideate', 'prototype', 'test', 'resolution',
  ])
})
```

- [ ] **Step 2: Run the focused test and confirm the missing-module failure**

Run: `node --test tests/design-process.test.mjs`

Expected: FAIL because `src/portfolio/designProcess.js` does not exist.

- [ ] **Step 3: Implement the pure helper module**

```js
export const DESIGN_STAGE_IDS = ['empathize', 'define', 'ideate', 'prototype', 'test']
export const DESIGN_STAGE_LABELS = {
  empathize: 'Empathize',
  define: 'Define',
  ideate: 'Ideate',
  prototype: 'Prototype',
  test: 'Test',
}

export const getDesignProcess = project => project.designProcess || null

export function validateDesignProcess(project) {
  const process = getDesignProcess(project)
  if (!process) return [`${project.slug}: designProcess is required`]
  const received = (process.stages || []).map(stage => stage.id)
  const errors = []
  if (received.join(',') !== DESIGN_STAGE_IDS.join(',')) {
    errors.push(`${project.slug}: expected ${DESIGN_STAGE_IDS.join(', ')}; received ${received.join(', ')}`)
  }
  if (!process.problem?.statement) errors.push(`${project.slug}: problem statement is required`)
  if (!process.resolution?.evidence) errors.push(`${project.slug}: resolution evidence is required`)
  return errors
}

export const buildDesignProcessNavigation = project => [
  ...(project.designProcess?.stages || []).map(stage => ({ id: stage.id, label: DESIGN_STAGE_LABELS[stage.id] })),
  { id: 'resolution', label: 'Resolution' },
]

export const collectStageEvidence = (project, stage) => {
  const ids = new Set(stage.evidenceSectionIds || [])
  return (project.content || []).filter(block => block.type === 'image' && ids.has(block.sectionId))
}
```

- [ ] **Step 4: Export the homepage project scope from `portfolio.js`**

Define `homepageProjectSlugs` with the existing twelve-slug order and `homepageProjects` by filtering `allProjects`. Update `Home.jsx` later to consume these exports so the data test and UI cannot drift.

- [ ] **Step 5: Run the focused tests**

Run: `node --test tests/design-process.test.mjs tests/portfolio.test.mjs`

Expected: PASS with zero failures.

- [ ] **Step 6: Commit the contract**

```bash
git add src/portfolio/designProcess.js src/data/portfolio.js tests/design-process.test.mjs
git commit -m "feat: define design process contract"
```

---

### Task 2: Author Evidence-Backed Process Content For All Twelve Projects

**Files:**
- Modify: `src/data/editorial.json`
- Modify: `src/data/internships.json`
- Modify: `src/data/portfolio.js`
- Modify: `tests/design-process.test.mjs`
- Modify: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes: `homepageProjects` and `validateDesignProcess(project)` from Task 1.
- Produces: complete `designProcess` data on every homepage project and a short `processCue` for homepage display.

- [ ] **Step 1: Add failing coverage for all homepage records**

```js
import { homepageProjects } from '../src/data/portfolio.js'

test('all twelve homepage projects have a complete design process', () => {
  assert.equal(homepageProjects.length, 12)
  for (const project of homepageProjects) {
    assert.deepEqual(validateDesignProcess(project), [], project.slug)
    assert.equal(project.designProcess.stages.length, 5, project.slug)
    assert.ok(project.processCue?.includes('→'), `${project.slug}: process cue`)
  }
})

test('process claims avoid unsupported research proof', () => {
  const narrative = JSON.stringify(homepageProjects)
  for (const unsupported of [
    /\b\d+\s+(?:interviewees|participants|users)\b/i,
    /clinical(?:ly)? validated/i,
    /users (?:loved|preferred|praised)/i,
    /stakeholders? praised/i,
  ]) assert.doesNotMatch(narrative, unsupported)
})
```

- [ ] **Step 2: Run the data tests and confirm they fail for missing processes**

Run: `node --test tests/design-process.test.mjs`

Expected: FAIL and list the homepage projects without `designProcess`.

- [ ] **Step 3: Add the approved problem, evidence source, and result matrix**

Author the JSON from this matrix. Each row becomes `problem`, five `stages`, `resolution`, and `processCue` copy.

| Project | Existing problem | Empathize evidence | Test evidence | Resolution evidence | Process cue |
| --- | --- | --- | --- | --- | --- |
| Bubba's production | Footage, scripts, storyboards, voice-over and notes were organized clip by clip and did not scale | Production workflow and input review | Small prototype expanded inside production workflow | 10-video prototype to 300+ videos per automated batch; adopted for production | `Scattered inputs → production system` |
| PACEPOP | Short-lived running groups were forced into permanent chats and contact exchange | Temporary-group, identity and safety scenarios in existing project research | Host and Runner prototype walkthroughs | Interactive two-person prototype covering QR entry, run coordination and safety states | `Temporary needs → testable run flow` |
| Honda | A shared vehicle model did not provide a shared spatial review workflow | Reviewer actions and visionOS/Omniverse constraints | Native-window, local-bridge and presence prototypes; R&D demonstration | Working review interactions and documented platform directions shown to Honda R&D | `Platform constraints → spatial toolkit` |
| Ethicon | Wound evidence, terminology and rationale were separated across assessment steps | Clinician and industry-researcher input documented in the collaboration | Cross-functional prototype review | Traceable clinician-facing assessment prototype; not clinically validated | `Fragmented context → traceable assessment` |
| Swim Up Hill | Families, schools, volunteers, donors and partners needed clearer routes through one nonprofit site | Stakeholder and audience-path review from project materials | Published-site review across key paths | Live website published at swimuphill.org | `Many audiences → clear web journeys` |
| HAiLY | Missed charges required recovery work across physician and billing workflows | Hospital charge workflow and stakeholder-role analysis | Hackathon judging and workflow prototype review | Two-sided service concept won second place | `Missed charge → traceable human decision` |
| ARS Pharma | Campus anaphylaxis response depended on awareness, access and bystander action happening together | Campus emergency scenarios and access-point mapping | Industry Challenge Sprint review | Integrated service, package and interface proposal | `Emergency gaps → connected response` |
| Story Authoring | Non-programmers needed structure for branching stories with generative models | Related-work and authoring-model review | Research publication review | Creator-facing prototype and ICIDS/KIISE publications | `Authoring complexity → structured co-creation` |
| Daily Target | A large professional network did not identify the next useful business-development action | Existing connection data and daily decision workflow | Working dashboard review and internship handoff | Ranked daily target with capability and introduction context | `Network overload → one daily priority` |
| Learning Mobility | An autonomous-mobility concept needed to communicate learning, presence and use context | Preserved scenario and concept artifacts | Concept presentation review | Industry-academia design concept | `Mobility scenario → tangible concept` |
| Samsung Podcast | Job-seeking podcast discovery needed clearer relevance and navigation | Preserved industry-academia research boards and interface artifacts | Interface-state review in the project deliverable | Research concept and mobile interface proposal | `Listener context → clearer discovery` |
| B4Q4 | A widget contribution needed to fit an existing mobile ecosystem and internship scope | Existing product constraints and preserved design artifacts | Internal design handoff represented by the preserved contribution | Documented internship UX contribution | `System constraints → focused widget UX` |

- [ ] **Step 4: Author each stage with concrete activity, insight, and decision copy**

For each project, write all five stage objects. Use existing section IDs in `evidenceSectionIds`; do not rename content image records. `Define` must contain the focused problem statement or success criteria, `Ideate` must name alternatives or opportunity directions, `Prototype` must describe tangible behavior, and `Test` must name the exact evaluation form from the matrix.

- [ ] **Step 5: Promote the three legacy homepage projects without duplicating records**

Extend `editorial.archiveOverrides` for `proj-010`, `proj-006`, and `proj-002` with `designProcess`, `processCue`, `caseStudyMode: "detailed"`, and authored introductory fields. Update the `archived` merge in `portfolio.js` so an override's authored `sections`, `facts`, `resources`, `contribution`, and `outcome` win over concise defaults when present.

- [ ] **Step 6: Update preservation expectations**

Change the concise-project test from a hard-coded count of thirteen to assertions that non-homepage archive records remain concise while Learning Mobility, Samsung Podcast, and B4Q4 are detailed and process-driven. Preserve the total project count, routes, IDs, and media checks.

- [ ] **Step 7: Run data and preservation tests**

Run: `node --test tests/design-process.test.mjs tests/portfolio.test.mjs tests/internships.test.mjs tests/detailed-case-studies.test.mjs`

Expected: PASS with zero failures and no missing local media.

- [ ] **Step 8: Commit the content migration**

```bash
git add src/data/editorial.json src/data/internships.json src/data/portfolio.js tests/design-process.test.mjs tests/portfolio.test.mjs tests/internships.test.mjs tests/detailed-case-studies.test.mjs
git commit -m "feat: author design thinking case studies"
```

---

### Task 3: Render The Existing Problem And Fixed Process Navigation

**Files:**
- Modify: `src/portfolio/CaseStudy.jsx`
- Modify: `src/portfolio/CaseStudyBlocks.jsx`
- Modify: `src/portfolio/caseStudyNarrative.js`
- Modify: `tests/case-study-narrative.test.mjs`
- Modify: `tests/detailed-case-studies.test.mjs`

**Interfaces:**
- Consumes: `project.designProcess`, `buildDesignProcessNavigation(project)`, and the existing active-section scroll logic.
- Produces: `ProblemStatement`, `ProcessStage`, and `Resolution` React components with stable `data-*` hooks for tests and QA.

- [ ] **Step 1: Write failing static-render tests**

```js
test('a homepage case study renders the problem and fixed process navigation', async () => {
  const html = render('/work/honda-spatial/')
  assert.match(html, /data-existing-problem="true"/)
  assert.match(html, /How might we/)
  const nav = html.slice(html.indexOf('data-process-navigation="true"'), html.indexOf('</nav>', html.indexOf('data-process-navigation="true"')))
  assert.deepEqual([...nav.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map(match => match[1]), [
    'Empathize', 'Define', 'Ideate', 'Prototype', 'Test', 'Resolution',
  ])
})
```

Update helper tests so `getHashSectionId`, `findActiveSectionId`, and `getProjectFacts` remain covered while old arbitrary phase-grouping assertions are removed.

- [ ] **Step 2: Run the focused tests and confirm missing markup failures**

Run: `node --test tests/case-study-narrative.test.mjs tests/detailed-case-studies.test.mjs`

Expected: FAIL because problem and fixed navigation markup are absent.

- [ ] **Step 3: Add semantic process blocks**

Add these component signatures to `CaseStudyBlocks.jsx`:

```jsx
export function ProblemStatement({ problem })
export function ProcessStage({ stage, index, children })
export function Resolution({ resolution, status })
```

`ProblemStatement` renders context, friction, consequence, and an H2 problem statement. `ProcessStage` renders a numbered label plus activity, insight, and decision without empty rows. `Resolution` renders Before, Design response, After, Evidence, and Reflection in semantic definition lists and paragraphs.

- [ ] **Step 4: Replace section-derived navigation in `CaseStudy.jsx`**

Use `buildDesignProcessNavigation(project)`. Observe IDs `problem`, all five stage IDs, and `resolution`. Preserve deep-link settling after preceding images load and `aria-current="location"` behavior.

- [ ] **Step 5: Render the problem between contribution and process navigation**

Place `<ProblemStatement problem={project.designProcess.problem} />` before the stage body. Keep role, timeline, outcome, team, primary links, and hero media unchanged.

- [ ] **Step 6: Run focused rendering tests**

Run: `node --test tests/case-study-narrative.test.mjs tests/detailed-case-studies.test.mjs`

Expected: PASS with six ordered navigation links and semantic problem markup.

- [ ] **Step 7: Commit the problem and navigation renderer**

```bash
git add src/portfolio/CaseStudy.jsx src/portfolio/CaseStudyBlocks.jsx src/portfolio/caseStudyNarrative.js tests/case-study-narrative.test.mjs tests/detailed-case-studies.test.mjs
git commit -m "feat: render design process navigation"
```

---

### Task 4: Integrate Stage Evidence And Resolution

**Files:**
- Modify: `src/portfolio/CaseStudy.jsx`
- Modify: `src/portfolio/CaseStudyBlocks.jsx`
- Modify: `tests/detailed-case-studies.test.mjs`

**Interfaces:**
- Consumes: `collectStageEvidence(project, stage)` and the `ProcessStage`/`Resolution` components from Tasks 1 and 3.
- Produces: evidence grids tied to the five stage IDs and a closing section headed “How the design addressed the problem”.

- [ ] **Step 1: Add failing evidence and resolution tests**

```js
test('design evidence follows the stage claim and the case closes the loop', async () => {
  const html = render('/work/honda-spatial/')
  for (const id of ['empathize', 'define', 'ideate', 'prototype', 'test']) {
    assert.match(html, new RegExp(`id="${id}"[^>]*data-design-stage="${id}"`))
  }
  assert.match(html, /data-process-evidence="prototype"/)
  assert.match(html, /id="resolution"/)
  assert.match(html, /How the design addressed the problem/)
  for (const label of ['Before', 'Design response', 'After', 'Evidence', 'Reflection']) {
    assert.match(html, new RegExp(`>${label}<`))
  }
})

test('a concise-source homepage project renders five stages without empty content', async () => {
  const html = render('/work/b4q4-widgets/')
  assert.equal((html.match(/data-design-stage=/g) || []).length, 5)
  assert.doesNotMatch(html, /undefined|null|>\s*<\/dd>/)
})
```

- [ ] **Step 2: Run tests and confirm the stage renderer failure**

Run: `node --test tests/detailed-case-studies.test.mjs`

Expected: FAIL because the new process evidence and resolution are not rendered.

- [ ] **Step 3: Reuse the existing evidence figure behavior by stage**

For each process stage, call `collectStageEvidence(project, stage)` and render the existing `EvidenceFigure`. Keep slide, browser, phone-pair, phone-quad, and phone-gallery layout detection. Set `data-process-evidence={stage.id}` on the grid and retain full-size links and captions.

- [ ] **Step 4: Render resources, facts, and verified resolution after the stages**

Keep non-image resources and factual metric lists after the five stages. Replace the generic outcome block for process-driven projects with `<Resolution resolution={project.designProcess.resolution} status={project.status} />`. Continue using the existing outcome fallback only for out-of-scope archive projects.

- [ ] **Step 5: Remove duplicated process diagram output on migrated projects**

Do not render `project.diagram` when `designProcess` exists because its content is absorbed into Ideate and Prototype. Preserve diagrams on out-of-scope projects.

- [ ] **Step 6: Run detailed-case and asset tests**

Run: `node --test tests/detailed-case-studies.test.mjs tests/portfolio.test.mjs`

Expected: PASS with existing evidence counts, paths, and full-size links preserved.

- [ ] **Step 7: Commit evidence integration**

```bash
git add src/portfolio/CaseStudy.jsx src/portfolio/CaseStudyBlocks.jsx tests/detailed-case-studies.test.mjs
git commit -m "feat: connect process stages to evidence"
```

---

### Task 5: Style The Editorial Process And Homepage Cues

**Files:**
- Modify: `src/portfolio/Home.jsx`
- Modify: `src/portfolio/Portfolio.module.css`
- Modify: `tests/presentation.test.mjs`

**Interfaces:**
- Consumes: `homepageProjects`, `project.processCue`, and the process markup from Tasks 3 and 4.
- Produces: `.problemStatement`, `.processStage`, `.processStageIndex`, `.processStageNarrative`, `.processResolution`, `.processComparison`, and `.projectProcessCue` styles.

- [ ] **Step 1: Add failing homepage and stylesheet assertions**

```js
test('homepage cards expose one concise process transition', async () => {
  const html = render('/')
  assert.equal((html.match(/data-project-process-cue="true"/g) || []).length, 12)
  assert.match(html, /Scattered inputs → production system/)
  assert.match(html, /Platform constraints → spatial toolkit/)
})

test('process layouts use open editorial grids at desktop and mobile', () => {
  const css = readFileSync(new URL('../src/portfolio/Portfolio.module.css', import.meta.url), 'utf8')
  assert.match(css, /\.problemStatement\s*{[^}]*display:\s*grid/s)
  assert.match(css, /\.processStage\s*{[^}]*grid-template-columns:\s*repeat\(12,/s)
  assert.match(css, /\.processComparison\s*{[^}]*border-top:/s)
  assert.doesNotMatch(css, /\.processStage\s*{[^}]*border-radius:/s)
  assert.match(css, /@media\s*\(max-width:\s*600px\)[\s\S]*?\.processStage\s*{[^}]*grid-template-columns:\s*1fr/s)
})
```

- [ ] **Step 2: Run presentation tests and confirm failures**

Run: `node --test tests/presentation.test.mjs`

Expected: FAIL because process cues and styles do not exist.

- [ ] **Step 3: Add homepage process cues without changing project count or grid**

Import `homepageProjects` instead of recreating a slug map in `Home.jsx`. Render `<span className={s.projectProcessCue} data-project-process-cue="true">{project.processCue}</span>` on all four lead captions and all eight More Product Work captions. Preserve four columns above 1200px, two below 1200px, and one below 760px.

- [ ] **Step 4: Implement the open editorial problem and stage layouts**

Use thin top rules, large stage numerals, readable 680–760px text measures, and existing evidence variants. Avoid stage cards, rounded containers, pills, gradients, shadows, and nested panels. Make the problem statement visually dominant after the hero and keep the five stages distinct through spacing and numbering.

- [ ] **Step 5: Implement the resolution before/after line**

Use an open two-column comparison above 760px and a stacked layout below it. The directional cue uses the existing Lucide arrow or a CSS rule; do not use a text arrow as a decorative control. Evidence and reflection stay below at body scale.

- [ ] **Step 6: Add responsive and reduced-motion protections**

Ensure `.caseToc` has `max-width: 100%`, horizontal overflow only, and no page-level overflow. Stack stage rails and evidence on mobile, preserve current phone screenshot proportions, and keep all content visible in the existing `prefers-reduced-motion` rules.

- [ ] **Step 7: Run presentation and project tests**

Run: `node --test tests/presentation.test.mjs tests/detailed-case-studies.test.mjs`

Expected: PASS with twelve cues, five stage layouts, and no homepage order regressions.

- [ ] **Step 8: Commit the visual system**

```bash
git add src/portfolio/Home.jsx src/portfolio/Portfolio.module.css tests/presentation.test.mjs tests/detailed-case-studies.test.mjs
git commit -m "style: present project design processes"
```

---

### Task 6: Verify Every Route And The Representative Visual States

**Files:**
- Modify only when verification reveals a defect in files owned by Tasks 1–5.

**Interfaces:**
- Consumes: the completed source, tests, static generator, and local Vite server.
- Produces: verified desktop/mobile rendering for all twelve project routes and a clean production build.

- [ ] **Step 1: Run the full automated suite**

Run: `npm test`

Expected: all Node tests pass with zero failures.

- [ ] **Step 2: Build outside tracked `dist`**

Run: `PORTFOLIO_BUILD_DIR=/tmp/jumin-portfolio-build npm run build`

Expected: Vite and prerender complete successfully; every route is emitted to `/tmp/jumin-portfolio-build`.

- [ ] **Step 3: Check the working tree and generated-file boundary**

Run: `git status --short && git diff --check`

Expected: no `dist` changes, no whitespace errors, and only intentional source/test edits if a visual fix remains uncommitted.

- [ ] **Step 4: Start the local server and inspect all twelve routes in the in-app browser**

Run: `npm run dev -- --host 127.0.0.1`

Visit the twelve `/work/<slug>/` routes. On every page confirm: existing problem appears before design stages; navigation order is fixed; five stage headings and evidence load; resolution closes the loop; no console error or missing image appears.

- [ ] **Step 5: Capture representative desktop screenshots**

Capture the homepage, `/work/honda-spatial/`, and `/work/b4q4-widgets/` at approximately 1440px wide. Honda verifies the deepest evidence layout; B4Q4 verifies limited-source content; homepage verifies all twelve process cues.

- [ ] **Step 6: Capture representative mobile screenshots**

Capture the same three pages at approximately 390×844. Confirm the portrait layout remains intact, sticky navigation scrolls instead of widening the page, stage headings do not overlap, evidence stays legible, and resolution stacks in reading order.

- [ ] **Step 7: Inspect screenshots with `view_image` and record the fidelity ledger**

Compare at least these points against the approved design: problem hierarchy, six-item navigation, five-stage continuity, evidence-to-claim proximity, open before/after resolution, homepage grid, mobile text wrapping, and lack of invented proof language. Fix every material mismatch and recapture affected screens.

- [ ] **Step 8: Re-run full verification after visual fixes**

Run: `npm test && PORTFOLIO_BUILD_DIR=/tmp/jumin-portfolio-build npm run build && git diff --check`

Expected: zero test failures, successful build, and no whitespace errors.

- [ ] **Step 9: Commit final verified fixes**

```bash
git add src tests
git commit -m "fix: polish design process case studies"
```

Skip this commit only when Step 7 required no source changes.
