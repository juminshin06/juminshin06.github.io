# Editorial Case Study System Design

## Goal

Redesign the portfolio's project pages into a clearer editorial narrative system for UX Design Engineering roles. The system should help a recruiter understand the problem, Jumin's contribution, the design response, the evidence, and the documented result without reading a presentation deck or decoding repeated template cards.

The supplied maternal-monitoring portfolio screens are a hierarchy and storytelling reference, not a visual template to copy. The portfolio will retain its existing near-white paper, charcoal ink, muted gray, vermilion accent, Geist typeface, and project imagery.

## Approved Direction

Use an **editorial narrative system** across the portfolio:

- small phase labels establish orientation
- one strong sentence carries each section's main idea
- selected words or verified facts receive emphasis
- supporting copy remains calm and readable
- real interfaces and process artifacts provide the visual evidence
- project stories progress from context through design response and learning

The system will feel authored rather than mechanically identical. Detailed projects receive a full narrative; short archive entries inherit the typography and spacing without pretending to have research or outcomes that are not documented.

## Reference Principles

The redesign adopts these principles from the supplied screens:

1. **Hierarchy before decoration**: a compact section label, decisive heading, readable paragraph, and evidence image form the basic rhythm.
2. **Mixed-weight writing**: black semibold text carries claims and decisions; muted regular text supplies context and nuance.
3. **Selective accent**: vermilion highlights one meaningful phrase, value, or transition. It is not applied to every heading.
4. **Evidence near the claim**: interface screens, diagrams, and test artifacts appear directly after the statement they support.
5. **Problem-to-response continuity**: each problem section identifies the user or system consequence, and the next design section explains the decision made in response.
6. **Quiet metadata**: role, timeline, team, and outcome are presented as a spacious 2 by 2 fact block, not as a dense dashboard.
7. **Authored pacing**: layouts vary between full-width evidence, paired screens, and text-led moments while preserving one reading grid.

The redesign will not adopt the reference's blue color, heavily rounded page shell, pill-heavy tagging, unsupported metrics, or identical project structure.

## Project Tiers

### Detailed case studies

The ten evidence-rich projects receive the complete narrative treatment:

- Bubba's LA AI-assisted production
- Honda spatial design review
- Johnson & Johnson post-operative care
- HAiLY missed-charge workflow
- ARS Pharma anaphylaxis care
- Swim Up Hill website
- Bubba's LA Daily Target
- Human-AI story authoring
- Embrain product direction
- AI-assisted 3D product visualization

Their existing factual sections will be organized into the most appropriate phases from this vocabulary:

- Overview
- Context
- Problem
- Insight
- System constraint
- Design response
- Prototype
- Iteration
- Outcome
- Reflection

Projects do not need every phase. Phase names must describe the actual evidence instead of forcing a fixed design-process diagram onto every story.

### Concise project records

The remaining thirteen legacy and archive projects retain concise pages. They use the same header, typography, metadata, and image treatments, but their body stays under a neutral **Project overview** or other factually supported heading. Missing research, process, metrics, or outcomes will not be invented.

## Page Architecture

### 1. Project introduction

The introduction uses a constrained reading width instead of the current oversized title treatment.

- organization and project type appear as a quiet overline
- project title uses 52 to 64 px on large screens and 36 to 44 px on mobile
- the first summary sentence is rendered in dark semibold text
- supporting summary language is muted and regular weight
- up to three plain-text descriptors may identify the domain, medium, or capability
- the cover or primary product image follows the introduction at a stable, uncropped aspect ratio

Descriptors use lightly tinted text treatments with restrained corners. They do not become decorative pills or repeat information already present in the metadata.

### 2. Project facts

Role, timeline, team, and outcome use a 2 by 2 layout on desktop and a single column on small screens.

- labels are 12 to 13 px, semibold, and vermilion or muted ink
- primary values are 16 to 18 px and dark
- secondary context is muted
- multiline outcomes remain factual and avoid headline-scale numbers unless they are documented

