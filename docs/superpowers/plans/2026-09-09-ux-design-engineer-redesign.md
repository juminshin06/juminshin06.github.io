# UX Design Engineer Portfolio Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe the portfolio for current Product Designer and Design Engineer hiring with faster role recognition, evidence-led project summaries, readable case studies, and purposeful interaction.

**Architecture:** Keep the existing React/Vite route and data architecture. Recompose `Home.jsx` and `CaseStudy.jsx` around reusable editorial rows and story blocks, preserving source data and static prerendering; evolve the CSS module and motion helper without adding a UI framework.

**Tech Stack:** React 18, Vite 5, CSS Modules, Lucide React, Node test runner

**Spec:** Approved homepage, case-study, and mobile concept images generated in the current Codex task.

## Global Constraints

- Preserve all factual outcomes, roles, metrics, and official titles from the current project data and resume.
- Keep GitHub Pages routes, prerendering, direct links, and responsive image behavior intact.
- Use a true white background, near-black text, vermilion accent, readable sans typography, square media, and restrained motion.
- Present the target position as UX Design Engineer while keeping portfolio evidence honest about prototypes versus shipped work.
- Keep reduced-motion, keyboard, focus, and mobile behavior accessible.
- Do not edit generated `dist` output.

---

### Task 1: Define the recruitment-facing content contract

**Files:**
- Modify: `tests/presentation.test.mjs`
- Modify: `src/portfolio/Home.jsx`

**Interfaces:**
- Consumes: `featuredProjects`, `practiceProjects`, and factual project fields from `src/data/portfolio.js`
- Produces: server-rendered homepage copy and links for the new hierarchy

- [x] **Step 1: Write the failing homepage hierarchy test**

Assert that the rendered homepage contains `UX Design Engineer`, `Case studies`, `From research to working interfaces.`, `Research`, `Interaction design`, `Prototyping`, and `Front-end`, and no longer contains `Selected work` or `UX in practice`.

- [x] **Step 2: Run the presentation test and confirm it fails for the missing hierarchy**

Run: `node --test tests/presentation.test.mjs`

- [x] **Step 3: Recompose the homepage**

Build a compact two-column hero, evidence-led case-study rows, an additional-work rail, a capability band, and the existing personal introduction. Keep project URLs and factual project content data-driven.

- [x] **Step 4: Run the presentation test and confirm it passes**

Run: `node --test tests/presentation.test.mjs`

### Task 2: Integrate evidence into the case-study narrative

**Files:**
- Modify: `tests/presentation.test.mjs`
- Modify: `src/portfolio/CaseStudy.jsx`
- Modify: `src/data/editorial.json`

**Interfaces:**
- Consumes: optional `sectionId` on project content blocks
- Produces: `StoryArtifact` content rendered next to the section it supports, with unmatched resources retained safely

- [x] **Step 1: Write the failing integrated-artifact test**

Assert that the Honda route renders an evidence figure inside its associated story section and that the old detached `Project artifacts` heading is absent.

- [x] **Step 2: Run the presentation test and confirm the expected failure**

Run: `node --test tests/presentation.test.mjs`

- [x] **Step 3: Associate documented Honda and ARS assets with narrative sections**

Add only `sectionId` metadata to existing image blocks; do not alter sources, captions, or factual claims.

- [x] **Step 4: Recompose the case-study template**

Create a concise opening grid, horizontal sticky reading navigation, large hero media, contribution summary, alternating story/evidence sections, honest outcome band, and next-project row.

- [x] **Step 5: Run presentation and project-data tests**

Run: `node --test tests/presentation.test.mjs tests/iya-projects.test.mjs`

### Task 3: Implement the coordinated responsive visual system

**Files:**
- Modify: `src/index.css`
- Modify: `src/portfolio/Portfolio.module.css`
- Modify: `src/portfolio/usePageMotion.js`

**Interfaces:**
- Consumes: existing CSS module class names and `[data-reveal]` hooks
- Produces: desktop, tablet, mobile, hover, focus, and reduced-motion presentation

- [x] **Step 1: Add a failing stylesheet contract test**

Assert true-white `--paper`, readable base labels, stable case media ratios, and mobile single-column project layouts.

- [x] **Step 2: Run the stylesheet test and confirm it fails against the old visual system**

Run: `node --test tests/presentation.test.mjs`

- [x] **Step 3: Implement the visual system and interaction states**

Use a 12-column desktop grid, 48/32/20px gutters, controlled type scale, hairline rules, project-specific imagery, hover previews, sticky section progress, and compact mobile layouts. Keep text visible before animation and honor live reduced-motion changes.

- [x] **Step 4: Run all automated tests**

Run: `npm test`

### Task 4: Verify build and visual fidelity

**Files:**
- Modify only if a verified issue requires correction

**Interfaces:**
- Consumes: local Vite site and approved concept images
- Produces: prerendered route verification and browser QA evidence

- [x] **Step 1: Build outside tracked `dist`**

Run: `PORTFOLIO_BUILD_DIR=/tmp/jumin-portfolio-build npm run build`

- [x] **Step 2: Test the homepage and representative case study in the browser**

Verify desktop and 390px mobile layouts, navigation, hover/focus states, direct routes, console output, and no text overlap.

- [x] **Step 3: Compare browser screenshots with the approved concepts**

Inspect hero hierarchy, case-study rhythm, typography, media treatment, project anatomy, and mobile continuation in one QA pass.

- [x] **Step 4: Run final checks**

Run: `npm test` and `git diff --check`
