# Editorial Case Study System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild every portfolio project page around a readable editorial UX Design Engineering narrative while preserving the existing palette, verified project facts, routes, and image assets.

**Architecture:** Add a small pure narrative-model module that normalizes project mode, facts, phase labels, and phase navigation. Keep page rendering data-driven through `CaseStudy.jsx` and focused primitives in `CaseStudyBlocks.jsx`; extend existing JSON with optional authored introduction, phase, and lead-copy fields so the ten detailed projects receive richer pacing while thirteen archive projects retain concise fallbacks.

**Tech Stack:** React 18, Vite 5 SSR/prerendering, CSS Modules, Node test runner, existing `ProjectImage` responsive media system

**Spec:** `docs/superpowers/specs/2026-09-13-editorial-case-study-system-design.md`

## Global Constraints

- Preserve the existing near-white paper, charcoal ink, muted gray, vermilion accent, and self-hosted Geist typeface.
- Do not add a UI framework or new runtime dependency.
- Do not invent outcomes, usability findings, metrics, adoption, ownership, or production status.
- Preserve official organization, employment, publication, and award names.
- Distinguish Jumin's individual contribution from team output.
- Label retrospective diagrams and reconstructed workflows clearly.
- Keep all project rendering data-driven; do not branch on project slugs in React.
- Keep presentation slides complete with `object-fit: contain` and preserve full-size image links.
- Keep direct links, index aliases, browser back behavior, prerendered routes, and GitHub Pages deployment intact.
- Preserve live reduced-motion preference support and semantic heading order.
- Do not edit generated `dist` output.
- Preserve unrelated working-tree changes and stage only files changed by the active task.

---

### Task 1: Narrative Model And Contract

**Files:**
- Create: `src/portfolio/caseStudyNarrative.js`
- Create: `tests/case-study-narrative.test.mjs`
- Modify: `src/data/portfolio.js`

**Interfaces:**
- Consumes: project objects with optional `caseStudyMode`, `introLead`, `introSupport`, `descriptors`, section `phase`, and section `lead` fields.
- Produces: `getCaseStudyMode(project)`, `getProjectFacts(project)`, `getSectionPhase(section, mode)`, and `buildPhaseNavigation(sections, mode)`.

- [ ] **Step 1: Write failing tests for the narrative defaults and phase grouping**

Create `tests/case-study-narrative.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  buildPhaseNavigation,
  getCaseStudyMode,
  getProjectFacts,
  getSectionPhase,
} from '../src/portfolio/caseStudyNarrative.js'

test('narrative model distinguishes detailed and concise projects', () => {
  assert.equal(getCaseStudyMode({ caseStudyMode: 'detailed' }), 'detailed')
  assert.equal(getCaseStudyMode({ caseStudyMode: 'concise' }), 'concise')
  assert.equal(getCaseStudyMode({}), 'concise')
})

test('project facts use the approved editorial order and skip empty values', () => {
  assert.deepEqual(getProjectFacts({
    role: 'UI lead', duration: 'Feb - May 2026', status: 'Prototype', team: '',
  }), [
    { label: 'Role', value: 'UI lead' },
    { label: 'Timeline', value: 'Feb - May 2026' },
    { label: 'Outcome', value: 'Prototype' },
  ])
})

test('section phases are explicit for detailed work and safe for concise work', () => {
  assert.equal(getSectionPhase({ phase: 'Problem' }, 'detailed'), 'Problem')
  assert.equal(getSectionPhase({ title: 'Context' }, 'detailed'), 'Process')
  assert.equal(getSectionPhase({ title: 'Context' }, 'concise'), 'Project overview')
})

test('phase navigation groups contiguous sections with the same phase', () => {
  assert.deepEqual(buildPhaseNavigation([
    { id: 'context', phase: 'Context' },
    { id: 'gap-one', phase: 'Problem' },
    { id: 'gap-two', phase: 'Problem' },
    { id: 'response', phase: 'Design response' },
  ], 'detailed'), [
    { id: 'context', label: 'Context', sectionIds: ['context'] },
    { id: 'gap-one', label: 'Problem', sectionIds: ['gap-one', 'gap-two'] },
    { id: 'response', label: 'Design response', sectionIds: ['response'] },
  ])
  assert.deepEqual(buildPhaseNavigation([{ id: 'context', title: 'Context' }], 'concise'), [])
})
```

- [ ] **Step 2: Run the focused test and confirm the missing-module failure**

