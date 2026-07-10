"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type HTMLAttributes,
} from "react";
import {
  DockviewReact,
  type DockviewApi,
  type DockviewReadyEvent,
  type IDockviewPanelProps,
  type IDockviewPanelHeaderProps,
} from "dockview-react";
import {
  ListTree,
  SlidersHorizontal,
  SquareDashed,
  Play,
  HardDrive,
  Maximize,
  X,
  type LucideIcon,
} from "lucide-react";
import "dockview-react/dist/styles/dockview.css";
import "../dockview-theme.css";

import { Scene } from "@engine/Scene";
import { GameObjectView } from "@engine/GameObjectView";
import { SceneCanvas } from "@engine/editor/SceneCanvas";
import { Hierarchy } from "@engine/Hierarchy";
import { GameObjectInspector } from "@engine/GameObjectInspector";
import { RectTransformInspector } from "@engine/RectTransformInspector";
import { AddComponentButton } from "@engine/AddComponentButton";
import { gameObjectKind, type GameObject } from "@engine/gameObject";
import {
  createComponentRegistry,
  NATIVE_COMPONENTS,
  ComponentRegistryProvider,
  type ComponentRegistry,
} from "@engine/componentRegistry";
import {
  EditorProvider,
  useEditor,
  type EditorApi,
} from "@engine/editor/editorContext";
import { AssetBrowser } from "@engine/AssetBrowser";
import {
  AssetsProvider,
  useAssets,
  type LoadedAssetsState,
} from "@engine/assetsContext";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import { useStore } from "zustand";
import { cn } from "@/lib/utils";
import { useSceneEditor } from "@/hooks/use-scene-editor";
import { useEditorStore } from "@/hooks/use-editor-store";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { mergeRuntime } from "@engine/runtime/sceneRuntime";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { usePlayMode, type PlayEditing } from "@/hooks/use-play-mode";
import { useGameSession } from "@/hooks/use-game-session";
import { useAssetPreloader } from "@/hooks/use-asset-preloader";
import { toManifest, localAssetFromFile } from "@/helpers/asset-source";
import { useMemoryBudget } from "@/hooks/use-memory-budget";
import { MemoryBadge } from "@/components/shared/MemoryBadge";
import type { LocalAsset } from "@/helpers/asset-source";
import type { AssetKind, LoadedAsset } from "@/helpers/asset-preloader";

const useRestricted = () =>
  usePlayMode((s) => s.playing && s.editing === "restrict");

function HierarchyPanel() {
  const e = useEditor();
  const restricted = useRestricted();
  return (
    <div
      className={cn(
        "scrl h-full overflow-y-auto bg-panel p-3",
        restricted && "pointer-events-none opacity-60",
      )}
    >
      <Hierarchy
        nodes={e.hierarchyNodes}
        selectedIds={e.selectedIds}
        onSelect={(id, additive) =>
          additive
            ? e.setSelectedIds((prev) =>
                prev.includes(id)
                  ? prev.filter((x) => x !== id)
                  : [...prev, id],
              )
            : e.setSelectedId(id)
        }
        onCreate={(parentId) => e.createNewGameObject(parentId ?? undefined)}
        onDelete={e.deleteGameObject}
        onReorder={e.handleReorder}
        onToggleActive={(id, active) => e.patchGameObject(id, { active })}
      />
    </div>
  );
}

