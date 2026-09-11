# Detailed Project Case Studies Design

## Goal

Strengthen three portfolio projects so they demonstrate Jumin's UX Design Engineering practice through traceable problem framing, technical constraints, interaction decisions, prototyping, and delivery. Expand the Honda and HAiLY stories from supplied source material, and replace the visible Studio.OS audit with an evidence-backed Blender MCP product-visualization case study.

The result should feel like an authored portfolio rather than an embedded presentation. Source artifacts support the story, but the website controls the hierarchy, pacing, captions, and privacy treatment.

## Approved Direction

Use an evidence-led editorial case-study format:

- Lead with the decision or constraint that shaped the work.
- Pair concise narrative sections with real artifacts, reconstructed diagrams, and small technical annotations.
- Preserve the existing portfolio typography, image scale, and case-study component system.
- Keep every outcome and ownership claim tied to supplied material.
- Do not publish complete decks, confidential slides, private credentials, or invented process artifacts.

## Scope

### Spatial Design Review

Expand `/work/honda-spatial/` from four broad sections to a detailed spatial-computing story based on the final Honda Sprint deck.

The proposed sequence is:

1. **Review context**: explain the goal of reviewing an automotive model collaboratively in Apple Vision Pro.
2. **Four interaction gaps**: screen-bound text, custom scripting for actions, missing spatial keyboard support, and UI separated from the scene.
3. **Space architecture conflict**: show why CloudXR's Full Immersive Space could not coexist with the Shared Space used by GroupActivities and Spatial Personas.
4. **Native sticky-note workaround**: describe independent SwiftUI windows composed in Shared Space, including the benefit of native keyboard input and the limitation that notes did not enter the Omniverse scene graph.
5. **Part interaction bridge**: explain the local HTTP server and Omniverse file-watcher prototype used to trigger vehicle-part changes without the unavailable hosted Channel API.
6. **Presence and occlusion experiments**: compare PeekABoo, an IK-driven seated avatar, and a floating information panel, including the tradeoffs of each approach.
7. **Spatial review toolkit**: present Muse Pen annotations, haptic feedback, measurement, participant occlusion, spatial notes, voice annotation, and annotation history as one review workflow.
8. **What the team learned**: close with the Honda R&D demonstration and the three future directions documented in the deck: enterprise XR streaming, more capable native visionOS rendering, and Gaussian-splat alternatives.

The page will distinguish Jumin's interface leadership from engineering work completed by the wider eight-person team. It will not imply that Jumin independently built every prototype.

### HAiLY

Expand `/work/haily/` into a research-to-product case study using the supplied HAiLY presentation while treating the deck as confidential source material.

The proposed sequence is:

1. **Current workflow**: reconstruct the missed-charge process from encounter closure through administrator review, physician reminders, and billing submission.
2. **Friction in the handoff**: highlight the repeated EHR/Cerner lookups, date verification, reason selection, and average three-to-four reminders documented in the deck.
3. **Product intervention**: show how HAiLY was positioned between pending encounters and billing instead of replacing the underlying clinical systems.
4. **Service architecture**: redraw the flow from EHR/EMR ingestion through FHIR/HL7, the audit/detect/route agent, physician validation, and billing submission.
5. **Two-sided interface**: present the administrator dashboard and mobile physician review as complementary experiences with different information needs.
6. **Prototype strategy**: explain the retrospective recovery, real-time prevention, and continuous-intelligence progression proposed by the team.
7. **Contribution and result**: document Jumin's product UX, brand, pitch, and business-model work and the verified second-place Startup Weekend result.

The page may use market figures as sourced problem context. Internal pilot metrics will not be presented as Jumin's measured outcome. Raw pages marked "Privileged and Confidential," names, demo credentials, and identifiable clinical information will not be published. Diagrams and interface composites will be redrawn or tightly cropped and labeled as reconstructions based on the team presentation.

### AI-Assisted 3D Product Visualization

Remove Studio.OS from the visible portfolio and replace it with a new case study centered on the supplied `CupNoodle.blend` scene from Bubba's LA.

The working title is **AI-assisted 3D product visualization**. The proposed sequence is:

1. **Creative brief**: frame the goal as producing a playful, product-led 3D advertising scene for Cup Noodles Dill Pickle.
2. **Scene system**: reveal the cup, pickle character, graphic type, environmental elements, camera, lighting, and material groups as a composed system rather than a single generated image.
3. **MCP-assisted workflow**: describe the practical loop of directing Blender through MCP, inspecting the scene, and manually refining geometry, hierarchy, materials, lighting, camera, and motion.
4. **Animation construction**: show selected frames and object/action groupings from the verified 120-frame, 24-fps scene.
5. **Human judgment**: document where art direction and visual review were still required to resolve composition, legibility, product emphasis, and timing.
6. **Final output**: present a short optimized video or frame sequence plus still renders and a concise technical breakdown.

The copy will say "Blender MCP" only where it explains the workflow. The headline emphasizes design engineering and product visualization rather than positioning the work as an AI novelty. Generic Blender MCP add-on code will not be presented as Jumin's authorship.

