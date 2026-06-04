"use client";

import { useEffect, useRef, useState } from "react";
import { FlaskConical } from "lucide-react";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useTransformGesture, HANDLES } from "@/hooks/use-transform-gesture";

import { Scene, SceneBackground } from "@engine/Scene";
import { BackgroundConfig } from "@/components/shared/BackgroundConfig";
import { RectTransformValues, Vec2 } from "@engine/RectTransform";
import { GameObjectView } from "@engine/GameObjectView";
import { Hierarchy, TreeNode } from "@engine/Hierarchy";
import { SidePanel } from "@engine/SidePanel";
import { GameObjectInspector } from "@engine/GameObjectInspector";
import { RectTransformInspector } from "@engine/RectTransformInspector";
import { AddComponentButton } from "@engine/AddComponentButton";
import {
  GameObject,
  GameObjectComponent,
  createGameObject,
} from "@engine/gameObject";
import {
  COMPONENT_REGISTRY,
  COMPONENT_OPTIONS,
} from "@engine/componentRegistry";

export default function SandboxPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [gameObjects, setGameObjects] = useState<GameObject[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [background, setBackground] = useState<SceneBackground>({
    type: "color",
    value: "#00B140",
  });

  const stageRef = useRef<HTMLDivElement>(null);
  const selected = gameObjects.find((go) => go.id === selectedId) ?? null;

  const buildNode = (go: GameObject): TreeNode => {
    const children = gameObjects
      .filter((c) => c.parentId === go.id)
      .map(buildNode);
    return {
      id: go.id,
      name: go.name,
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

  const addComponent = (goId: string, type: string) => {
    const def = COMPONENT_REGISTRY[type];
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
    getTransform: () => selected?.transform ?? null,
    onChange: ({ position, size }) =>
      setGameObjects((prev) =>
        prev.map((go) =>
          go.id === selectedId
            ? { ...go, transform: { ...go.transform, position, size } }
            : go,
        ),
      ),
  });

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
    <main className="flex-1 p-3 overflow-auto flex flex-col gap-3">
      <div className="flex gap-1.5">
        <SidePanel title="Hierarchy" className="w-72 shrink-0">
          <Hierarchy
            nodes={hierarchyNodes}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAdd={createNewGameObject}
          />
        </SidePanel>
        <div className="flex min-w-0 flex-1 flex-col">
          <Scene background={background} hideCursorOnFullscreen>
            <div ref={stageRef} className="absolute inset-0">
              {gameObjects.map((go) => {
                if (!go.active) return null;
                const isSelected = go.id === selectedId;
                const parentTransform = go.parentId
                  ? gameObjects.find((p) => p.id === go.parentId)?.transform
                  : undefined;
                return (
                  <GameObjectView
                    key={go.id}
                    gameObject={go}
                    parent={parentTransform}
                    outline={editMode && isSelected}
                    selected={isSelected}
                  >
                    {editMode && isSelected && (
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
                  </GameObjectView>
                );
              })}
            </div>
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
                const Editor = COMPONENT_REGISTRY[component.type]?.editor;
                return Editor ? (
                  <Editor
                    key={index}
                    component={component}
                    onChange={(next) =>
                      patchComponent(selected.id, index, next)
                    }
                    onRemove={() => removeComponent(selected.id, index)}
                    onResize={(size) => setGameObjectSize(selected.id, size)}
                  />
                ) : null;
              })}
              <AddComponentButton
                options={COMPONENT_OPTIONS}
                onAdd={(type) => addComponent(selected.id, type)}
              />
            </>
          ) : (
            <p className="px-1 py-2 text-2xs text-muted-foreground">
              Crea un objeto con “+” en Hierarchy.
            </p>
          )}
        </SidePanel>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <BackgroundConfig value={background} onChange={setBackground} />
      </div>
    </main>
  );
}