Run: `node --test tests/case-study-narrative.test.mjs`

Expected: FAIL because `src/portfolio/caseStudyNarrative.js` does not exist.

- [ ] **Step 3: Implement the pure narrative helpers**

Create `src/portfolio/caseStudyNarrative.js`:

```js
export const getCaseStudyMode = project => project.caseStudyMode === 'detailed' ? 'detailed' : 'concise'

export const getProjectFacts = project => [
  ['Role', project.role],
  ['Timeline', project.duration],
  ['Outcome', project.status],
  ['Team', project.team],
].filter(([, value]) => Boolean(value)).map(([label, value]) => ({ label, value }))

export const getSectionPhase = (section, mode) => section.phase || (mode === 'detailed' ? 'Process' : 'Project overview')

export function buildPhaseNavigation(sections = [], mode = 'concise') {
  if (mode !== 'detailed') return []
  return sections.reduce((groups, section) => {
    const label = getSectionPhase(section, mode)
    const previous = groups.at(-1)
    if (previous?.label === label) previous.sectionIds.push(section.id)
    else groups.push({ id: section.id, label, sectionIds: [section.id] })
    return groups
  }, [])
}
```

In `src/data/portfolio.js`, make the archive adapter explicit:

```js
caseStudyMode: 'concise',
sections: [{ id: 'context', phase: 'Project overview', title: 'The project in context', body: edit.summary }],
```

- [ ] **Step 4: Run focused and portfolio tests**

Run: `node --test tests/case-study-narrative.test.mjs tests/portfolio.test.mjs`

Expected: PASS.

- [ ] **Step 5: Commit the narrative contract**

```bash
git add src/portfolio/caseStudyNarrative.js src/data/portfolio.js tests/case-study-narrative.test.mjs
git commit -m "feat: add case study narrative model"
```

### Task 2: Editorial Header And Project Facts

**Files:**
- Modify: `src/portfolio/CaseStudy.jsx`
- Modify: `src/portfolio/CaseStudyBlocks.jsx`
- Modify: `src/portfolio/Portfolio.module.css`
- Modify: `tests/presentation.test.mjs`

**Interfaces:**
- Consumes: Task 1's `getCaseStudyMode(project)` and `getProjectFacts(project)`; optional `project.introLead`, `project.introSupport`, and `project.descriptors`.
- Produces: `NarrativeCopy`, `NarrativeHeading`, an editorial project header marked with `data-case-study-mode`, and a fact list marked with `data-project-facts`.

- [ ] **Step 1: Add a failing SSR test for the header hierarchy**

Add to `tests/presentation.test.mjs`:

```js
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
```

- [ ] **Step 2: Run the focused test and confirm it fails on missing editorial markers**

Run: `node --test --test-name-pattern="editorial introduction" tests/presentation.test.mjs`

Expected: FAIL because the current header has no mode, lead, descriptor, or fact markers.

- [ ] **Step 3: Add structured heading and copy primitives**

Extend `src/portfolio/CaseStudyBlocks.jsx`:

```jsx
export function NarrativeHeading({ as: Tag = 'h2', children, accent }) {
  return <Tag>{children}{accent ? <> <span className={s.narrativeAccent}>{accent}</span></> : null}</Tag>
}

export function NarrativeCopy({ lead, body, className = '' }) {
  if (!lead && !body) return null
  return <p className={className} data-narrative-copy="true">
    {lead ? <strong>{lead}</strong> : null}
    {lead && body ? ' ' : null}
    {body ? <span>{body}</span> : null}
  </p>
}
```

The `accent` value must be a separate authored phrase. Do not search or split the heading string.

- [ ] **Step 4: Rebuild the case-study introduction**

In `src/portfolio/CaseStudy.jsx`:

- import `getCaseStudyMode` and `getProjectFacts`
- set `const mode = getCaseStudyMode(project)` and `const projectFacts = getProjectFacts(project)`
- add `data-case-study-mode={mode}` to the article
- retain the organization overline and current title
- replace the single summary paragraph with `NarrativeCopy`, using `introLead || summary` and optional `introSupport`
- render up to three descriptors in a plain list marked `data-project-descriptors="true"`
- render the facts from `projectFacts` in the approved Role, Timeline, Outcome, Team order
- remove the duplicate contribution from the right side of the intro and keep the existing dedicated contribution panel available after the visual

- [ ] **Step 5: Apply the header typography and fact grid**

In `Portfolio.module.css`:

