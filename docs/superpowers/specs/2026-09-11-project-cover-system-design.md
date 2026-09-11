# Portfolio Project Cover System Design

## Goal

Replace raw homepage screenshots with an art-directed cover system that presents Jumin's work as a polished UX Design Engineering portfolio. The system should make the real interface work immediately legible, give each project a distinct identity, and avoid the repeated-card appearance associated with portfolio templates.

## Approved Direction

Use the selected **Editorial product stage** direction:

- One real product screen is the dominant visual.
- A second related screen or artifact may overlap at a smaller scale.
- A thin browser or document frame supplies context without becoming the subject.
- Project number, organization, and one factual detail appear as restrained editorial annotations.
- Project-specific color, crop, and screen placement create variation within one coherent system.

The covers will be composed in React and CSS from existing project assets. They will not be exported as flattened mockup images. This keeps interface details crisp, responsive, and easier to update.

## Scope

### Lead case studies

The first four homepage projects receive the full composition:

1. Bubba's LA AI-assisted production
2. Swim Up Hill website design and delivery
3. Johnson & Johnson post-operative care
4. ARS Pharma anaphylaxis care

Each lead cover uses one primary screen, one supporting screen or artifact, and a distinct stage treatment.

### Supporting projects

The remaining five homepage projects use a quieter version of the same system:

1. Bubba's LA Daily Target
2. Honda spatial design review
3. Human-AI story authoring
4. Studio.OS UX audit
5. Embrain product direction

Supporting covers prioritize one screen at a smaller scale. A secondary screen is included only when it stays readable in the compact row. Embrain remains type-led because there is no suitable interface image; no evidence will be invented to fill the frame.

### Small project index

The hero's small project tiles use the same primary image and color identity but omit secondary screens and editorial annotations. Their job is navigation, so the visual must remain recognizable at thumbnail size.

### Not in scope

- Case-study page content, narrative, or factual claims
- Existing case-study evidence image sizing
- New AI-generated product screens or fabricated device mockups
- Heavy 3D perspective, branded laptop hardware, or decorative lifestyle scenes
- Changes to the current homepage project order

## Visual System

### Composition

Lead covers share a common hierarchy but not an identical arrangement:

- The primary screen occupies roughly 68–78 percent of the stage.
- The supporting screen occupies roughly 22–32 percent and overlaps one edge.
- Primary and secondary placement can mirror horizontally by project.
- Frames use square or lightly rounded corners, thin borders, and restrained shadows.
- Backgrounds are solid colors with no gradients, orbs, or decorative blur.

The real interface remains the largest and highest-contrast element. Editorial labels stay small and never cover meaningful controls or content.

### Project treatments

| Project | Primary asset | Supporting asset | Stage character |
| --- | --- | --- | --- |
| Bubba's production | `bubbas-assist-media.png` | `bubbas-assist-result.png` | Warm gray stage, dark browser, output detail at lower right |
| Swim Up Hill | `swim-up-hill-home.png` | `swim-up-hill-mobile.png` | Cool pale green stage, desktop page with an upright mobile detail |
| Johnson & Johnson | `jj-training-decision.png` | `jj-feedback-loop.png` | Clinical blue-gray stage, decision screen with a workflow detail |
| ARS Pharma | `ars-location-ui.png` | `ars-package.png` | Pale coral stage, service interface paired with the physical package artifact |
| Daily Target | `bubbas-daily-target.png` | `bubbas-daily-target-mobile.png` | Quiet neutral stage with desktop-first framing |
| Honda | `honda-spatial-ui.png` | `honda-toolbar.png` | Deep neutral stage that preserves spatial-interface contrast |
| Story authoring | `Portfolio_interactive_storytelling.png` | none | Single-screen editorial crop with type-led framing |
| Studio.OS | `studio-os-briefing.png` | `studio-os-bench.png` | Paper-gray stage, browser capture with a small audit evidence detail |
| Embrain | none | none | Existing research artwork adapted to the new stage proportions |

Colors will remain compatible with the portfolio's near-white paper, charcoal ink, and vermilion accent. Project backgrounds add pale green, cool blue-gray, coral, and deep neutral so the page does not read as a one-note palette.

