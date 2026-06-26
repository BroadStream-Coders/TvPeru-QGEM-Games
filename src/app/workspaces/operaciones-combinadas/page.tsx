"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Grid3x3 } from "lucide-react";
import { loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useTransformGesture, HANDLES } from "@/hooks/use-transform-gesture";

import { Scene } from "@engine/Scene";
import { RectTransformValues, Vec2 } from "@engine/RectTransform";
import { GameObjectView } from "@engine/GameObjectView";
import { Hierarchy, TreeNode } from "@engine/Hierarchy";
import { SidePanel } from "@engine/SidePanel";
import { AssetsBar } from "@engine/AssetsBar";
import { GameObjectInspector } from "@engine/GameObjectInspector";
import { RectTransformInspector } from "@engine/RectTransformInspector";
import { AddComponentButton } from "@engine/AddComponentButton";
import {
  GameObject,
  GameObjectComponent,
  createGameObject,
  ancestorOffset,
  reorderGameObjects,
  collectSubtreeIds,
  gameObjectKind,
  gameObjectHasAnimation,
} from "@engine/gameObject";
import {
  createComponentRegistry,
  NATIVE_COMPONENTS,
  ComponentRegistryProvider,
} from "@engine/componentRegistry";

import {
  OperacionesCombinadasData,
  isOperacionesCombinadasData,
} from "./types";
import {
  GRID_CONFIG,
  GRID_PIXEL_SIZE,
  GRID_GAP_PERCENT,
  INITIAL_TRAY,
} from "./gridConfig";
import { useGridDragDrop } from "./useGridDragDrop";
import { GridCells, TrayPanel, DragGhost } from "./components/DragDropBoard";

const GRID_ID = "grid";

const registry = createComponentRegistry(NATIVE_COMPONENTS);

export default function OperacionesCombinadasPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [data, setData] = useState<OperacionesCombinadasData | null>(null);

  const [gameObjects, setGameObjects] = useState<GameObject[]>(() => [
    createGameObject({
      id: GRID_ID,
      name: "Grid",
      transform: {
        position: { ...GRID_CONFIG.containerPosition },
        size: { ...GRID_PIXEL_SIZE },
        pivot: { x: 0.5, y: 0.5 },
      },
    }),
  ]);
  const [selectedId, setSelectedId] = useState<string | null>(GRID_ID);
  const [editMode, setEditMode] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);
  const selected = gameObjects.find((go) => go.id === selectedId) ?? null;

  const dnd = useGridDragDrop(stageRef, INITIAL_TRAY);

  const buildNode = (go: GameObject): TreeNode => {
    const children = gameObjects
      .filter((c) => c.parentId === go.id)
      .map(buildNode);
    return {
      id: go.id,
      name: go.name,
      active: go.active,
      kind: gameObjectKind(go.components),
      hasAnimation: gameObjectHasAnimation(go.components),
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

  const createNewGameObject = (parentId?: string) => {
    const id = crypto.randomUUID();
    setGameObjects((prev) => [
      ...prev,
      createGameObject({
        id,
        name: "GameObject",
        parentId,
        transform: {
          position: { x: 0, y: 0 },
          size: { x: 100, y: 100 },
          pivot: { x: 0.5, y: 0.5 },
        },
      }),
    ]);
    setSelectedId(id);
  };

  const deleteGameObject = (id: string) => {
    const ids = collectSubtreeIds(gameObjects, id);
    setGameObjects((prev) => prev.filter((go) => !ids.has(go.id)));
    if (selectedId && ids.has(selectedId)) setSelectedId(null);
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

  const setGameObjectSize = (goId: string, size: Vec2) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === goId ? { ...go, transform: { ...go.transform, size } } : go,
      ),
    );

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
      const loaded = await loadJsonFile<OperacionesCombinadasData>(
        file,
        isOperacionesCombinadasData,
      );
      console.log("Operaciones Combinadas cargado:", loaded);
      setData(loaded);
    } catch {
      console.error("Error al cargar el archivo JSON.");
    }
  }, []);

  useEffect(() => {
    return () => resetHeader();
  }, [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Operaciones Combinadas",
      icon: <Grid3x3 className="h-3 w-3" />,
      onLoad: handleLoad,
    });
  }, [setHeader, handleLoad]);

  const renderContent = (go: GameObject) => (
    <>
      {go.id === GRID_ID && (
        <GridCells
          cols={GRID_CONFIG.gridSize.x}
          rows={GRID_CONFIG.gridSize.y}
          gapPercent={GRID_GAP_PERCENT}
          cells={dnd.cells}
          drag={dnd.drag}
          hoveredCell={dnd.hoveredCell}
          beginDrag={dnd.beginDrag}
          cellEnter={dnd.cellEnter}
          cellLeave={dnd.cellLeave}
        />
      )}
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
              <div
                ref={stageRef}
                className="absolute inset-0"
                style={{ cursor: dnd.drag ? "none" : "default" }}
              >
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
            </ComponentRegistryProvider>
            <TrayPanel
              tray={dnd.tray}
              drag={dnd.drag}
              beginDrag={dnd.beginDrag}
            />
            {dnd.drag && <DragGhost drag={dnd.drag} pointer={dnd.pointer} />}
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
              {data
                ? "Selecciona un objeto en Hierarchy."
                : "Carga un archivo de sesión para comenzar."}
            </p>
          )}
        </SidePanel>
      </div>
      <AssetsBar />
    </main>
  );
}
