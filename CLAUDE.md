# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
pnpm dev        # dev server at localhost:3000
pnpm build      # production build
pnpm lint       # eslint
```

No test suite configured yet.

## Stack

- **Next.js 16.2.4** + **React 19** — App Router, src/ layout
- **Tailwind CSS v4** — CSS-variable based design tokens in `src/app/globals.css`
- **shadcn/ui** (radix-nova style) — components in `src/components/ui/`
- **Zustand v5** — global state via hooks in `src/hooks/`
- **JSZip** — browser-side file bundling (ZIP = JSON + images)
- Package manager: **pnpm**

## Architecture

QGEM Games is a fullscreen game display system for TV Perú's show "Que Gane el Mejor". Each game has its own **workspace** under `src/app/workspaces/<name>/`.

The goal is fullscreen game displays that load session data from `.json` or `.zip` files (ZIP when the game includes images, bundled alongside the session JSON). Each workspace is a self-contained route under `src/app/workspaces/<name>/`.

**Shared workspace pattern** — every workspace follows this structure:

1. **`useWorkspaceHeader`** (Zustand store, `src/hooks/use-workspace-header.ts`) — workspace page calls `setHeader()` in a `useEffect` to inject its title, icon, save/load callbacks into the shared `WorkspaceHeader` component rendered by `src/app/workspaces/layout.tsx`. Must call `resetHeader()` on unmount.

2. **`useWorkspaceGroups<TItem>`** (`src/hooks/use-workspace-groups.ts`) — generic hook managing a `TItem[][]` (array of groups, each group an array of items). Provides `addGroup`, `removeGroup`, `addItem`, `removeItem`, `updateItem`, `replaceGroup`.

3. **GroupColumn components** (`src/components/shared/group-column/`) — reusable column/card UI that workspace pages compose. The workspace creates a domain-specific column component (e.g. `DeletreoColumn`) that wraps `GroupColumn`.

4. **`src/helpers/persistence.ts`** — `saveAsJson`, `loadJsonFile`, `saveAsZip`, `loadZipFile` — browser download/upload helpers used by every workspace's save/load handlers.

5. **`src/helpers/data-processing.ts`** — `parseExcelPaste` / `getColumnData` — parse tab-separated text pasted from Excel for quick-load features.

**Adding a new workspace:**
- Create `src/app/workspaces/<name>/page.tsx` — client component that uses `useWorkspaceGroups` and calls `setHeader` with save/load handlers.
- Create a domain column component composing `GroupColumn`.
- Register the workspace in `src/app/page.tsx`'s `workspaces` array.

## Path aliases

`@/` maps to `src/` (configured in `tsconfig.json`).
