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
  X,
  type LucideIcon,
} from "lucide-react";
import "dockview-react/dist/styles/dockview.css";
import "../dockview-theme.css";

import { Scene } from "@engine/Scene";
import { GameObjectView } from "@engine/GameObjectView";
import { SelectionOverlay } from "@engine/SelectionOverlay";
import { Hierarchy } from "@engine/Hierarchy";
import { GameObjectInspector } from "@engine/GameObjectInspector";
import { RectTransformInspector } from "@engine/RectTransformInspector";
import { AddComponentButton } from "@engine/AddComponentButton";
import { gameObjectKind } from "@engine/gameObject";
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
import { cn } from "@/lib/utils";
import { useSceneEditor } from "@/hooks/use-scene-editor";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useAssetPreloader } from "@/hooks/use-asset-preloader";
import { toManifest, localAssetFromFile } from "@/helpers/asset-source";
import type { LocalAsset } from "@/helpers/asset-source";
import type { AssetKind, LoadedAsset } from "@/helpers/asset-preloader";

function HierarchyPanel() {
  const e = useEditor();
  return (
    <div className="scrl h-full overflow-y-auto bg-panel p-3">
      <Hierarchy
        nodes={e.hierarchyNodes}
        selectedId={e.selectedId}
        onSelect={e.setSelectedId}
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
  return (
    <div className="scrl flex h-full flex-col overflow-y-auto bg-panel">
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
            editMode={e.editMode}
            onToggleEdit={() => e.setEditMode((v) => !v)}
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
      ) : (
        <p className="p-3 text-2xs text-dim">
          Crea un objeto con click derecho en Hierarchy.
        </p>
      )}
    </div>
  );
}

function ScenePanel() {
  const e = useEditor();
  return (
    <Scene viewMode="scene">
      <div ref={e.stageRef} className="absolute inset-0">
        {e.gameObjects
          .filter((go) => !go.parentId && go.active)
          .map((go) => (
            <GameObjectView
              key={go.id}
              gameObject={go}
              allGameObjects={e.gameObjects}
              selectedId={e.selectedId}
              onAnimatePosition={e.animatePosition}
            />
          ))}
      </div>
      {e.editMode && (
        <SelectionOverlay
          selected={e.selected}
          allGameObjects={e.gameObjects}
          onGesture={e.beginGesture}
        />
      )}
    </Scene>
  );
}

function GamePanel(props: IDockviewPanelProps) {
  const e = useEditor();
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const toggleRef = useRef<(() => void) | null>(null);
  const registerFullscreen = useCallback((toggle: () => void) => {
    toggleRef.current = toggle;
  }, []);

  // Play (topbar): activa la pestaña Game — puede estar oculta — y entra a
  // fullscreen en el siguiente frame, ya visible, para no fallar el request.
  const play = useCallback(() => {
    props.api.setActive();
    requestAnimationFrame(() => toggleRef.current?.());
  }, [props.api]);

  useEffect(() => {
    setHeader({ onPlay: play });
  }, [setHeader, play]);

  return (
    <Scene
      viewMode="game"
      hideCursorOnFullscreen
      onFullscreenReady={registerFullscreen}
    >
      <div className="absolute inset-0">
        {e.gameObjects
          .filter((go) => !go.parentId && go.active)
          .map((go) => (
            <GameObjectView
              key={go.id}
              gameObject={go}
              allGameObjects={e.gameObjects}
              selectedId={null}
              onAnimatePosition={e.animatePosition}
            />
          ))}
      </div>
    </Scene>
  );
}

function AssetsPanel() {
  const { catalog, assets, statuses, addLocalFiles } = useAssets();
  return (
    <AssetBrowser
      catalog={catalog}
      assets={assets}
      statuses={statuses}
      onAddFiles={addLocalFiles}
    />
  );
}

function StatusBar() {
  const e = useEditor();
  const { progress } = useAssets();
  const { loaded, total } = progress;
  const loading = total > 0 && loaded < total;
  const objCount = e.gameObjects.length;
  const sel = e.selected;

  return (
    <div className="flex h-[23px] shrink-0 items-center gap-3 border-t border-edge bg-gradient-to-b from-[#202327] to-[#1a1d20] px-3 font-mono text-[11px] text-faint">
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
  const scene = api.addPanel({ id: "scene", component: "scene", title: "Scene" });
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
  const [editMode, setEditMode] = useState(false);

  const value: EditorApi = { ...editor, editMode, setEditMode, registry };
  const apiRef = useRef(value);
  apiRef.current = value;
  const Behavior = game.behavior;

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
  const addLocalFiles = useCallback(
    (files: FileList | File[]) => {
      const list = Array.from(files);
      setUserAssets((prev) => {
        const taken = new Set([
          ...Object.keys(game.assets ?? {}),
          ...Object.keys(prev),
        ]);
        const next = { ...prev };
        for (const file of list) {
          const asset = localAssetFromFile(file);
          if (!asset) continue;
          const dot = file.name.lastIndexOf(".");
          const base = dot > 0 ? file.name.slice(0, dot) : file.name;
          let key = base;
          let i = 2;
          while (taken.has(key)) key = `${base}-${i++}`;
          taken.add(key);
          next[key] = asset;
        }
        return next;
      });
    },
    [game.assets],
  );

  const userAssetsRef = useRef(userAssets);
  userAssetsRef.current = userAssets;
  useEffect(
    () => () => {
      for (const a of Object.values(userAssetsRef.current))
        URL.revokeObjectURL(a.loaded.url);
    },
    [],
  );

  const catalog = useMemo(() => {
    const base = { ...(game.assets ?? {}) };
    for (const [key, a] of Object.entries(userAssets)) base[key] = a.entry;
    return base;
  }, [game.assets, userAssets]);
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
  };

  useEffect(() => () => resetHeader(), [resetHeader]);
  useEffect(() => {
    const onLoad = game.onLoad
      ? (file: File) => game.onLoad!(file, apiRef.current)
      : undefined;
    setHeader({ title: game.title, icon: game.icon, onLoad });
  }, [setHeader, game.title, game.icon, game.onLoad]);

  function onReady(event: DockviewReadyEvent) {
    buildDefaultLayout(event.api);
  }

  return (
    <ComponentRegistryProvider value={registry}>
      <AssetsProvider value={assetsState}>
        <EditorProvider value={value}>
          {Behavior && <Behavior />}
          <div className="flex min-h-0 flex-1 flex-col">
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