When a project lacks one of the four facts, the layout closes the gap naturally rather than displaying an empty cell.

### 3. Phase navigation

The current navigation that lists every section will be simplified to the page's meaningful phases. It remains keyboard accessible and continues to mark the current location with `aria-current="location"`.

On desktop it behaves as a restrained sticky index. On mobile it becomes a horizontally scrollable text list without bordered tabs. Navigation labels use words rather than ornamental numbering.

### 4. Narrative sections

Each detailed section uses a twelve-column editorial grid:

- a 120 to 150 px left rail holds the phase label
- the main text occupies a readable 7 to 8 column measure
- optional supporting facts or notes can occupy the remaining columns
- evidence aligns with the main content or expands deliberately when detail needs more width

The existing large numeric headings are removed from the primary reading experience. Section numbers may remain as subtle index metadata only where they improve navigation.

Section headings use 40 to 52 px on large screens and 30 to 36 px on mobile, with approximately 650 font weight and normal letter spacing. Headings state a finding, constraint, or design decision instead of generic labels such as "The solution."

Body copy uses approximately 18 px text, 1.6 to 1.7 line height, and a 680 to 760 px reading measure. Paragraphs use deliberate inline emphasis:

- `<strong>` for a user consequence, constraint, decision, or verified result
- muted regular text for explanation
- vermilion emphasis for at most one pivotal phrase per major section

Emphasis is authored in structured content. The renderer will not guess bold phrases from punctuation or split strings with fragile text parsing.

### 5. Evidence layouts

Evidence presentation follows the content rather than one repeated card grid:

- one complete interface uses a centered wide frame
- two related states use a balanced two-up comparison
- process sequences use a horizontal strip on desktop and stack on mobile
- presentation slides preserve their full aspect ratio with `object-fit: contain`
- diagrams use a quiet light surface only when contrast or grouping is needed
- captions explain what the image proves, not merely what it depicts

Corners remain at 8 px or less. Device and browser frames are used only when they add context. Images never cover interface details with floating calls to action.

### 6. Problem and design response

The existing bordered comparison cards will become an open editorial pair:

- **Problem** states the observed friction and its consequence
- **Design response** states the corresponding interaction or system decision
- a thin rule or subtle tinted field connects the pair
- supporting evidence appears immediately below

This pattern can repeat within a project, but it must use project-specific language and evidence. It is not a universal three-card process component.

### 7. Outcome and reflection

The current dark outcome panel will become a bright closing section that matches the rest of the page.

- documented outcome or current status appears first
- Jumin's contribution remains distinct from the team's work
- a short reflection names what was learned or what would be tested next
- the next-project transition stays visually separate and concise

Projects without measured outcomes use honest status language such as prototype, proposal, research publication, demonstration, or shipped website.

## Content Model

The existing project schema will be extended conservatively instead of hardcoding layouts by slug.

Optional project-level fields may include:

```json
{
  "introLead": "A concise factual lead sentence.",
  "introSupport": "Supporting context in a quieter voice.",
  "descriptors": ["Spatial UX", "Prototype", "Research"],
  "facts": [
    { "label": "Role", "value": "Interaction Design" }
  ]
}
```

Optional section fields may include:

```json
{
  "phase": "Problem",
  "title": "The review interface was separated from the shared scene.",
  "accent": "separated from the shared scene",
  "lead": "The core user consequence appears here.",
  "body": "Supporting explanation appears here.",
  "emphasis": ["core user consequence"]
}
```

Existing `comparison`, `flow`, `details`, and `evidence` structures remain supported. New fields are optional so archive projects and future additions continue to render safely.

Structured rich text will support only the limited semantic emphasis needed by the design. It will not accept arbitrary HTML from JSON.

## Shared Components

The redesign remains data-driven and centered on the current case-study system:

- `CaseStudy.jsx` owns the new page hierarchy, phase navigation, and section rhythm
- `CaseStudyBlocks.jsx` renders authored lead/body emphasis, open problem-response pairs, facts, flows, and evidence compositions
- `Portfolio.module.css` defines the shared editorial grid, type scale, evidence variants, and responsive behavior
- `ProjectArt.jsx` and the optimized image manifest continue to handle project media
- project facts and section copy remain in the portfolio data files

Slug-specific components are avoided unless an existing evidence type cannot express a genuinely unique project artifact.

## Homepage And Supporting Pages

The homepage retains its current structure, portrait, project order, and cover system. It receives only the typography adjustments needed to feel consistent with the redesigned case studies:

- slightly tighter title hierarchy
- the same black semibold and muted regular writing contrast
- consistent overlines and metadata labels
- no new hero, card grid, or color direction

Research, About, Archive, and Life remain structurally unchanged unless a shared text token needs adjustment. The redesign must not flatten all pages into the case-study layout.

## Responsive Behavior

At typical laptop widths, a complete headline, summary, metadata group, or major interface image should fit without requiring excessive scrolling.

- large titles scale down at 1280 px and below
- evidence width is capped so full interfaces remain visible
- the label rail collapses above the section heading on mobile
- paired evidence stacks without cropping or horizontal overflow
- slide images retain their full dimensions
- long titles wrap naturally with no viewport-based font scaling

Motion remains restrained. Existing progressive reveals may continue, but static content must remain visible before JavaScript and when reduced motion is enabled.

## Accessibility

- Heading order remains semantic and sequential.
- Inline emphasis uses semantic `<strong>` elements.
- Accent color is never the only indicator of hierarchy or state.
- Phase navigation remains keyboard accessible and exposes current location.
- Evidence has factual alternative text and useful captions.
- Text and controls meet readable contrast against paper and tinted surfaces.
- Full-size image links remain available where they help inspect detailed interfaces.

## Content Integrity

- Do not invent outcomes, usability findings, metrics, adoption, ownership, or production status.
- Preserve official organization, employment, publication, and award names.
- Distinguish Jumin's individual contribution from team output.
- Label retrospective diagrams and reconstructed workflows clearly.
- Use the current resume and supplied source materials as the factual baseline.
- Avoid replacing precise project language with generic design-process phrases.

## Testing And Verification

Implementation will follow test-driven development.

Automated checks will cover:

- optional narrative fields and safe rendering fallbacks
- detailed versus concise project treatment
- semantic headings and structured emphasis
- simplified phase navigation and `aria-current`
- complete local asset resolution
- static rendering for every route
- reduced-motion and responsive rules
- absence of unsupported hardcoded claims

Verification will include:

- `PORTFOLIO_BUILD_DIR=/tmp/jumin-portfolio-build npm run build`
- `npm test`
- browser QA around 1440 x 900, wide desktop, tablet, and 390 x 844
- visual checks on at least Honda, HAiLY, AI-assisted 3D visualization, one healthcare project, and one concise archive project
- checks for cropped slides, horizontal overflow, layout shifts, console errors, and broken assets

## Implementation Sequence

1. Add failing tests for the new narrative fields, phase navigation, and layout contract.
2. Extend the data model with optional authored emphasis and project facts.
3. Rebuild the shared case-study header, metadata, navigation, and narrative sections.
4. Migrate the ten detailed projects using only existing verified content.
5. Apply the concise treatment to the thirteen archive projects.
6. Align homepage typography tokens without changing its composition.
7. Run automated verification and browser QA, then correct responsive and visual issues.

## Success Criteria

- A recruiter can identify the project problem, Jumin's role, the design decision, and the evidence within a short scan.
- Detailed projects tell distinct stories instead of appearing as the same numbered template.
- Bold, regular, muted, and accent text create hierarchy without visual noise.
- Product screens remain complete and legible on a typical laptop.
- Archive projects look intentional without fabricated depth.
- The existing portfolio palette and authored identity remain recognizable.
- All routes build, prerender, and navigate correctly on GitHub Pages.
