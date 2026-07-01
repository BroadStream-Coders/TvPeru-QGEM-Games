"use client";

import { useEffect, useState } from "react";
import { UserX } from "lucide-react";
import { AssetsBar, AssetLoaderTiles } from "@engine/AssetsBar";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useAssetPreloader } from "@/hooks/use-asset-preloader";
import type { AssetKind } from "@/helpers/asset-preloader";
import { toManifest, type AssetCatalog } from "@/helpers/asset-source";
import { SHARED_ASSETS } from "@/assets/shared";
import { INTRUSO_ASSETS } from "./assets";
import { useSceneEditor } from "@/hooks/use-scene-editor";

import { Scene } from "@engine/Scene";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "@engine/RectTransform";
import { createVideoComponent } from "@engine/components/video/videoComponent";
import { GameObjectView } from "@engine/GameObjectView";
import { SelectionOverlay } from "@engine/SelectionOverlay";
import { SidePanel } from "@engine/SidePanel";
import { Hierarchy } from "@engine/Hierarchy";
import { GameObjectInspector } from "@engine/GameObjectInspector";
import { RectTransformInspector } from "@engine/RectTransformInspector";
import { createGameObject, gameObjectKind } from "@engine/gameObject";
import {
  createComponentRegistry,
  NATIVE_COMPONENTS,
  ComponentRegistryProvider,
} from "@engine/componentRegistry";
import { AddComponentButton } from "@engine/AddComponentButton";

const CATALOG: AssetCatalog = {
  correct: SHARED_ASSETS.correctSound,
  incorrect: SHARED_ASSETS.incorrectSound,
  ...INTRUSO_ASSETS,
};

const ASSETS = toManifest(CATALOG);

const ASSET_KINDS: Record<string, AssetKind> = Object.fromEntries(
  Object.entries(CATALOG).map(([key, entry]) => [key, entry.kind]),
);

const registry = createComponentRegistry([...NATIVE_COMPONENTS]);

const BACKGROUND_ID = "background";

export default function IntrusoPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const { ready, assets, statuses, progress } = useAssetPreloader(ASSETS);
  const backgroundUrl = assets.background?.url;

  const [editMode, setEditMode] = useState(false);
  const {
    gameObjects,
    setGameObjects,
    selectedId,
    setSelectedId,
    selected,
    hierarchyNodes,
    stageRef,
    beginGesture,
    patchGameObject,
    createNewGameObject,
    deleteGameObject,
    handleReorder,
    addComponent,
    removeComponent,
    patchComponent,
    setGameObjectSize,
    setAxis,
    setRotation,
    animatePosition,
  } = useSceneEditor({
    registry,
    initialSelectedId: BACKGROUND_ID,
    initialGameObjects: () => [
      createGameObject({
        id: BACKGROUND_ID,
        name: "Background",
        transform: {
          position: { x: 0, y: 0 },
          size: { x: DESIGN_WIDTH, y: DESIGN_HEIGHT },
          pivot: { x: 0.5, y: 0.5 },
        },
        components: [createVideoComponent({ fit: "cover" })],
      }),
    ],
  });

  useEffect(() => {
    return () => resetHeader();
  }, [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Intruso",
      icon: <UserX className="h-3 w-3" />,
    });
  }, [setHeader]);

  useEffect(() => {
    if (!ready || !backgroundUrl) return;
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === BACKGROUND_ID
          ? {
              ...go,
              components: go.components.map((c) =>
                c.type === "video"
                  ? { ...c, src: backgroundUrl, source: "url" }
                  : c,
              ),
            }
          : go,
      ),
    );
  }, [ready, backgroundUrl, setGameObjects]);

  return (
    <main className="flex min-h-0 flex-1 flex-col">
      <div className="flex min-h-0 w-full flex-1">
        <SidePanel
          title="Hierarchy"
          className="w-[262px] shrink-0 border-r border-edge"
        >
          <Hierarchy
            nodes={hierarchyNodes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onCreate={(parentId) => createNewGameObject(parentId ?? undefined)}
            onDelete={deleteGameObject}
            onReorder={handleReorder}
            onToggleActive={(id, active) => patchGameObject(id, { active })}
          />
        </SidePanel>
        <div className="flex min-w-0 flex-1 flex-col">
          <Scene hideCursorOnFullscreen>
            <ComponentRegistryProvider value={registry}>
              {ready ? (
                <div ref={stageRef} className="absolute inset-0">
                  {gameObjects
                    .filter((go) => !go.parentId && go.active)
                    .map((go) => (
                      <GameObjectView
                        key={go.id}
                        gameObject={go}
                        allGameObjects={gameObjects}
                        selectedId={selectedId}
                        onAnimatePosition={animatePosition}
                      />
                    ))}
                  {editMode && (
                    <SelectionOverlay
                      selected={selected}
                      allGameObjects={gameObjects}
                      onGesture={beginGesture}
                    />
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                  Cargando assets… {progress.loaded}/{progress.total}
                </div>
              )}
            </ComponentRegistryProvider>
          </Scene>
        </div>
        <SidePanel
          title="Inspector"
          className="w-[336px] shrink-0 border-l border-edge"
          bodyClassName="flex flex-col"
        >
          {selected ? (
            <>
              <GameObjectInspector
                name={selected.name}
                kind={gameObjectKind(selected.components)}
                onNameChange={(name) => patchGameObject(selected.id, { name })}
                active={selected.active}
                onActiveChange={(active) =>
                  patchGameObject(selected.id, { active })
                }
              />
              <RectTransformInspector
                transform={selected.transform}
                setAxis={setAxis}
                setRotation={setRotation}
                editMode={editMode}
                onToggleEdit={() => setEditMode((v) => !v)}
              />
              {selected.components.map((component, index) => {
                const Editor = registry.get(component.type)?.editor;
                return Editor ? (
                  <Editor
                    key={index}
                    component={component}
                    onChange={(next) =>
                      patchComponent(selected.id, index, next)
                    }
                    onRemove={() => removeComponent(selected.id, index)}
                    onResize={(size) => setGameObjectSize(selected.id, size)}
                    onAddComponent={(type) => addComponent(selected.id, type)}
                  />
                ) : null;
              })}
              <AddComponentButton
                options={registry.options}
                onAdd={(type) => addComponent(selected.id, type)}
              />
            </>
          ) : (
            <p className="p-3 text-2xs text-dim">
              Selecciona un objeto en Hierarchy.
            </p>
          )}
        </SidePanel>
      </div>

      <AssetsBar count={`${progress.loaded}/${progress.total}`}>
        <AssetLoaderTiles statuses={statuses} kinds={ASSET_KINDS} />
      </AssetsBar>
    </main>
  );
}
