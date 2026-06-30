"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
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
import { gameObjectKind } from "@engine/gameObject";
import {
  createComponentRegistry,
  NATIVE_COMPONENTS,
  ComponentRegistryProvider,
} from "@engine/componentRegistry";
import { borderDefinition } from "./components/border";

const registry = createComponentRegistry([
  ...NATIVE_COMPONENTS,
  borderDefinition,
]);

export default function SandboxPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

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
  } = useSceneEditor({ registry });

  useEffect(() => {
    return () => resetHeader();
  }, [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Sandbox",
      icon: <FlaskConical className="h-3 w-3" />,
    });
  }, [setHeader]);

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
              <div ref={stageRef} className="absolute inset-0">
                {gameObjects
                  .filter((go) => !go.parentId && go.active)
                  .map((go) => (
                    <GameObjectView
                      key={go.id}
                      gameObject={go}
                      allGameObjects={gameObjects}
                      selectedId={selectedId}
                    />
                  ))}
              </div>
              {editMode && (
                <SelectionOverlay
                  selected={selected}
                  allGameObjects={gameObjects}
                  onGesture={beginGesture}
                />
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
              Crea un objeto con click derecho en Hierarchy.
            </p>
          )}
        </SidePanel>
      </div>
      <AssetsBar />
    </main>
  );
}