function InspectorPanel() {
  const e = useEditor();
  const selected = e.selected;
  const restricted = useRestricted();
  return (
    <div
      className={cn(
        "scrl flex h-full flex-col overflow-y-auto bg-panel",
        restricted && "pointer-events-none opacity-60",
      )}
    >
      {selected ? (
        <>
          <GameObjectInspector
            name={selected.name}
            kind={gameObjectKind(selected.components)}
            onNameChange={(name) => e.patchGameObject(selected.id, { name })}
            active={selected.active}
            onActiveChange={(active) =>
              e.patchGameObject(selected.id, { active })
            }
          />
          <RectTransformInspector
            transform={selected.transform}
            setAxis={e.setAxis}
            setRotation={e.setRotation}
          />
          {selected.components.map((component, index) => {
            const Editor = e.registry.get(component.type)?.editor;
            return Editor ? (
              <Editor
                key={index}
                component={component}
                onChange={(next) => e.patchComponent(selected.id, index, next)}
                onRemove={() => e.removeComponent(selected.id, index)}
                onResize={(size) => e.setGameObjectSize(selected.id, size)}
                onAddComponent={(type) => e.addComponent(selected.id, type)}
              />
            ) : null;
          })}
          <AddComponentButton
            options={e.registry.options}
            onAdd={(type) => e.addComponent(selected.id, type)}
          />
        </>
      ) : e.selectedIds.length > 1 ? (
        <p className="p-3 text-2xs text-dim">
          {e.selectedIds.length} objetos seleccionados.
        </p>
      ) : (
        <p className="p-3 text-2xs text-dim">
          Crea un objeto con click derecho en Hierarchy.
        </p>
      )}
    </div>
  );
}

function ScenePanel() {
  const restricted = useRestricted();
  return (
    <div
      className={cn("h-full", restricted && "pointer-events-none opacity-60")}
    >
      <SceneCanvas />
    </div>
  );
}

const PLAY_EDITING_OPTIONS: { value: PlayEditing; label: string }[] = [
  { value: "restrict", label: "Restrict" },
  { value: "edit", label: "Edit" },
];

function GamePanel(props: IDockviewPanelProps) {
  const e = useEditor();
  const runtime = useSceneRuntime((s) => s.runtime);
  const setRuntimeTransform = useSceneRuntime((s) => s.setTransform);
  const playing = usePlayMode((s) => s.playing);
  const merged = useMemo(
    () => (playing ? mergeRuntime(e.gameObjects, runtime) : e.gameObjects),
    [playing, e.gameObjects, runtime],
  );
  const editing = usePlayMode((s) => s.editing);
  const setEditing = usePlayMode((s) => s.setEditing);
  const toggleRef = useRef<(() => void) | null>(null);
  const registerFullscreen = useCallback((toggle: () => void) => {
    toggleRef.current = toggle;
  }, []);

  // Entrar a play activa la pestaña Game (puede estar oculta tras Scene).
  useEffect(() => {
    if (playing) props.api.setActive();
  }, [playing, props.api]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[30px] shrink-0 items-center gap-2 border-b border-line bg-head px-2">
        <span className="font-mono text-2xs text-faint">On Play</span>
        <div className="flex items-center rounded-[5px] bg-elev p-0.5">
          {PLAY_EDITING_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setEditing(value)}
              className={cn(
                "rounded-[4px] px-2 py-0.5 text-2xs font-medium transition-colors",
                editing === value
                  ? "bg-elev-2 text-ink"
                  : "text-dim hover:text-ink",
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <button
          onClick={() => toggleRef.current?.()}
          title="Pantalla completa"
          className="flex items-center gap-1.5 rounded-[5px] px-2 py-1 text-2xs font-medium text-dim transition-colors hover:bg-elev hover:text-ink"
        >
          <Maximize size={12} />
          Fullscreen
        </button>
      </div>
      <div className="min-h-0 flex-1">
        <Scene
          viewMode="game"
          hideCursorOnFullscreen
          onFullscreenReady={registerFullscreen}
        >
          <div className="absolute inset-0">
            {merged
              .filter((go) => !go.parentId && go.active)
              .map((go) => (
                <GameObjectView
                  key={go.id}
                  gameObject={go}
                  allGameObjects={merged}
                  selectedId={null}
                  onAnimatePosition={(id, position) =>
                    setRuntimeTransform(id, { position })
                  }
                />
              ))}
          </div>
        </Scene>
      </div>
    </div>
  );
}

function AssetsPanel() {
  const {
    catalog,
    assets,
    statuses,
    addLocalFiles,
    folders,
    createFolder,
    moveAssets,
    moveFolder,
  } = useAssets();
  return (
    <AssetBrowser
      catalog={catalog}
      assets={assets}
      statuses={statuses}
      onAddFiles={addLocalFiles}
      folders={folders}
      onCreateFolder={createFolder}
      onMove={moveAssets}
      onMoveFolder={moveFolder}
    />
  );
}

function StatusBar() {
  const e = useEditor();
  const { progress } = useAssets();
  const playing = usePlayMode((s) => s.playing);
  const { loaded, total } = progress;
  const loading = total > 0 && loaded < total;
  const objCount = e.gameObjects.length;
  const sel = e.selected;

  return (
    <div className="flex h-[23px] shrink-0 items-center gap-3 border-t border-edge bg-gradient-to-b from-[#202327] to-[#1a1d20] px-3 font-mono text-[11px] text-faint">
      {playing && (
        <span className="flex items-center gap-1.5 font-semibold text-play">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-play" />
          PLAY
        </span>
      )}
      <span className="flex items-center gap-1.5 text-dim">
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            loading ? "bg-type-video" : "bg-success",
          )}
        />
        {loading ? "Cargando assets…" : "Listo"}
      </span>
      <span>
        {objCount} {objCount === 1 ? "objeto" : "objetos"}
      </span>
      {sel && (
        <span>
          Sel: <span className="text-dim">{sel.name}</span>
        </span>
      )}
      <div className="flex-1" />
      {total > 0 && (
        <span className={cn(loading && "text-acc")}>
          {loaded}/{total} assets
        </span>
      )}
      <MemoryBadge />
      <span className="text-line-2">|</span>
      <span>QGEM Engine</span>
    </div>
  );
}

