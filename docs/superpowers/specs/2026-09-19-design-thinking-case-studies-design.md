# Design Thinking Case Studies Design

## Goal

Rebuild the twelve projects shown on the homepage so each case study demonstrates how a user-centered problem became a design response. A recruiter should be able to identify the original problem, follow the reasoning through the five Design Thinking stages, and understand how the final work addressed the problem without relying on unsupported research claims.

This specification supersedes the flexible phase-vocabulary guidance in `2026-09-13-editorial-case-study-system-design.md` for the twelve homepage projects. Its visual and evidence-layout guidance remains in force.

## Scope

The redesign covers all homepage projects:

1. Bubba's LA AI-assisted production
2. PACEPOP
3. Honda spatial design review
4. Ethicon post-operative care
5. Swim Up Hill website
6. HAiLY
7. ARS Pharma anaphylaxis care
8. Human-AI story authoring
9. Bubba's LA Daily Target
10. Autonomous Learning Mobility
11. Samsung Podcast
12. B4Q4 widget UX

The first nine have enough source material for detailed or medium-depth narratives. The final three receive concise five-stage narratives derived only from the preserved project artifacts and factual metadata. Other archive projects remain unchanged.

## Story Principle

Every case study answers the same question:

> What was the existing problem, how did the design process change our understanding of it, and how did the final response address it?

The page should not imply that the final interface appeared directly from the initial brief. It should show a visible chain from context to insight, problem definition, exploration, prototype decisions, and evidence.

## Case Study Anatomy

### 1. Existing problem

The opening establishes the situation before any solution appears.

- **People and context:** who encountered the issue and in what situation
- **Observed friction:** what made the current experience difficult
- **Consequence:** why that friction mattered to the workflow or experience
- **Problem statement:** one concise sentence in the form, “How might we help [people] achieve [need] while accounting for [constraint]?”

When user evidence is indirect, the page names the source accurately: supplied project artifacts, stakeholder input, workflow observation, literature or system-constraint review. It does not call those sources interviews or surveys.

### 2. Design Thinking process

Every in-scope page uses these five visible stages in this order:

1. **Empathize**
   - What was examined to understand people, context, or workflow
   - The most important need, friction, or constraint revealed by that evidence
2. **Define**
   - The focused problem statement
   - The design principles or success criteria derived from the problem
3. **Ideate**
   - Alternatives, opportunity areas, or interaction directions considered
   - Why one direction was selected or combined with another
4. **Prototype**
   - The interface, service, spatial, or technical behavior made tangible
   - The key design decisions that connect the prototype to the defined problem
5. **Test**
   - The actual form of evaluation: prototype walkthrough, stakeholder review, technical validation, competition judging, publication review, production adoption, or usability evidence when documented
   - What changed, held up, or became clearer as a result

Each stage supports the following optional structured content:

- `activity`: what Jumin or the team did
- `insight`: what the evidence changed in the team's understanding
- `decision`: how that insight affected the design
- `evidence`: artifact references already present in project content
- `validation`: the documented evaluation type and result

Not every stage needs equal length. Content depth follows the available evidence, but no stage is omitted from the visible process.

### 3. Resolution

The ending returns explicitly to the opening problem.

- **Before:** a compact restatement of the original friction
- **Design response:** the product or service change introduced
- **After:** the resulting experience or operational change supported by the prototype
- **Evidence:** a documented outcome such as publication, award, deployment, production adoption, prototype demonstration, working technical behavior, or shipped site
- **Reflection:** a concrete design lesson from the work

The closing section uses the heading **How the design addressed the problem**. It does not use a generic “What remains” block.

## Evidence And Integrity

The redesign must remain credible under interview scrutiny.

- Do not invent participant counts, quotations, survey percentages, usability findings, clinical validation, stakeholder praise, or business impact.
- Do not present a planned study as completed research.
- Do not describe stakeholder or competition review as user testing.
- Medical projects remain design explorations unless the supplied materials document clinical deployment or validation.
- Retrospective interpretations are allowed when labeled as retrospective synthesis, design hypothesis, or illustrative scenario.
- Existing verified results may be used prominently: Bubba's production adoption and batch scale, Honda R&D demonstration, HAiLY's second-place result, Swim Up Hill's published site, and Story Authoring's publications.
- Jumin's individual contribution remains distinct from team output.

## Content Model

The twelve in-scope projects gain a `designProcess` object. Existing `sections` remain temporarily available during migration, but the redesigned renderer uses `designProcess` when present.

```json
{
  "designProcess": {
    "problem": {
      "context": "Who and where",
      "friction": "Observed difficulty",
      "consequence": "Why it mattered",
      "statement": "How might we..."
    },
    "stages": [
      {
        "id": "empathize",
        "label": "Empathize",
        "title": "A finding-led section title",
        "activity": "What was done",
        "insight": "What changed in the understanding",
        "decision": "Optional direct effect on the design",
        "evidenceSectionIds": ["existing-section-id"]
      }
    ],
    "resolution": {
      "before": "Original friction",
      "response": "Designed change",
      "after": "Resulting experience",
      "evidence": "Verified result or status",
      "reflection": "Design lesson"
    }
  }
}
```

The five stage IDs are fixed: `empathize`, `define`, `ideate`, `prototype`, and `test`. Data validation fails when an in-scope project is missing a stage, contains a duplicate stage, or uses an unsupported stage ID.

