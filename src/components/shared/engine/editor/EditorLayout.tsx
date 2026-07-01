"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DockviewReact,
  type DockviewApi,
  type DockviewReadyEvent,
} from "dockview-react";
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
import { AssetLoaderTiles } from "@engine/AssetsBar";
import {
  AssetsProvider,
  useAssets,
  type LoadedAssetsState,
} from "@engine/assetsContext";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import { useSceneEditor } from "@/hooks/use-scene-editor";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useAssetPreloader } from "@/hooks/use-asset-preloader";
import { toManifest } from "@/helpers/asset-source";
import type { AssetKind } from "@/helpers/asset-preloader";

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

function GamePanel() {
  const e = useEditor();
  return (
    <Scene viewMode="game" showFullscreenButton hideCursorOnFullscreen>
      <div className="absolute inset-0">
        {e.gameObjects
          .filter((go) => !go.parentId && go.active)
          .map((go) => (
            <GameObjectView
              key={go.id}
              gameObject={go}
              allGameObjects={e.gameObjects}
              selectedId={null}
            />
          ))}
      </div>
    </Scene>
  );
}

function AssetsPanel() {
  const { statuses, kinds, progress } = useAssets();
  const keys = Object.keys(statuses);
  return (
    <div className="scrl h-full overflow-auto bg-panel">
      {keys.length === 0 ? (
        <div className="flex h-full items-center justify-center p-3">
          <p className="text-2xs text-faint">Ninguno cargado.</p>
        </div>
      ) : (
        <div className="p-3">
          <p className="mb-2 font-mono text-2xs text-faint">
            {progress.loaded}/{progress.total} listos
          </p>
          <div className="flex flex-wrap gap-3">
            <AssetLoaderTiles statuses={statuses} kinds={kinds} />
          </div>
        </div>
      )}
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
  api.addPanel({
    id: "assets",
    component: "assets",
    title: "Assets",
    initialHeight: 180,
    position: { referencePanel: "scene", direction: "below" },
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
  });
  const [editMode, setEditMode] = useState(false);

  const value: EditorApi = { ...editor, editMode, setEditMode, registry };
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
  const assetsState: LoadedAssetsState = {
    assets: preload.assets,
    statuses: preload.statuses,
    kinds,
    progress: preload.progress,
  };

  useEffect(() => () => resetHeader(), [resetHeader]);
  useEffect(() => {
    setHeader({ title: game.title, icon: game.icon });
  }, [setHeader, game.title, game.icon]);

  function onReady(event: DockviewReadyEvent) {
    buildDefaultLayout(event.api);
  }

  return (
    <ComponentRegistryProvider value={registry}>
      <AssetsProvider value={assetsState}>
        <EditorProvider value={value}>
          {Behavior && <Behavior />}
          <div className="min-h-0 flex-1">
            <DockviewReact
              className="dockview-theme-abyss dv-qgem"
              components={components}
              onReady={onReady}
            />
          </div>
        </EditorProvider>
      </AssetsProvider>
    </ComponentRegistryProvider>
  );
}