## Information Architecture

All three pages use the existing case-study shell and current image dimensions. Detail comes from sequencing, captions, comparisons, and evidence layouts, not from increasing image size or introducing card grids.

Each page follows a shared reading rhythm:

1. concise project header and verified facts
2. problem or brief
3. system constraint or workflow
4. design response
5. prototype evidence
6. learning and documented outcome

Honda and HAiLY remain supporting homepage projects. The Blender project takes the Studio.OS position so the existing project count and two-column homepage layout remain stable.

## Content And Asset Strategy

### Honda assets

- Reuse the existing interaction-gap, toolbar, Muse Pen, and spatial-interface captures.
- Add selected captures for sticky notes, vehicle-part controls, architecture conflict, occlusion options, and future directions.
- Crop presentation chrome where it does not provide useful context.
- Redraw the Full Space versus Shared Space explanation as a clean portfolio diagram and label it retrospective.

### HAiLY assets

- Use the local HAiLY PDF only as a source.
- Create an anonymized current-state workflow, service architecture, and three-phase product direction graphic.
- Use tightly cropped interface evidence for the administrator and physician experiences.
- Exclude full confidential slides, personal names not necessary to the story, credentials, and potentially identifiable records.
- Add small source notes near any external market figure.

### Blender assets

- Produce new stills directly from `CupNoodle.blend` at portfolio-ready resolution.
- Export a short web-compatible animation only if the source scene renders reliably and the resulting asset can stay reasonably small.
- Include one scene-breakdown image and one frame sequence to make the construction process legible.
- Preserve the `.blend` source outside the public site; do not publish the editable production file.

New public images will receive descriptive filenames under `public/assets/projects`. Optimized WebP derivatives and manifest entries will be generated through the repository's existing image-preparation workflow.

## Data And Routing

### Project data

- Expand Honda and HAiLY primarily in `src/data/editorial.json`.
- Add the Blender case study to the appropriate editorial/internship data collection using the same schema as current projects.
- Remove the Studio.OS audit from visible project collections and homepage title/order maps.
- Keep content data-driven; avoid slug-specific case-study markup unless an evidence type cannot be represented by the existing schema.

### Old Studio.OS URL

Preserve `/work/studio-os-audit/` as a compatibility alias that resolves to the new Blender case study. The old audit content will no longer appear in navigation, project listings, SEO metadata, or the generated sitemap.

The new canonical route will be `/work/ai-3d-product-visualization/`.

## Interaction And Presentation

- Existing scroll reveal and section navigation remain intact.
- Case-study section navigation continues to track the current section with `aria-current="location"`.
- Evidence images open to their existing full-size treatment where appropriate.
- The Blender animation will use native controls, a poster frame, muted inline playback, and reduced-motion-safe behavior. It will not autoplay with sound.
- Mobile layouts stack comparisons and diagrams without horizontal scrolling.

## Accessibility

- Every new image receives a factual alt description tied to what it demonstrates.
- Decorative frame sequences use concise group descriptions instead of repetitive per-frame alt text.
- Diagrams preserve logical reading order outside their visual arrangement.
- Video includes a useful poster image and equivalent written explanation.
- Color is not the only way architectural conflicts, states, or workflow phases are distinguished.

## Content Integrity

- Keep official organization, employment, sprint, and award titles unchanged.
- Preserve team context and distinguish individual contribution from group output.
- Treat the HAiLY deck's market and internal pilot figures as source claims, not portfolio outcomes.
- Label reconstructed workflow and architecture graphics as retrospective.
- Do not invent usability findings, implementation status, production adoption, revenue impact, prompts, or Blender iteration counts.
- The verified Blender facts available for publication are a 120-frame scene at 24 fps, a 1920 x 1080 render setup, two cameras, grouped animated scene elements, and a Blender MCP add-on registered in the source file. Only facts that remain verified during implementation will be retained.

## Testing And Verification

Implementation will follow test-driven development and include:

- data tests for the expanded Honda and HAiLY sections
- route tests for the new canonical Blender route and Studio.OS compatibility alias
- asset tests ensuring every referenced local image exists
- content checks ensuring Studio.OS is absent from visible project collections
- privacy checks for prohibited HAiLY strings or credentials
- `npm run build` using a temporary build directory
- `npm test`
- browser QA at laptop, wide-desktop, and mobile sizes
- visual checks for complete screenshots, readable captions, section navigation, video behavior, and horizontal overflow
- console and broken-network-request checks

## Success Criteria

- Honda clearly explains both the desired spatial-review experience and the platform constraints that shaped it.
- HAiLY demonstrates research synthesis, service design, interface thinking, and product framing without exposing confidential source material.
- The Blender case study proves that the output is a structured, animated 3D scene and clearly communicates Jumin's design judgment in an MCP-assisted workflow.
- Studio.OS no longer appears as a portfolio project, while old external links remain functional.
- All three projects remain easy to scan on a typical laptop without oversized images or presentation-deck pacing.
- No unsupported ownership, outcome, or performance claim is introduced.
