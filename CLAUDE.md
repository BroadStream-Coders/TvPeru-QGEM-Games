# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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

QGEM Games is a **fullscreen game display** system for TV Perú's show "Que Gane el Mejor". It is a *display/visualization* tool, not a data collector: each game loads a session file and renders it fullscreen for broadcast (often over a chroma background that the TV studio keys). Each game is a self-contained **workspace** route under `src/app/workspaces/<name>/`.

## Architecture

**Two layout shells.** `src/app/page.tsx` is the home launcher (a `workspaces` array of cards linking into each route). `src/app/workspaces/layout.tsx` wraps every workspace with the shared `WorkspaceHeader` + footer.

**Workspace ↔ header handshake.** The header is rendered once by the workspace layout, but its contents are driven by each page through a Zustand store:

- `useWorkspaceHeader` (`src/hooks/use-workspace-header.ts`) holds `{ title, icon, onLoad }`.
- A workspace `page.tsx` (client component) calls `setHeader({ title, icon, onLoad })` inside a `useEffect`, and **must** call `resetHeader()` on unmount.
- `WorkspaceHeader` renders nothing until `title` is set; it shows the load button (`FileActions`) only when `onLoad` is provided.

**Load-only persistence.** `src/helpers/persistence.ts` exposes `loadJsonFile<T>(file, validator?)` and `loadZipFile(file)`. Save/export was intentionally removed — this app consumes session files, it does not produce them. Workspaces validate the parsed JSON with a type-guard passed to `loadJsonFile` (see `deletreo/page.tsx`).

**`FullScreen` is the display primitive** (`src/components/shared/FullScreen.tsx`). It renders a 16:9 "stage" that a workspace fills with its game UI. Two things are essential and non-obvious:

1. **The stage is a container-query context (`[container-type:size]`), so game content MUST be sized in container-query units (`cqi`/`cqw`/`cqh`), not `vw`/`rem`/`px`.** This is the whole point: `cqi` resolves against the stage box, so the layout looks *identical* whether or not the user is in browser fullscreen. Sizing content in viewport/absolute units reintroduces the bug where fullscreen and windowed views diverge. In fullscreen the stage is letterboxed (centered 16:9 on black) so the aspect ratio never distorts.

2. **The `background` prop** is a discriminated union — all three variants take a URL/value, render behind the content, and are meant to be swappable per game:

   ```tsx
   background={{ type: "color", value: "#00B140" }}   // hex; default is #000000
   background={{ type: "image", value: "https://…" }} // bg-cover div
   background={{ type: "video", value: "https://…" }} // autoPlay loop muted playsInline, object-cover
   ```

   Video/image URLs are expected to come from remote storage (Supabase). Video always plays muted + looped (no audio, autoplay-safe). Content is layered above the background via a `relative z-10` wrapper.

## Adding a new workspace

1. Create `src/app/workspaces/<name>/page.tsx` — a client component that calls `setHeader` (with an `onLoad` handler using `loadJsonFile` + a type-guard) and `resetHeader` on unmount.
2. Render `<FullScreen background={…}>` and size the game UI in `cqi` units.
3. Register the workspace in the `workspaces` array in `src/app/page.tsx`.

## Conventions

- `@/` maps to `src/` (`tsconfig.json`).
- No code comments unless explicitly requested; record tech debt in `docs/technical-debt.md` instead.
- UI copy is in Spanish.
