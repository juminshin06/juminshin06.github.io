# Jumin Shin Portfolio

An editorial portfolio for human-centered AI, interaction design and research.
React 18, Vite 5, CSS Modules and build-time rendered HTML. Hosted on GitHub Pages.

## Develop

Use Node 20.19+ and npm.

```sh
npm ci
npm run dev
```

Open the URL printed by Vite, normally http://localhost:5173. Source edits update the local preview; they do not publish to GitHub Pages.

## Content

- `src/data/editorial.json`: selected projects, additional work and archive framing.
- `src/data/projects.json`: preserved original project metadata and media.
- `src/data/profile.json`: biography, experience, education, publications and recognition.
- `src/data/events.json`: Life entries.
- `public/assets/JuminShin_Resume.pdf`: current resume.
- `src/portfolio`: page components, shared primitives and the visual system.
- `docs/portfolio-strategy.md`: research, content inventory and redesign rationale.

All 12 original projects remain accessible. The combined collection contains 20 projects, with 5 featured on the homepage. Case-study text must be supported by the resume or original materials; do not infer unrecorded metrics, interviews or shipped outcomes.

## Verify And Build

```sh
npm test
npm run build
npm run preview
```

The build renders 25 public routes plus a 404 page. Native links work with direct navigation and refresh. Pages have individual titles, descriptions, Open Graph metadata, canonical URLs and structured data. `/handsign/index.html` remains a separate app; its iframe is only loaded on request.

This repository still tracks legacy `dist` output. For local verification without changing those files:

```sh
PORTFOLIO_BUILD_DIR=/tmp/jumin-portfolio-build npm run build
npm run preview -- --outDir /tmp/jumin-portfolio-build
```

## Images

Original assets are preserved. `ProjectImage` serves width-aware WebP derivatives from `public/assets/optimized/manifest.json`, with lazy loading and intrinsic dimensions. Full-size case-study links still open original files.

Regeneration requires Sharp, available through the Codex workspace runtime or a local installation:

```sh
node scripts/prepare-images.mjs --runtime-sharp /absolute/path/to/node_modules/sharp
```

The checked-in derivatives mean Sharp is not required by development, CI or deployment. New images without derivatives fall back to their supplied source path. Geist's license is included in `public/fonts/OFL.txt`.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`: install, build, upload `dist`, deploy to GitHub Pages. Local edits alone do not update the public site. The existing manual `npm run deploy` command is retained; do not mix deployment strategies without checking the repository's Pages configuration.