```css
.casePage { --case-reading-width: 760px; }
.caseIntro { display: block; max-width: 1120px; }
.caseHeader h1 { max-width: 900px; font-size: 62px; line-height: 1.04; font-weight: 620; }
.caseSummary { max-width: var(--case-reading-width); font-size: 18px; line-height: 1.65; color: var(--muted); }
.caseSummary strong { color: var(--ink); font-weight: 620; }
.caseSummary span { color: var(--muted); }
.caseDescriptors { display: flex; flex-wrap: wrap; gap: 8px 16px; margin-top: 22px; }
.caseDescriptors li { color: var(--accent); font-size: 12px; font-weight: 560; }
.caseMetadata { max-width: 900px; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 34px 72px; border-top: 0; }
.caseMetadata dt { color: var(--accent); font-size: 12px; font-weight: 600; text-transform: uppercase; }
.caseMetadata dd { max-width: 42ch; font-size: 16px; line-height: 1.55; }
```

At 600 px and below, set the title to 38 px, summary to 17 px, and facts to one column.

- [ ] **Step 6: Run the focused presentation test**

Run: `node --test --test-name-pattern="editorial introduction" tests/presentation.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit the editorial header**

```bash
git add src/portfolio/CaseStudy.jsx src/portfolio/CaseStudyBlocks.jsx src/portfolio/Portfolio.module.css tests/presentation.test.mjs
git commit -m "feat: redesign case study introductions"
```

### Task 3: Phase Navigation And Narrative Sections

**Files:**
- Modify: `src/portfolio/CaseStudy.jsx`
- Modify: `src/portfolio/Portfolio.module.css`
- Modify: `tests/presentation.test.mjs`

**Interfaces:**
- Consumes: Task 1's `buildPhaseNavigation` and `getSectionPhase`; Task 2's `NarrativeHeading` and `NarrativeCopy`.
- Produces: unique phase links marked with `data-phase-navigation`, section labels marked with `data-story-phase`, and active phase mapping across grouped section IDs.

- [ ] **Step 1: Add failing SSR assertions for phases and concise fallback**

Add to `tests/presentation.test.mjs`:

```js
test('case study navigation exposes authored phases without numeric section headings', async () => {
  const server = await createServer({ server: { middlewareMode: true, ws: false }, appType: 'custom', logLevel: 'error' })
  try {
    const { render } = await server.ssrLoadModule('/src/entry-server.jsx')
    const detailed = render('/work/honda-spatial/')
    assert.match(detailed, /data-phase-navigation="true"/)
    assert.match(detailed, /data-story-phase="Problem"/)
    assert.match(detailed, /data-story-phase="Design response"/)
    assert.doesNotMatch(detailed, /class="[^"]*storyHeading[^"]*">\s*<span>0[1-9]<\/span>/)
    const concise = render('/work/newegg/')
    assert.match(concise, /data-case-study-mode="concise"/)
    assert.doesNotMatch(concise, /data-phase-navigation="true"/)
    assert.match(concise, /data-story-phase="Project overview"/)
  } finally { await server.close() }
})
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run: `node --test --test-name-pattern="authored phases" tests/presentation.test.mjs`

Expected: FAIL because current pages render numbered headings and the full section list.

- [ ] **Step 3: Replace section-list navigation with grouped phase navigation**

In `CaseStudy.jsx`:

```jsx
const phaseNavigation = useMemo(() => buildPhaseNavigation(project.sections, mode), [project.sections, mode])
const activePhase = phaseNavigation.find(item => item.sectionIds.includes(activeSection))
```

Render the nav only when `phaseNavigation.length > 0`. Include Overview and Outcome, and use `activePhase?.id === item.id` for `aria-current="location"`. Keep real section IDs as href targets.

Replace the outdated presentation-test assertion that requires a static wrapping table of contents with assertions for a sticky, single-line phase index:

```js
assert.match(currentCss, /\.caseToc\s*\{[^}]*position:\s*sticky[^}]*overflow-x:\s*auto/s)
assert.doesNotMatch(currentCss, /\.caseToc\s*\{[^}]*flex-wrap:\s*wrap/s)
```

- [ ] **Step 4: Render editorial phase labels and mixed-weight section copy**

For every section:

```jsx
const phase = getSectionPhase(section, mode)
<section data-story-phase={phase} ...>
  <div className={s.storyLabel}>{phase}</div>
  <div className={s.storyNarrative}>
    <NarrativeHeading accent={section.titleAccent}>{section.title}</NarrativeHeading>
    <NarrativeCopy lead={section.lead} body={section.body} className={s.storyCopy} />
    ...details, flow, and comparison blocks...
  </div>
  ...evidence...
</section>
```

Remove numeric `0{index + 1}` output. Keep all existing section IDs and scroll tracking.

- [ ] **Step 5: Implement the twelve-column editorial grid**

Replace the section CSS with:

```css
.storySection {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 34px;
  padding: 96px 0;
  border-top: 1px solid var(--line);
}
.storyLabel { grid-column: 1 / span 2; color: var(--muted); font-size: 12px; font-weight: 560; }
.storyNarrative { grid-column: 3 / span 8; max-width: 820px; }
.storyNarrative h2 { max-width: 760px; font-size: 46px; line-height: 1.08; font-weight: 640; }
.narrativeAccent { color: var(--accent); }
.storyCopy { max-width: 760px; margin-top: 28px; font-size: 18px; line-height: 1.68; color: var(--muted); }
.storyCopy strong { color: var(--ink); font-weight: 620; }
.storyCopy span { color: var(--muted); }
.caseToc { position: sticky; top: 72px; z-index: 8; flex-wrap: nowrap; overflow-x: auto; background: color-mix(in srgb, var(--paper) 96%, transparent); }
```

At 900 px and below, use a single-column section; place the label above the heading. At 600 px and below, use 31 px headings, 16 px body, and 52 px vertical padding.

- [ ] **Step 6: Run the focused test and current section-tracking tests**

Run: `node --test --test-name-pattern="authored phases|case study" tests/presentation.test.mjs`

Expected: PASS, including `aria-current` and static section visibility assertions.

- [ ] **Step 7: Commit the narrative section layout**

```bash
git add src/portfolio/CaseStudy.jsx src/portfolio/Portfolio.module.css tests/presentation.test.mjs
git commit -m "feat: add editorial case study phases"
```

### Task 4: Open Decisions, Evidence Rhythm, And Outcome

**Files:**
- Modify: `src/portfolio/CaseStudy.jsx`
- Modify: `src/portfolio/CaseStudyBlocks.jsx`
- Modify: `src/portfolio/Portfolio.module.css`
- Modify: `tests/presentation.test.mjs`

**Interfaces:**
- Consumes: existing section `comparison`, `details`, `flow`, and assigned evidence blocks.
- Produces: `DesignDecision`, evidence layout modifiers, a bright outcome section, and complete uncropped slide media.

- [ ] **Step 1: Add failing presentation tests for decisions, slides, and outcome**

Add to `tests/presentation.test.mjs`:

```js
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
    assert.match(css, /\.storyArtifactSlide img\s*\{[^}]*object-fit:\s*contain/s)
    assert.match(css, /\.outcome\s*\{[^}]*background:\s*var\(--paper\)/s)
    assert.doesNotMatch(css, /\.designDecision > div\s*\{[^}]*border:\s*1px solid/s)
  } finally { await server.close() }
})
```

- [ ] **Step 2: Run the focused test and confirm current card/dark-panel failures**

Run: `node --test --test-name-pattern="open editorial treatment" tests/presentation.test.mjs`

Expected: FAIL on missing data markers and the current bordered-card and dark outcome rules.

- [ ] **Step 3: Move design decisions into a focused primitive**

Add to `CaseStudyBlocks.jsx`:

```jsx
export function DesignDecision({ comparison }) {
  if (!comparison) return null
  return <dl className={s.designDecision} data-design-decision="true">
    <div><dt>Problem</dt><dd>{comparison.observation}</dd></div>
    <div><dt>Design response</dt><dd>{comparison.response}</dd></div>
  </dl>
}
```

Use it from `CaseStudy.jsx`. Do not vary the labels based on the project's art type.

- [ ] **Step 4: Align evidence with the narrative and preserve full slides**

- place evidence at grid columns 3 through 13 for normal detailed sections
- allow a single interface or slide to use the full available evidence width
- keep two related screens in a two-column grid above 900 px
- set slide media to `aspect-ratio: 16 / 9` and slide images to `width: 100%; height: 100%; object-fit: contain`
- keep non-browser images below `min(74svh, 700px)` so a full design screen can be inspected on a laptop
- retain factual captions, full-size links, and restricted-image handling

- [ ] **Step 5: Replace decision cards and the dark outcome panel**

Use open CSS:

```css
.designDecision { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 44px; margin-top: 38px; padding-top: 22px; border-top: 1px solid var(--ink); }
.designDecision > div { padding: 0; border: 0; background: transparent; }
.designDecision > div:last-child { padding-left: 22px; border-left: 2px solid var(--accent); }
.designDecision dt { color: var(--accent); font-size: 12px; font-weight: 600; }
.designDecision dd { margin-top: 12px; font-size: 16px; line-height: 1.65; }
.outcome { background: var(--paper); color: var(--ink); border-top: 1px solid var(--ink); padding: 84px 0; }
.outcome .label { color: var(--accent); }
.outcome > p { color: var(--muted); }
```

Mark the outcome with `data-outcome-section="true"`. Preserve the current factual `project.status` and `project.outcome` strings.

- [ ] **Step 6: Run the focused test**

Run: `node --test --test-name-pattern="open editorial treatment" tests/presentation.test.mjs`

Expected: PASS.

- [ ] **Step 7: Commit the evidence and outcome redesign**

```bash
git add src/portfolio/CaseStudy.jsx src/portfolio/CaseStudyBlocks.jsx src/portfolio/Portfolio.module.css tests/presentation.test.mjs
git commit -m "feat: refine case study evidence rhythm"
```

### Task 5: Migrate The Ten Detailed Project Narratives

**Files:**
- Modify: `src/data/editorial.json`
- Modify: `src/data/internships.json`
- Modify: `tests/detailed-case-studies.test.mjs`

**Interfaces:**
- Consumes: the optional fields rendered by Tasks 2 through 4.
- Produces: `caseStudyMode: "detailed"`, authored introductions, up to three descriptors, explicit section phases, and selected non-duplicating lead sentences for all ten detailed projects.

- [ ] **Step 1: Add failing data-contract tests for all detailed projects**

Add to `tests/detailed-case-studies.test.mjs`:

```js
const editorialDetailedSlugs = [
  'bubbas-production', 'honda-spatial', 'ethicon-care', 'story-authoring', 'embrain-research',
  'swim-up-hill', 'ai-3d-product-visualization', 'bubbas-daily-target', 'haily', 'ars-pharma',
]

test('the ten detailed projects have authored editorial narrative fields', () => {
  for (const slug of editorialDetailedSlugs) {
    const project = allProjects.find(item => item.slug === slug)
    assert.equal(project.caseStudyMode, 'detailed', slug)
    assert.ok(project.introLead?.length > 20, `${slug}: introLead`)
    assert.ok(project.introSupport?.length > 20, `${slug}: introSupport`)
    assert.ok(project.descriptors?.length >= 2 && project.descriptors.length <= 3, `${slug}: descriptors`)
    assert.ok(project.sections.every(section => section.phase), `${slug}: section phase`)
    assert.ok(project.sections.some(section => ['Problem', 'Context'].includes(section.phase)), `${slug}: framing`)
    assert.ok(project.sections.some(section => ['Design response', 'Prototype'].includes(section.phase)), `${slug}: response`)
    assert.ok(project.sections.some(section => section.lead), `${slug}: mixed-weight lead`)
  }
})

test('authored section leads do not duplicate the supporting body', () => {
  for (const slug of editorialDetailedSlugs) {
    const project = allProjects.find(item => item.slug === slug)
    for (const section of project.sections.filter(item => item.lead)) {
      assert.equal(section.body.startsWith(section.lead), false, `${slug}/${section.id}`)
    }
  }
})
```

- [ ] **Step 2: Run the focused data test and confirm missing-field failures**

Run: `node --test --test-name-pattern="authored editorial narrative|do not duplicate" tests/detailed-case-studies.test.mjs`

Expected: FAIL because the ten projects do not yet define the new fields.

- [ ] **Step 3: Add exact project modes, introductions, and descriptors**

Set `caseStudyMode` to `detailed` and use these existing-evidence descriptions:

