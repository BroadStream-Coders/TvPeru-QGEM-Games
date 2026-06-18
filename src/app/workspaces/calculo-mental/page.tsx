"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { Calculator } from "lucide-react";
import { loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useAssetPreloader } from "@/hooks/use-asset-preloader";
import type { AssetKind } from "@/helpers/asset-preloader";
import { toManifest, type AssetCatalog } from "@/helpers/asset-source";
import { SHARED_ASSETS } from "@/assets/shared";
import { AssetLoaderCard } from "@/components/shared/AssetLoaderCard";
import { useTransformGesture, HANDLES } from "@/hooks/use-transform-gesture";

import { Scene } from "@engine/Scene";
import {
  RectTransformValues,
  Vec2,
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
} from "@engine/RectTransform";
import { GameObjectView } from "@engine/GameObjectView";
import { StatusCard } from "./components/StatusCard";
import { LegendCard } from "./components/LegendCard";
import { SidePanel } from "@engine/SidePanel";
import { Hierarchy, TreeNode } from "@engine/Hierarchy";
import { GameObjectInspector } from "@engine/GameObjectInspector";
import { RectTransformInspector } from "@engine/RectTransformInspector";
import {
  GameObject,
  GameObjectComponent,
  createGameObject,
  ancestorOffset,
  reorderGameObjects,
} from "@engine/gameObject";
import {
  createComponentRegistry,
  NATIVE_COMPONENTS,
  ComponentRegistryProvider,
} from "@engine/componentRegistry";
import { AddComponentButton } from "@engine/AddComponentButton";
import { createColorComponent } from "@engine/components/color/colorComponent";

const CATALOG: AssetCatalog = {
  correct: SHARED_ASSETS.correctSound,
  incorrect: SHARED_ASSETS.incorrectSound,
};

const ASSETS = toManifest(CATALOG);

const ASSET_KINDS: Record<string, AssetKind> = Object.fromEntries(
  Object.entries(CATALOG).map(([key, entry]) => [key, entry.kind]),
);

const BACKGROUND_ID = "background";

const registry = createComponentRegistry([...NATIVE_COMPONENTS]);

