# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a designer's personal portfolio website — interactive, pastel-toned, and visually expressive. The primary spec lives in `Portfolio_Development_Guide.md`.

**Stack:** React + Vite, p5.js (landing canvas), Tailwind CSS or CSS Modules, deployed to Vercel.

## Commands

```bash
npm install          # install dependencies
npm run dev          # local dev server (http://localhost:5173)
npm run build        # production build → dist/
npm run preview      # preview production build locally
npm run deploy       # build + push dist/ to gh-pages branch (GitHub Pages)
```

## Architecture

Three full-screen sections, scrolled vertically:

1. **Landing (p5.js canvas)** — Mouse trail effect (`trails[]` array), click-to-spawn bubbles (`bubbles[]` array), custom translucent cursor bubble. Mobile touch supported. Cap array sizes for performance.

2. **About** — Face photo (circular), short bio, education, and social links (LinkedIn, GitHub, Google Scholar, mailto). Desktop: photo-left / text-right. Mobile: vertical stack.

3. **Projects (main content)** — CSS Grid of cards. Each card shows thumbnail first, then title, type (UX/UI / Product / 3D / etc.), team (Team / Solo), and year. Hover: scale up + blur/saturate filter + shadow, 250–300ms transition.

Project data lives in a `projects.json` file:
```json
[
  { "id": "proj-001", "title": "...", "type": "UX/UI", "team": "Team", "year": 2025, "thumbnail": "/assets/projects/thumb.webp" }
]
```

## Design System

| Token | Value |
|---|---|
| Background | `#FFFFFF` |
| Sea Blue Pastel | `#E6F7FF` |
| Light Sky | `#D7F0FF` |
| Accent Blue | `#9BD3FF` |
| Border radius | 16px minimum |
| Transition speed | 250–300ms |

Aesthetic: soft shadows, glow/blur effects, rounded corners throughout. All images in WebP format with alt text. Lighthouse compliance required.

## Suggested Build Order

Per the spec: Projects grid → About section → p5.js integration → styling/animation polish → performance optimization → Vercel deploy.