| Slug | `introLead` | `introSupport` | `descriptors` |
| --- | --- | --- | --- |
| `bubbas-production` | `I helped turn a manual video-preparation workflow into one production interface.` | `The platform brought production tools into one automated workflow, then scaled from a 10-video prototype to more than 300 videos per automated batch.` | `AI & UX`, `Production workflow`, `Interface design` |
| `honda-spatial` | `A shared vehicle review needed interaction tools that could live inside the spatial scene.` | `The sprint translated NVIDIA Omniverse and visionOS constraints into testable annotation, part-control, presence and collaboration patterns for Apple Vision Pro.` | `Spatial UX`, `visionOS prototype`, `Industry collaboration` |
| `ethicon-care` | `A clinical taxonomy had to become a clear, reviewable assessment workflow.` | `The prototype keeps wound imagery, DISH categories and terminology decisions visible throughout assessment training.` | `Healthcare UX`, `Interaction design`, `Prototype` |
| `story-authoring` | `A research prototype made branching, AI-assisted storytelling easier to structure.` | `The work connected interaction design and an authoring prototype with publications at ICIDS and KIISE.` | `Human-AI`, `UX research`, `Prototyping` |
| `embrain-research` | `User research became product direction across mobile, automotive, and workplace services.` | `Mixed-method engagements across Samsung Electronics, Hyundai Motor Company and SK involved approximately 100 participants in total.` | `UX research`, `Product strategy`, `Interface concepts` |
| `swim-up-hill` | `I carried a nonprofit website from audience needs through frontend delivery and publishing.` | `The published experience connects families, schools, volunteers, donors and partners with clear paths into the foundation's mission.` | `Web design`, `Frontend`, `Published product` |
| `ai-3d-product-visualization` | `Blender MCP became an editable control layer for a product and character study.` | `I directed editable modeling, materials, lighting and camera changes, then refined hierarchy through visual review.` | `3D prototyping`, `Blender MCP`, `Art direction` |
| `bubbas-daily-target` | `A contact database became a focused daily decision tool.` | `Ranked signals, relevant capabilities and warm-introduction routes support one clear next action.` | `Workflow design`, `Responsive UI`, `Prototype` |
| `haily` | `A long missed-charge handoff became a two-sided healthcare workflow proposal.` | `The concept detects incomplete encounters, routes one clear physician decision and returns traceable context to billing administrators.` | `Healthcare UX`, `Service design`, `Product strategy` |
| `ars-pharma` | `An emergency medication concept expanded into a campus preparedness service.` | `Awareness, medication access and bystander action connect across service, package and interface design.` | `Service design`, `Healthcare`, `Package & UI` |

- [ ] **Step 4: Add exact phase mappings**

Apply these phase sequences in current section order:

```js
{
  'bubbas-production': ['Context', 'Design response', 'Outcome'],
  'honda-spatial': ['Context', 'Problem', 'System constraint', 'Prototype', 'Prototype', 'Insight', 'Design response', 'Reflection'],
  'ethicon-care': ['Context', 'Design response', 'Iteration', 'Outcome'],
  'story-authoring': ['Problem', 'Design response', 'Outcome'],
  'embrain-research': ['Context', 'Insight', 'Design response'],
  'swim-up-hill': ['Context', 'Insight', 'Design response', 'Outcome'],
  'ai-3d-product-visualization': ['Context', 'Prototype', 'Design response', 'Iteration', 'Reflection'],
  'bubbas-daily-target': ['Problem', 'System constraint', 'Design response', 'Outcome'],
  'haily': ['Problem', 'Problem', 'Design response', 'System constraint', 'Design response', 'Iteration', 'Outcome'],
  'ars-pharma': ['Problem', 'Design response', 'Design response', 'Prototype', 'Outcome'],
}
```

Move these exact existing sentences into `lead` and remove them from the start of their current `body` values:

| Slug / section | `lead` |
| --- | --- |
| `bubbas-production / production-context` | `Rough-cut preparation involved footage, scripts, storyboards, voice-over files, and production notes.` |
| `honda-spatial / space-architecture` | `CloudXR required a Full Immersive Space to stream the Omniverse scene, while GroupActivities and Spatial Personas operated in a Shared Space.` |
| `ethicon-care / guided-classification` | `The interface evolved from confirming whether a proposed keyword matched a category to asking clinicians to choose a primary keyword and optional secondary terms alongside the wound image.` |
| `story-authoring / authoring-question` | `The project explored an authoring environment where people without programming knowledge could create branching interactive stories with generative language models.` |
| `embrain-research / design-directions` | `I translated findings into personalization strategies and UI prototypes for Samsung Galaxy, camping-feature concepts for Hyundai SUVs, and an employee service platform for SK.` |
| `swim-up-hill / responsive-delivery` | `I carried the interface into HTML frontend implementation and publishing.` |
| `ai-3d-product-visualization / ai-assisted-workflow` | `Blender MCP let me direct modeling, material, lighting and camera changes through conversation.` |
| `bubbas-daily-target / workflow-boundary` | `The workbook owns the scoring rubric and network matching.` |
| `haily / product-intervention` | `HAiLY was designed as a coordination layer, not a replacement EHR.` |
| `ars-pharma / one-handed-package` | `The existing zip case requires two hands, which conflicts with the urgency and simplicity of nasal administration.` |

