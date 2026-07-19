# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Documento clave:** para decisiones **generales o de arquitectura**, lee primero
> `docs/engine-arquitectura.md` — es la fuente de verdad del engine (qué es, cómo
> piensa, cómo se nombra, en qué estado está). Para cambios **específicos y acotados**
> no siempre hace falta.
>
> Para **migrar un juego desde Unity** (prefab → scene.json + behavior), sigue
> `docs/migracion-unity.md` — el proceso completo ya está documentado ahí.

## Commands

```bash
pnpm dev        # dev server at localhost:3000
pnpm build      # production build — preferred for validation (also runs the TS type-check)
pnpm lint       # eslint (style/rules only — does NOT type-check)
pnpm format     # prettier --write over the repo
```

To validate a change, prefer `pnpm build`: `eslint` does not type-check, so `next build` (which runs TypeScript) is what catches type errors. No test suite configured yet.

## Stack

- **Next.js 16.2.4** + **React 19** — App Router, `src/` layout
- **Tailwind CSS v4** — CSS-variable design tokens in `src/app/globals.css` (custom tokens like `brand`, `success`, `text-2xs`/`3xs`, `tracking-header`)
- **shadcn/ui** (radix-nova style) — primitives in `src/components/ui/`
- **Zustand v5** — global state via hooks in `src/hooks/`
- **JSZip** — browser-side ZIP reading (session bundle = JSON + images)
- Package manager: **pnpm**

## What this app is

QGEM Games is a **fullscreen game display** system for TV Perú's show "Que Gane el Mejor". It is a _display/visualization_ tool, not a data collector: each game loads a session file and renders it fullscreen for broadcast (often over a chroma background that the TV studio keys). Each game is a self-contained **workspace** route under `src/app/workspaces/<name>/`.

**The app is deployed on the internet** (deploy wired to the GitHub repo), same as its sibling project QGEM Studio — it is NOT a localhost-only app. The studio machine consumes the public URL. "Target is Chrome only (the studio machine)" refers to where it is _rendered on air_, not where it is hosted.

## Architecture

**Two layout shells.** `src/app/page.tsx` is the home launcher (a `workspaces` array of cards linking into each route). `src/app/workspaces/layout.tsx` wraps every workspace with the shared `WorkspaceHeader` + footer.

**Workspace ↔ header handshake.** The header is rendered once by the workspace layout, but its contents are driven by each page through a Zustand store:

- `useWorkspaceHeader` (`src/hooks/use-workspace-header.ts`) holds `{ title, icon, onLoad, … }`.
- `EditorLayout` calls `setHeader(…)` inside a `useEffect` (fed from the workspace's `GameDefinition`) and calls `resetHeader()` on unmount — workspace pages don't touch the store themselves.
- `WorkspaceHeader` renders nothing until `title` is set; it shows the load button (`FileActions`) only when `onLoad` is provided.

**No data persistence (design philosophy).** This project does **not** persist data — not in `localStorage`, not in a database, not anywhere. Nothing is meant to survive a page reload. Files loaded from the user's machine via blob URLs (`URL.createObjectURL`) intentionally die on reload; that is by design, **not** technical debt. Do not propose adding `localStorage`, IndexedDB, a DB, or a save/export flow unless the user explicitly asks. A future Supabase integration may serve remote read-only assets (images/video for backgrounds), but **not** as a storage backend for app data.

**Load-only persistence.** `src/helpers/persistence.ts` exposes `loadJsonFile<T>(file, validator?)` and `loadZipFile(file)`. Save/export was intentionally removed — this app consumes session files, it does not produce them. Workspaces validate the parsed JSON with a type-guard passed to `loadJsonFile` (see `album/session.ts`).

**`Scene` is the display primitive** (`src/components/shared/engine/Scene.tsx`). It renders the 16:9 "stage" of the Game view and owns browser fullscreen (letterboxed 16:9 on black, optional hidden cursor). The editor's Scene panel does NOT use it — that is `SceneCanvas`, a separate editing canvas. Two things are essential and non-obvious:

1. **The stage is a container-query context (`[container-type:size]`), so game content MUST be sized in container-query units (`cqi`/`cqw`/`cqh`), not `vw`/`rem`/`px`.** This is the whole point: `cqi` resolves against the stage box, so the layout looks _identical_ whether or not the user is in browser fullscreen. Sizing content in viewport/absolute units reintroduces the bug where fullscreen and windowed views diverge.

2. **Nothing inside the stage is selectable** (`select-none` on the stage container, RM-040): the Game view is a broadcast display, so text selection and drag-selection are disabled wholesale. This does NOT block pointer events — future in-game buttons/drag interactions work on top of it (gate them on `useSceneViewMode() === "game"`).

## Adding a new workspace

1. Create `src/app/workspaces/<name>/game.ts` — a `GameDefinition` (scene `gameObjects`, `assets`, custom `components`, `behavior`, session `onLoad` with a type-guard).
2. Create `page.tsx` — a client component that just renders `<EditorLayout game={…} />`.
3. Register the workspace in the `workspaces` array in `src/app/page.tsx`.

For a game migrated from Unity, `docs/migracion-unity.md` covers this end to end.

## Conventions

- `@/` maps to `src/` (`tsconfig.json`).
- No code comments unless explicitly requested; record tech debt in `docs/logbook/technical-debt.md` instead.
- UI copy is in Spanish.
- **Target is Chrome only** (the studio machine). Don't spend effort on cross-browser compatibility; recent Chromium is the assumed runtime.
- **Default background is dark/black** (the stage's `bg-stage` token). New workspaces don't assume a chroma background.
- **Session file format is per-game.** Games that carry images use a **ZIP bundle** (`loadZipFile` — JSON + embedded assets, so there are no loose folders/paths to manage); simpler games use plain **JSON** (`loadJsonFile`). This will likely change once Supabase storage lands, but that is a **distant** future, not a current concern.