### Motion

- Hover gently lifts the supporting frame and scales the primary screen by no more than 1.5 percent.
- The existing red action reveal remains unchanged.
- Keyboard focus produces the same readable state as hover.
- Motion is disabled when the user prefers reduced motion.

## Component Architecture

Add a dedicated `ProjectCover` component for homepage presentation. `ProjectArt` remains responsible for existing case-study and fallback artwork.

`ProjectCover` accepts:

- `project`: the project record
- `variant`: `lead`, `compact`, or `micro`
- `index`: the zero-based homepage position used for the visible project number
- `eager`: whether primary imagery should load eagerly

The component reads a `cover` object from project data. It renders:

- a stage wrapper with project-specific tone and layout classes
- the primary `ProjectImage`
- an optional secondary `ProjectImage`
- minimal contextual chrome selected by frame type
- optional annotation content for the lead variant

Variants control density rather than duplicating markup:

- `lead`: full primary and secondary composition plus annotations
- `compact`: primary-first composition with a secondary image only when configured
- `micro`: primary image or code-art fallback only

If a project does not define cover metadata, `ProjectCover` falls back to the existing `ProjectArt` rendering. This protects archived and future projects from blank states.

## Data Model

Homepage cover decisions live with editorial project content rather than in the React component. Each project may define:

```json
{
  "cover": {
    "tone": "warm-gray",
    "layout": "primary-left",
    "primary": "/assets/projects/example-primary.png",
    "primaryFrame": "browser",
    "secondary": "/assets/projects/example-secondary.png",
    "secondaryFrame": "document",
    "annotation": "300+ videos per batch"
  }
}
```

Allowed values stay deliberately small:

- `tone`: a named CSS treatment, not an arbitrary inline color
- `layout`: `primary-left`, `primary-right`, `desktop-mobile`, or `single`
- frame: `browser`, `document`, `phone`, or `plain`

This gives the projects individual art direction while preventing one-off JSX branches for each slug.

## Responsive Behavior

### Laptop and desktop

- Lead covers keep the current homepage media footprint and aspect ratio.
- The primary screen is shown fully enough to understand the page or product state.
- Secondary screens overlap without extending outside the clickable media region.

### Tablet

- Overlap and shadows reduce slightly.
- Labels move toward the stage edges to preserve the primary screen.

### Mobile

- The primary screen expands to approximately 88–94 percent of the stage.
- Secondary screens shrink substantially or are hidden when they obscure the main interface.
- Small annotations collapse to project number only.
- No horizontal overflow is allowed.

## Accessibility And Content Integrity

- The surrounding project link retains its descriptive `aria-label`.
- Images inside an already-labeled cover link are decorative and use empty alt text to avoid repetition.
- The design does not rely on color alone to identify a project.
- Focus states remain visible against every stage tone.
- All captions, organizations, statistics, and project outcomes come from existing portfolio data.
- No new metrics or ownership claims are introduced.

## Performance

- Reuse existing optimized derivatives through `ProjectImage` and the image manifest.
- Do not create duplicate flattened cover files.
- Load the first visible lead cover eagerly; retain lazy loading for later covers.
- CSS transforms and shadows are the only animated properties.

## Verification

Implementation follows test-driven development.

Automated checks will verify:

- every homepage project resolves to a valid cover or fallback
- lead cover metadata references existing local assets
- the three supported cover variants are used in the intended homepage locations
- accessible project links and reduced-motion behavior are preserved
- production build and route prerendering still complete successfully

Browser QA will cover:

- a typical laptop viewport around 1440 x 800
- a wide desktop viewport
- a narrow mobile viewport around 390 x 844
- image loading, cropping, hover/focus treatment, and horizontal overflow
- console errors and broken asset requests

## Success Criteria

- Recruiters can recognize the product and understand that the cover contains real interface work without opening the case study.
- The four lead projects look individually art-directed while clearly belonging to one portfolio.
- Supporting and micro covers remain legible at their smaller sizes.
- No lead cover is a raw edge-to-edge screenshot.
- The redesign does not alter project facts, detail-page layouts, routes, or deployment behavior.