Create selective accent endings by shortening the base `title` and adding these `titleAccent` values:

```js
{
  'bubbas-production/interface-scope': ['Bringing key tasks into', 'one interface'],
  'honda-spatial/space-architecture': ['The collaboration model conflicted', 'at the space level'],
  'ethicon-care/feedback-rationale': ['Capture disagreement,', 'not just a yes or no'],
  'story-authoring/research-contribution': ['From interface prototype', 'to publication'],
  'embrain-research/design-directions': ['Moving from findings', 'to design'],
  'swim-up-hill/responsive-delivery': ['Carry the design into', 'a working site'],
  'ai-3d-product-visualization/ai-assisted-workflow': ['Use conversation as a control layer,', 'not a substitute for judgment'],
  'bubbas-daily-target/workflow-boundary': ['Keep the workbook', 'as the source of truth'],
  'haily/product-intervention': ['The product sits between', 'a pending encounter and billing'],
  'ars-pharma/campus-service': ['Building a campus response,', 'not a single touchpoint'],
}
```

- [ ] **Step 5: Run detailed content, asset, and privacy tests**

Run: `node --test tests/detailed-case-studies.test.mjs tests/internships.test.mjs tests/iya-projects.test.mjs tests/portfolio.test.mjs`

Expected: PASS with all current asset, route, Honda, HAiLY, and content-integrity checks preserved.

- [ ] **Step 6: Commit the detailed project migration**

```bash
git add src/data/editorial.json src/data/internships.json tests/detailed-case-studies.test.mjs
git commit -m "content: structure detailed project narratives"
```

### Task 6: Concise Archive Treatment And Homepage Type Alignment

**Files:**
- Modify: `src/data/portfolio.js`
- Modify: `src/portfolio/CaseStudy.jsx`
- Modify: `src/portfolio/Home.jsx`
- Modify: `src/portfolio/Portfolio.module.css`
- Modify: `tests/presentation.test.mjs`
- Modify: `tests/portfolio.test.mjs`

**Interfaces:**
- Consumes: concise mode from Task 1 and the existing homepage project ordering and cover components.
- Produces: intentional short project records without phase navigation and small homepage typography adjustments without structural redesign.

- [ ] **Step 1: Add failing concise-mode and homepage-preservation assertions**

Add to the existing tests:

```js
test('archive projects use one concise overview without fabricated phases', () => {
  const concise = allProjects.filter(project => project.caseStudyMode === 'concise')
  assert.equal(concise.length, 13)
  for (const project of concise) {
    assert.equal(project.sections.length, 1, project.slug)
    assert.equal(project.sections[0].phase, 'Project overview', project.slug)
  }
})
```

Extend the homepage SSR test with:

```js
assert.match(html, /data-home-editorial-type="true"/)
assert.doesNotMatch(html, /data-phase-navigation="true"/)
```

- [ ] **Step 2: Run the focused tests and confirm missing markers fail**

Run: `node --test --test-name-pattern="concise overview|home.*editorial" tests/portfolio.test.mjs tests/presentation.test.mjs`

Expected: FAIL until concise defaults and the homepage marker are present.

- [ ] **Step 3: Finish concise page rendering**

- ensure the archive adapter always supplies `caseStudyMode: 'concise'` and `phase: 'Project overview'`
- hide descriptors when absent
- hide phase navigation in concise mode
- reduce concise page vertical section padding to 68 px on desktop and 44 px on mobile
- keep its title, project facts, contribution, available original media, outcome, and next-project link
- never add Problem, Solution, Insight, or measured Outcome copy to an archive item unless source data already contains it

- [ ] **Step 4: Align homepage typography without changing composition**

Add `data-home-editorial-type="true"` to the homepage root content in `Home.jsx`. Adjust only existing type rules:

- reduce oversized project heading weights to the same 600 to 640 range used by case-study headings
- keep summary copy muted and 1.58 to 1.65 line height
- keep overlines and metadata labels at 12 to 13 px semibold
- preserve portrait, cover layouts, project order, two-column laptop layout, and all current interactions

- [ ] **Step 5: Run homepage, archive, and route tests**

