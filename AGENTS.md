# AGENTS.md

Project-specific instructions for Codex working in this repository.

## Project Overview

This is Jumin Shin's personal portfolio website: an interactive, visually expressive React/Vite site with project case studies, a Life page, custom canvas effects, and an embedded HandSign demo.

Primary stack:
- React 18 + Vite 5
- CSS Modules for component styling
- `@paper-design/shaders-react` for the mesh background
- `canvas-confetti` for the floating PDF button
- A standalone Vanilla JS demo in `public/handsign`

## Installed Codex Plugins

This machine is expected to have these `openai-curated` plugins installed and enabled. If a task depends on one of them, verify availability first with `codex plugin list --marketplace openai-curated` or use `tool_search` to expose the relevant app/tool in the current Codex session.

Verified installed/enabled plugins:
- `figma@openai-curated`
- `vercel@openai-curated`
- `superpowers@openai-curated`
- `github@openai-curated`
- `build-web-apps@openai-curated`
- `coderabbit@openai-curated`
- `product-design@openai-curated`

Use installed plugin skills when the task matches them:
- Figma: use for Figma file inspection, design-to-code, Code Connect, design system rule generation, FigJam, slides, motion specs, SwiftUI handoff, and creating or updating Figma designs. Notable skills include `figma-use`, `figma-design-to-code`, `figma-code-connect`, `figma-generate-design`, `figma-generate-library`, `figma-generate-diagram`, `figma-use-figjam`, `figma-use-slides`, `figma-use-motion`, and `figma-implement-motion`.
- Vercel: use for Vercel deployment risk audits, Vercel CLI/API work, environment variables, domains, caching, functions, observability, and Next.js/Vercel-specific guidance. This portfolio currently deploys through GitHub Pages, so do not migrate deployment to Vercel unless the user asks.
- Superpowers: use for process-heavy coding work, especially brainstorming, planning, TDD, systematic debugging, verification before completion, branch finishing, code review, and subagent-driven development.
- GitHub: use for repository, PR, issue, GitHub Actions, and review workflows when local git is not enough or when the user asks to work with GitHub directly.
- Build Web Apps: use for frontend implementation, redesigns, React/Vite best practices, browser-based visual QA, responsive debugging, shadcn, Stripe, or Supabase/Postgres guidance when relevant.
- CodeRabbit: use when the user asks for CodeRabbit review or wants AI review of the current diff/PR.
- Product Design: use for early product direction, UX audits, user-context gathering, design QA, ideation, screenshot/image-to-code, URL-to-code, and prototype-oriented design work.

Before saying a plugin or external capability is unavailable, search for the plugin/tool first. If a plugin is installed but its app/tool is not exposed in the current session, say that plainly and continue with the best local fallback.

## Commands

Use npm for this project.

```bash
npm ci
npm run dev
npm run build
npm run preview
npm run deploy
```

Notes:
- `npm run dev` starts Vite, usually at `http://localhost:5173`.
- There is no dedicated lint or test script in `package.json`.
- Use `npm run build` as the main verification command after changing app code, data, or public assets.
- If dependencies are missing, install with `npm ci` before running build or dev commands.

## Architecture

The app does not use React Router. Page-level navigation is state-driven in `src/App.jsx`.

Main views:
- Home: `LandingSection`, `ProjectsSection`, `AboutSection`
- Project detail: `ProjectPage`
- Life detail: `LifePage`

Global layers:
- `MeshBackground`
- `PixelBackground`
- `GlobalCursor`
- `FloatingPDFButton`
- `NavBar`
- `Footer`

Project opening is handled through `window.dispatchEvent(new CustomEvent('open-project', ...))`, with the listener in `src/App.jsx`.

## Content Sources

Edit portfolio content primarily through:
- `src/data/projects.json` for project cards and case-study content
- `src/data/events.json` for Life page entries
- `src/components/AboutSection.jsx` for bio, education, work, research, publications, and recognition

Static assets used by JSON paths live under:
- `public/assets/projects`
- `public/assets/life`
- `public/assets`

Profile images imported by React live under:
- `src/assets`

The `src/components/Figma_Image` folder appears to contain source or backup images and is not currently imported by the app.

## HandSign Demo

`public/handsign` is a standalone app embedded by the HandSign project iframe at `/handsign/index.html`.

It uses:
- MediaPipe Hands from CDN
- Canvas API
- MediaRecorder
- Web Share API
- jsPDF from CDN

Keep changes to this mini-app scoped to `public/handsign/index.html`, `public/handsign/style.css`, and `public/handsign/app.js`.

## Styling Conventions

- Prefer CSS Modules next to their components.
- Match the current visual language: clean portfolio layout, glass surfaces, lime/pixel accents, soft motion.
- Do not introduce a new UI framework unless the user explicitly asks.
- Avoid broad restyles when making content or bugfix changes.
- Keep mobile behavior in mind; many sections already have responsive CSS.

## Assets And Performance

This repository contains large images and PDFs. Be careful before replacing or duplicating assets.

Current heavy asset areas:
- `public/assets/Jumin_portfolio.pdf`
- `public/assets/projects/*.png`
- `public/assets/projects/*.pdf`
- mirrored build output in `dist/assets`

If optimizing performance, start with image/PDF compression, unused duplicate assets, and whether generated `dist` files should be refreshed or tracked.

## Deployment

GitHub Pages deployment is configured in `.github/workflows/deploy.yml`.

On pushes to `main`, the workflow:
1. Runs `npm ci`
2. Runs `npm run build`
3. Uploads `dist`
4. Deploys to GitHub Pages

`package.json` also includes `npm run deploy`, which uses `gh-pages -d dist`. Do not switch deployment strategies without checking with the user.

## Files That May Be Legacy Or Experimental

These files are present but are not currently used by `src/App.jsx`:
- `src/components/ProjectCard.jsx`
- `src/components/LifeSection.jsx`
- `src/components/TabSection.jsx`
- `src/components/CardDeck.jsx`
- `src/components/LightCanvas.jsx`
- `src/components/GradientBackground.jsx`
- `src/components/MouseSpotlight.jsx`
- related CSS modules for those components
- `experiments/bloom-glass.html`

Do not delete them unless the user asks for cleanup.

## Editing Rules

- Do not edit generated `dist` output unless the task is specifically about deployment artifacts or the user asks to refresh the build output.
- Do not remove tracked metadata or legacy files unless the user asks for cleanup.
- Preserve unrelated user changes.
- Keep edits scoped and consistent with existing code style.
- Prefer data edits in JSON over hardcoding new project/event content into React components.

## Verification

After source changes, run:

```bash
npm run build
```

If changing only documentation, no build is required; check `git diff --check` instead.