const TAB_ICONS: Record<string, { Icon: LucideIcon; color: string }> = {
  hierarchy: { Icon: ListTree, color: "text-type-text" },
  inspector: { Icon: SlidersHorizontal, color: "text-anim" },
  scene: { Icon: SquareDashed, color: "text-type-text" },
  game: { Icon: Play, color: "text-type-video" },
  assets: { Icon: HardDrive, color: "text-type-image" },
};

function useTabTitle(api: IDockviewPanelHeaderProps["api"]) {
  const [title, setTitle] = useState(api.title);
  useEffect(() => {
    const d = api.onDidTitleChange((e) => setTitle(e.title));
    setTitle(api.title);
    return () => d.dispose();
  }, [api]);
  return title;
}

type PanelTabProps = IDockviewPanelHeaderProps &
  HTMLAttributes<HTMLDivElement> & { tabLocation?: unknown };

function PanelTab({
  api,
  containerApi: _containerApi,
  params: _params,
  tabLocation: _tabLocation,
  ...rest
}: PanelTabProps) {
  const title = useTabTitle(api);
  const meta = TAB_ICONS[api.id];
  return (
    <div {...rest} className="dv-qgem-tab">
      {meta && <meta.Icon className={cn("h-3.5 w-3.5 shrink-0", meta.color)} />}
      <span className="dv-qgem-tab-title">{title}</span>
      <button
        type="button"
        title="Cerrar"
        className="dv-qgem-tab-close"
        onPointerDown={(e) => e.preventDefault()}
        onClick={(e) => {
          e.preventDefault();
          api.close();
        }}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}

const components = {
  hierarchy: HierarchyPanel,
  inspector: InspectorPanel,
  scene: ScenePanel,
  game: GamePanel,
  assets: AssetsPanel,
};

function buildDefaultLayout(api: DockviewApi) {
  const scene = api.addPanel({
    id: "scene",
    component: "scene",
    title: "Scene",
    renderer: "always",
  });
  api.addPanel({
    id: "game",
    component: "game",
    title: "Game",
    position: { referencePanel: "scene", direction: "within" },
  });
  // Assets first so it splits the root into rows and spans the full width at the
  // bottom; hierarchy/inspector are added after so they only split the top row.
  api.addPanel({
    id: "assets",
    component: "assets",
    title: "Local",
    initialHeight: 232,
    position: { referencePanel: "scene", direction: "below" },
  });
  api.addPanel({
    id: "hierarchy",
    component: "hierarchy",
    title: "Hierarchy",
    initialWidth: 262,
    position: { referencePanel: "scene", direction: "left" },
  });
  api.addPanel({
    id: "inspector",
    component: "inspector",
    title: "Inspector",
    initialWidth: 336,
    position: { referencePanel: "scene", direction: "right" },
  });
  scene.api.setActive();
}

export function EditorLayout({ game }: { game: GameDefinition }) {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);
  const resetRuntime = useSceneRuntime((s) => s.reset);
  const playing = usePlayMode((s) => s.playing);
  const hasSession = useGameSession((s) => s.session !== null);
  const playDisabled = !!game.requiresSession && !hasSession;

  const defaultEditing = game.playConfig?.editing;
  useEffect(() => {
    usePlayMode.getState().reset(defaultEditing);
    return () => usePlayMode.getState().reset();
  }, [defaultEditing]);

  const playSnapshotRef = useRef<GameObject[] | null>(null);
  useEffect(() => {
    if (playing) {
      playSnapshotRef.current = useEditorStore.getState().gameObjects;
      useEditorStore.temporal.getState().clear();
    } else if (playSnapshotRef.current) {
      useEditorStore.getState().setGameObjects(playSnapshotRef.current);
      playSnapshotRef.current = null;
      useSceneRuntime.getState().reset();
      useEditorStore.temporal.getState().clear();
    }
  }, [playing]);

  const togglePlay = useCallback(() => {
    const s = usePlayMode.getState();
    if (s.playing) s.exitPlay();
    else s.enterPlay();
  }, []);

  const registry = useMemo<ComponentRegistry>(
    () =>
      createComponentRegistry([
        ...NATIVE_COMPONENTS,
        ...(game.components ?? []),
      ]),
    [game.components],
  );

  const editor = useSceneEditor({
    registry,
    initialGameObjects: game.gameObjects,
    initialSelectedId: game.initialSelectedId,
  });
  const value: EditorApi = { ...editor, registry };
  const apiRef = useRef(value);
  apiRef.current = value;
  const Behavior = game.behavior;

  const { undo, redo } = useEditorStore.temporal.getState();
  const canUndo = useStore(
    useEditorStore.temporal,
    (s) => s.pastStates.length > 0,
  );
  const canRedo = useStore(
    useEditorStore.temporal,
    (s) => s.futureStates.length > 0,
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const pm = usePlayMode.getState();
      if (pm.playing && pm.editing === "restrict") return;
      const t = e.target as HTMLElement | null;
      if (
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable)
      )
        return;
      const k = e.key.toLowerCase();
      if (k === "z") {
        e.preventDefault();
        if (e.shiftKey) redo();
        else undo();
      } else if (k === "y") {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  const manifest = useMemo(() => toManifest(game.assets ?? {}), [game.assets]);
  const kinds = useMemo<Record<string, AssetKind>>(
    () =>
      Object.fromEntries(
        Object.entries(game.assets ?? {}).map(([key, entry]) => [
          key,
          entry.kind,
        ]),
      ),
    [game.assets],
  );
  const preload = useAssetPreloader(manifest);

  const [userAssets, setUserAssets] = useState<Record<string, LocalAsset>>({});
  const userAssetsRef = useRef(userAssets);
  userAssetsRef.current = userAssets;

  const addLocalFiles = useCallback(
    (files: FileList | File[]) => {
      const taken = new Set([
        ...Object.keys(game.assets ?? {}),
        ...Object.keys(userAssetsRef.current),
      ]);
      const additions: Record<string, LocalAsset> = {};
      for (const file of Array.from(files)) {
        const asset = localAssetFromFile(file);
        if (!asset) continue;
        const dot = file.name.lastIndexOf(".");
        const base = dot > 0 ? file.name.slice(0, dot) : file.name;
        let key = base;
        let i = 2;
        while (taken.has(key)) key = `${base}-${i++}`;
        taken.add(key);
        additions[key] = asset;
      }
      setUserAssets((prev) => ({ ...prev, ...additions }));
    },
    [game.assets],
  );
  useEffect(
    () => () => {
      for (const a of Object.values(userAssetsRef.current))
        URL.revokeObjectURL(a.loaded.url);
      useMemoryBudget.getState().clear("local");
    },
    [],
  );

  const [extraFolders, setExtraFolders] = useState<string[]>([]);
  const [folderOverrides, setFolderOverrides] = useState<
    Record<string, string>
  >({});
  const createFolder = useCallback((path: string) => {
    setExtraFolders((prev) => (prev.includes(path) ? prev : [...prev, path]));
  }, []);
  const moveAssets = useCallback((keys: string[], folder: string) => {
    setFolderOverrides((prev) => {
      const next = { ...prev };
      for (const key of keys) next[key] = folder;
      return next;
    });
  }, []);

  const catalog = useMemo(() => {
    const base = { ...(game.assets ?? {}) };
    for (const [key, a] of Object.entries(userAssets)) base[key] = a.entry;
    for (const [key, folder] of Object.entries(folderOverrides))
      if (base[key]) base[key] = { ...base[key], folder };
    return base;
  }, [game.assets, userAssets, folderOverrides]);
  const catalogRef = useRef(catalog);
  catalogRef.current = catalog;
  const moveFolder = useCallback((path: string, target: string) => {
    if (target === path || target.startsWith(`${path}/`)) return;
    const name = path.split("/").pop() ?? path;
    const dest = target ? `${target}/${name}` : name;
    if (dest === path) return;
    setExtraFolders((prev) => {
      const next = new Set(
        prev.map((f) =>
          f === path || f.startsWith(`${path}/`)
            ? dest + f.slice(path.length)
            : f,
        ),
      );
      next.add(dest);
      return [...next];
    });
    setFolderOverrides((prev) => {
      const next = { ...prev };
      for (const [key, entry] of Object.entries(catalogRef.current)) {
        const dir = entry.folder ?? "";
        if (dir === path || dir.startsWith(`${path}/`))
          next[key] = dest + dir.slice(path.length);
      }
      return next;
    });
  }, []);
  const assets = useMemo(() => {
    const base: Record<string, LoadedAsset | undefined> = { ...preload.assets };
    for (const [key, a] of Object.entries(userAssets)) base[key] = a.loaded;
    return base;
  }, [preload.assets, userAssets]);
  const statuses = useMemo(() => {
    const base = { ...preload.statuses };
    for (const key of Object.keys(userAssets)) base[key] = "ready" as const;
    return base;
  }, [preload.statuses, userAssets]);
  const mergedKinds = useMemo(() => {
    const base = { ...kinds };
    for (const [key, a] of Object.entries(userAssets)) base[key] = a.entry.kind;
    return base;
  }, [kinds, userAssets]);

  const assetsState: LoadedAssetsState = {
    catalog,
    assets,
    statuses,
    kinds: mergedKinds,
    progress: preload.progress,
    addLocalFiles,
    folders: extraFolders,
    createFolder,
    moveAssets,
    moveFolder,
  };

  const handleExport = useCallback(() => {
    const scene = apiRef.current.gameObjects;
    const blob = new Blob([JSON.stringify(scene, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${game.id}.scene.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [game.id]);

  useEffect(() => () => resetHeader(), [resetHeader]);
  useEffect(() => () => resetRuntime(), [resetRuntime]);
  useEffect(() => () => useGameSession.getState().clear(), []);
  useEffect(() => {
    const onLoad = game.onLoad
      ? (file: File) => game.onLoad!(file, apiRef.current)
      : undefined;
    setHeader({
      title: game.title,
      icon: game.icon,
      onLoad,
      onPlay: togglePlay,
      playDisabled,
      onExport: playing ? undefined : handleExport,
      onUndo: undo,
      onRedo: redo,
      canUndo,
      canRedo,
    });
  }, [
    setHeader,
    game.title,
    game.icon,
    game.onLoad,
    togglePlay,
    playing,
    playDisabled,
    handleExport,
    undo,
    redo,
    canUndo,
    canRedo,
  ]);

  function onReady(event: DockviewReadyEvent) {
    buildDefaultLayout(event.api);
  }

  return (
    <ComponentRegistryProvider value={registry}>
      <AssetsProvider value={assetsState}>
        <EditorProvider value={value}>
          {Behavior && playing && <Behavior />}
          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              playing && "border-2 border-play",
            )}
          >
            <div className="min-h-0 flex-1">
              <DockviewReact
                className="dockview-theme-abyss dv-qgem"
                components={components}
                defaultTabComponent={PanelTab}
                onReady={onReady}
              />
            </div>
            <StatusBar />
          </div>
        </EditorProvider>
      </AssetsProvider>
    </ComponentRegistryProvider>
  );
}
