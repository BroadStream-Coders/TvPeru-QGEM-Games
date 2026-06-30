"use client";

import { useCallback, useEffect, useState } from "react";
import { Grid3x3 } from "lucide-react";
import { loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useSceneEditor } from "@/hooks/use-scene-editor";

import { Scene } from "@engine/Scene";
import { GameObjectView } from "@engine/GameObjectView";
import { SelectionOverlay } from "@engine/SelectionOverlay";
import { Hierarchy } from "@engine/Hierarchy";
import { SidePanel } from "@engine/SidePanel";
import { AssetsBar } from "@engine/AssetsBar";
import { GameObjectInspector } from "@engine/GameObjectInspector";
import { RectTransformInspector } from "@engine/RectTransformInspector";
import { AddComponentButton } from "@engine/AddComponentButton";
import { GameObject, createGameObject, gameObjectKind } from "@engine/gameObject";
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

  const [editMode, setEditMode] = useState(false);

  const {
    gameObjects,
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
  } = useSceneEditor({
    registry,
    initialSelectedId: GRID_ID,
    initialGameObjects: () => [
      createGameObject({
        id: GRID_ID,
        name: "Grid",
        transform: {
          position: { ...GRID_CONFIG.containerPosition },
          size: { ...GRID_PIXEL_SIZE },
          pivot: { x: 0.5, y: 0.5 },
        },
      }),
    ],
  });

  const dnd = useGridDragDrop(stageRef, INITIAL_TRAY);

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
                      renderContent={renderContent}
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