Run: `node --test tests/presentation.test.mjs tests/portfolio.test.mjs tests/project-covers.test.mjs`

Expected: PASS with the existing hero portrait, project order, cover variants, and routes unchanged.

- [ ] **Step 6: Commit concise and homepage treatments**

```bash
git add src/data/portfolio.js src/portfolio/CaseStudy.jsx src/portfolio/Home.jsx src/portfolio/Portfolio.module.css tests/presentation.test.mjs tests/portfolio.test.mjs
git commit -m "feat: align portfolio editorial typography"
```

### Task 7: Full Verification And Responsive Visual QA

**Files:**
- Modify only if verification finds a defect: `src/portfolio/CaseStudy.jsx`
- Modify only if verification finds a defect: `src/portfolio/CaseStudyBlocks.jsx`
- Modify only if verification finds a defect: `src/portfolio/Portfolio.module.css`
- Modify only if verification finds a defect: `src/data/editorial.json`
- Modify only if verification finds a defect: `src/data/internships.json`
- Modify only if verification finds a defect: relevant test file under `tests/`

**Interfaces:**
- Consumes: the complete implementation from Tasks 1 through 6.
- Produces: verified static routes, responsive layouts, complete media, and an accessible final interaction state.

- [ ] **Step 1: Run the complete automated test suite**

Run: `npm test`

Expected: all tests PASS with no skipped or cancelled tests.

- [ ] **Step 2: Build and prerender outside tracked `dist`**

Run: `rm -rf /tmp/jumin-portfolio-build && PORTFOLIO_BUILD_DIR=/tmp/jumin-portfolio-build npm run build`

Expected: Vite build succeeds and the prerender script reports all public routes, the legacy route, and the 404 page.

- [ ] **Step 3: Start or reuse the local Vite server**

Run: `npm run dev -- --host 127.0.0.1`

Expected: Vite exposes the portfolio at `http://127.0.0.1:5173/`, or the next available local port if 5173 is occupied.

- [ ] **Step 4: Inspect representative pages at laptop size**

At approximately 1440 by 900, inspect:

- `/work/honda-spatial/` for complete 16:9 slides, phase grouping, and long technical copy
- `/work/haily/` for healthcare problem-to-response pacing and confidential-source framing
- `/work/ai-3d-product-visualization/` for portrait media and paired render rhythm
- `/work/ethicon-care/` for healthcare decision comparisons
- `/work/newegg/` for concise-mode restraint

Expected: no cropped slides, overlapping text, repeated title accent, template-like bordered card rows, or horizontal overflow.

- [ ] **Step 5: Inspect wide desktop, tablet, and mobile**

Check the homepage and the same representative project pages at wide desktop, about 768 by 1024, and about 390 by 844.

Expected:

- titles wrap naturally and remain below the viewport width
- facts become one column on mobile
- phase labels move above headings
- paired evidence stacks cleanly
- full interfaces fit inside their media frame
- phase navigation scrolls or wraps without clipping
- reduced-motion content remains visible

- [ ] **Step 6: Check behavior and runtime health**

Verify:

- keyboard focus reaches back link, phase links, evidence links, resources, and next project
- the active phase updates while scrolling and exposes `aria-current="location"`
- full-size evidence links open the correct local source
- browser back returns to the correct page
- there are no console errors, failed local image requests, or layout-shift gaps

- [ ] **Step 7: Fix only observed defects and rerun their focused tests**

For each observed defect, first add or tighten an assertion in the relevant test, run it to see the failure, then make the smallest source or CSS correction and rerun the focused test until it passes.

- [ ] **Step 8: Rerun final verification**

Run:

```bash
npm test
rm -rf /tmp/jumin-portfolio-build
PORTFOLIO_BUILD_DIR=/tmp/jumin-portfolio-build npm run build
git diff --check
```

Expected: all tests PASS, production build and prerender succeed, and `git diff --check` prints no errors.

- [ ] **Step 9: Commit verification corrections if any source files changed**

```bash
git add src/portfolio/CaseStudy.jsx src/portfolio/CaseStudyBlocks.jsx src/portfolio/Portfolio.module.css src/data/editorial.json src/data/internships.json tests/case-study-narrative.test.mjs tests/detailed-case-studies.test.mjs tests/presentation.test.mjs tests/portfolio.test.mjs
git diff --cached --check
git commit -m "fix: polish editorial case study layouts"
```

Do not create an empty verification commit.