export default function CalculoMentalPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const { ready, statuses, progress } = useAssetPreloader(ASSETS);

  const [loaded, setLoaded] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [gameObjects, setGameObjects] = useState<GameObject[]>(() => [
    createGameObject({
      id: BACKGROUND_ID,
      name: "Background",
      transform: {
        position: { x: 0, y: 0 },
        size: { x: DESIGN_WIDTH, y: DESIGN_HEIGHT },
        pivot: { x: 0.5, y: 0.5 },
      },
      components: [createColorComponent({ value: "#01FF02" })],
    }),
  ]);
  const [selectedId, setSelectedId] = useState<string>(BACKGROUND_ID);

  const selected = gameObjects.find((go) => go.id === selectedId) ?? null;

  const buildNode = (go: GameObject): TreeNode => {
    const children = gameObjects
      .filter((c) => c.parentId === go.id)
      .map(buildNode);
    return {
      id: go.id,
      name: go.name,
      active: go.active,
      children: children.length ? children : undefined,
    };
  };

  const hierarchyNodes: TreeNode[] = gameObjects
    .filter((go) => !go.parentId)
    .map(buildNode);

  const patchGameObject = (id: string, patch: Partial<GameObject>) =>
    setGameObjects((prev) =>
      prev.map((go) => (go.id === id ? { ...go, ...patch } : go)),
    );

  const patchComponent = (
    goId: string,
    index: number,
    next: GameObjectComponent,
  ) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === goId
          ? {
              ...go,
              components: go.components.map((c, i) => (i === index ? next : c)),
            }
          : go,
      ),
    );

  const createNewGameObject = () => {
    const id = crypto.randomUUID();
    setGameObjects((prev) => [
      ...prev,
      createGameObject({
        id,
        name: "GameObject",
        transform: {
          position: { x: 0, y: 0 },
          size: { x: 100, y: 100 },
          pivot: { x: 0.5, y: 0.5 },
        },
      }),
    ]);
    setSelectedId(id);
  };

  const handleReorder = (
    draggedId: string,
    targetId: string,
    position: "before" | "after" | "inside",
  ) =>
    setGameObjects((prev) =>
      reorderGameObjects(prev, draggedId, targetId, position),
    );

  const addComponent = (goId: string, type: string) => {
    const def = registry.get(type);
    if (!def) return;
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === goId
          ? { ...go, components: [...go.components, def.create()] }
          : go,
      ),
    );
  };

  const setGameObjectSize = (goId: string, size: Vec2) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === goId ? { ...go, transform: { ...go.transform, size } } : go,
      ),
    );

  const removeComponent = (goId: string, index: number) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === goId
          ? {
              ...go,
              components: go.components.filter((_, i) => i !== index),
            }
          : go,
      ),
    );

  const onComponentChange =
    (goId: string, index: number) => (next: GameObjectComponent) =>
      patchComponent(goId, index, next);

  const setAxis =
    (field: keyof RectTransformValues, axis: keyof Vec2) => (value: number) =>
      setGameObjects((prev) =>
        prev.map((go) =>
          go.id === selectedId
            ? {
                ...go,
                transform: {
                  ...go.transform,
                  [field]: { ...go.transform[field], [axis]: value },
                },
              }
            : go,
        ),
      );

  const stageRef = useRef<HTMLDivElement>(null);
  const { beginGesture } = useTransformGesture({
    stageRef,
    getTransform: () => {
      if (!selected) return null;
      const origin = ancestorOffset(selected, gameObjects);
      return {
        ...selected.transform,
        position: {
          x: selected.transform.position.x + origin.x,
          y: selected.transform.position.y + origin.y,
        },
      };
    },
    onChange: ({ position, size }) =>
      setGameObjects((prev) =>
        prev.map((go) => {
          if (go.id !== selectedId) return go;
          const origin = ancestorOffset(go, gameObjects);
          return {
            ...go,
            transform: {
              ...go.transform,
              position: {
                x: position.x - origin.x,
                y: position.y - origin.y,
              },
              size,
            },
          };
        }),
      ),
  });

  const handleLoad = useCallback(async (file: File) => {
    try {
      await loadJsonFile(file);
      setLoaded(true);
    } catch {
      console.error("Error al cargar el archivo JSON.");
    }
  }, []);

  useEffect(() => {
    return () => resetHeader();
  }, [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Cálculo Mental",
      icon: <Calculator className="h-3 w-3" />,
      onLoad: handleLoad,
    });
  }, [setHeader, handleLoad]);

  const renderContent = (go: GameObject) => (
    <>
      {editMode && go.id === selectedId && (
        <>
          <div
            onPointerDown={(e) => beginGesture("move", e)}
            className="absolute inset-0 cursor-move touch-none select-none"
          />
          {HANDLES.map((hd) => (
            <div
              key={hd.h}
              onPointerDown={(e) => beginGesture(hd.h, e)}
              className={`absolute ${hd.pos} ${hd.cursor} h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-white touch-none`}
            />
          ))}
        </>
      )}
    </>
  );

  return (
    <main className="flex-1 p-3 overflow-auto flex flex-col gap-3">
      <div className="flex gap-1.5">
        <SidePanel title="Hierarchy" className="w-72 shrink-0">
          <Hierarchy
            nodes={hierarchyNodes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={createNewGameObject}
            onReorder={handleReorder}
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
                        editMode={editMode}
                        renderContent={renderContent}
                      />
                    ))}
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-sm text-white/70">
                  Cargando assets… {progress.loaded}/{progress.total}
                </div>
              )}
            </ComponentRegistryProvider>
          </Scene>
        </div>
        <SidePanel title="Inspector" className="w-72 shrink-0">
          {selected ? (
            <>
              <GameObjectInspector
                name={selected.name}
                onNameChange={(name) => patchGameObject(selected.id, { name })}
                active={selected.active}
                onActiveChange={(active) =>
                  patchGameObject(selected.id, { active })
                }
              />
              <RectTransformInspector
                transform={selected.transform}
                setAxis={setAxis}
                editMode={editMode}
                onToggleEdit={() => setEditMode((v) => !v)}
              />
              {selected.components.map((component, index) => {
                const Editor = registry.get(component.type)?.editor;
                return Editor ? (
                  <Editor
                    key={index}
                    component={component}
                    onChange={onComponentChange(selected.id, index)}
                    onRemove={() => removeComponent(selected.id, index)}
                    onResize={(size) => setGameObjectSize(selected.id, size)}
                  />
                ) : null;
              })}
              <AddComponentButton
                options={registry.options}
                onAdd={(type) => addComponent(selected.id, type)}
              />
            </>
          ) : (
            <p className="px-1 py-2 text-2xs text-muted-foreground">
              Selecciona un objeto en Hierarchy.
            </p>
          )}
        </SidePanel>
      </div>

      {/* Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <StatusCard loaded={loaded} />
        <AssetLoaderCard
          statuses={statuses}
          progress={progress}
          kinds={ASSET_KINDS}
        />
        <LegendCard />
      </div>
    </main>
  );
}