Existing project images remain assigned through their current section IDs. `evidenceSectionIds` lets each new stage collect those images without duplicating or moving asset records.

## Page Design

### Problem introduction

The existing split hero remains. Directly after contribution metadata, a full-width problem introduction uses an open editorial layout:

- a small `Existing problem` label
- a large problem statement
- three short columns for people/context, friction, and consequence

It is not presented as three floating cards. Thin rules and whitespace establish hierarchy.

### Process navigation

The sticky section navigation becomes a fixed six-item sequence:

`Empathize · Define · Ideate · Prototype · Test · Resolution`

The active stage remains exposed with `aria-current="location"`. On mobile it scrolls horizontally without pill or tab styling.

### Stage sections

Each stage uses the current twelve-column editorial grid:

- left rail: `01` through `05`, English stage name, and a short Korean-independent semantic label for screen readers
- main column: evidence-led headline, activity, insight, and decision
- evidence area: existing screenshots, slides, flows, and prototypes placed next to the claim they support

The five stages should feel like one continuous narrative, not five repeated cards. Alternate evidence widths and section density according to the artifacts. Keep the paper, charcoal, gray, and vermilion visual language.

### Resolution section

The resolution uses an open before-and-after composition separated by a directional line rather than two cards. Verified evidence and reflection follow below at a quieter scale. Unsupported praise or metrics never appear as decorative proof.

### Homepage cues

Homepage project cards keep their current image-led layout and four-column More Product Work grid. Add one concise process cue derived from the project's strongest transition, such as `Workflow study → production system` or `Platform constraints → spatial prototype`. This helps communicate process without overloading the index.

## Project-Specific Content Strategy

- **Bubba's production:** reconstruct the workflow from scattered production inputs to an adopted batch system. Production adoption is the test evidence.
- **PACEPOP:** connect temporary-group needs, safety and identity constraints to QR entry, temporary rooms and support interactions. Use documented prototype walkthroughs as evaluation evidence.
- **Honda:** map platform and reviewer constraints, alternatives, technical prototypes and the Honda R&D demonstration.
- **Ethicon:** show how wound evidence, terminology and rationale became one traceable assessment flow. Keep the outcome at prototype level.
- **Swim Up Hill:** connect stakeholder paths and nonprofit goals to information architecture, interface delivery and the published site.
- **HAiLY:** connect missed-charge workflow analysis to a two-sided agentic service and competition result.
- **ARS Pharma:** connect campus-response context to awareness, access, bystander action and sprint proposal.
- **Story Authoring:** connect non-programmer authoring needs to structured narrative elements, prototype decisions and peer-reviewed publication.
- **Daily Target:** connect information overload in business development to ranked daily action and a working dashboard handoff.
- **Learning Mobility:** use supplied concept artifacts to show context, problem framing, concept exploration, product expression and documented concept status without claiming research not in the record.
- **Samsung Podcast:** use preserved UX research artifacts and interface states, without assigning a participant count to this specific engagement.
- **B4Q4 widget UX:** frame the internship contribution as interface analysis, widget direction, prototype contribution and documented handoff rather than a full independent research study.

## Responsive Behavior

- Desktop retains a readable central narrative with evidence expanding beyond the text column when needed.
- Tablet collapses problem metadata and paired evidence to two columns where legible.
- Mobile places the stage number and label above the headline, stacks before/after content, and preserves uncropped interface imagery.
- Long problem statements and stage titles wrap naturally. No viewport-scaled font sizes are introduced.
- Reduced-motion users receive static content with no hidden entry state.

## Accessibility

- Heading order is sequential and each stage is a labeled landmark.
- Process navigation is keyboard accessible and identifies the current location.
- Stage numbers are decorative; stage names remain available to assistive technology.
- Captions state what an artifact supports rather than merely naming the screenshot.
- Color is not the only indicator of progress or comparison.

## Implementation Boundaries

- Primary content edits belong in `src/data/editorial.json` and `src/data/internships.json`.
- Concise legacy overrides for Learning Mobility, Samsung Podcast, and B4Q4 may be promoted through `src/data/portfolio.js` or expanded in `editorial.json`; do not duplicate conflicting records.
- Shared rendering belongs in `CaseStudy.jsx`, `CaseStudyBlocks.jsx`, and `caseStudyNarrative.js`.
- Shared styling belongs in `Portfolio.module.css`.
- Do not create slug-specific React pages.
- Do not modify generated `dist` output.

## Testing And Verification

Implementation follows test-driven development.

Automated tests will verify:

- all twelve homepage projects contain exactly five ordered stages
- each project contains an existing problem and resolution
- process navigation exposes the six expected destinations
- unsupported stage IDs and incomplete process data fail validation
- existing local assets and direct project routes still resolve
- concise projects render without fabricated facts or empty fields
- static generation completes for every route

Visual QA will cover:

- at least one detailed project and one concise project at desktop and mobile widths
- legibility of problem statements, five-stage navigation, evidence, and resolution
- no clipped interface imagery, overlapping sticky navigation, or horizontal page overflow
- homepage process cues at four-, two-, and one-column breakpoints
- reduced-motion behavior and keyboard navigation

Final verification requires `npm run build`, `npm test`, browser inspection of all twelve case-study routes, and screenshot comparison for representative detailed and concise pages.
