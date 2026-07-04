import { useCallback, useRef, useState } from "react";
import { RectTransformValues, Vec2, Vec2Field } from "@engine/RectTransform";
import { TreeNode } from "@engine/Hierarchy";
import { ComponentRegistry } from "@engine/componentRegistry";
import {
  GameObject,
  GameObjectComponent,
  createGameObject,
  reorderGameObjects,
  collectSubtreeIds,
  gameObjectKind,
  gameObjectHasAnimation,
} from "@engine/gameObject";

export function useSceneEditor({
  registry,
  initialGameObjects,
  initialSelectedId = null,
}: {
  registry: ComponentRegistry;
  initialGameObjects?: GameObject[] | (() => GameObject[]);
  initialSelectedId?: string | null;
}) {
  const [gameObjects, setGameObjects] = useState<GameObject[]>(
    initialGameObjects ?? [],
  );
  const [selectedIds, setSelectedIds] = useState<string[]>(
    initialSelectedId ? [initialSelectedId] : [],
  );
  const setSelectedId = useCallback(
    (id: string | null) => setSelectedIds(id ? [id] : []),
    [],
  );

  const stageRef = useRef<HTMLDivElement>(null);
  const selectedId = selectedIds.length ? selectedIds[selectedIds.length - 1] : null;
  const selected =
    selectedIds.length === 1
      ? (gameObjects.find((go) => go.id === selectedIds[0]) ?? null)
      : null;

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
    setSelectedIds((prev) => prev.filter((sid) => !ids.has(sid)));
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
          ? { ...go, components: go.components.filter((_, i) => i !== index) }
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

  const setAxis = (field: Vec2Field, axis: keyof Vec2) => (value: number) =>
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

  const setRotation = (value: number) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === selectedId
          ? { ...go, transform: { ...go.transform, rotation: value } }
          : go,
      ),
    );

  const animatePosition = useCallback(
    (id: string, position: Vec2) =>
      setGameObjects((prev) =>
        prev.map((go) =>
          go.id === id
            ? { ...go, transform: { ...go.transform, position } }
            : go,
        ),
      ),
    [],
  );

  const setTransform = useCallback(
    (id: string, patch: Partial<RectTransformValues>) =>
      setGameObjects((prev) =>
        prev.map((go) =>
          go.id === id
            ? { ...go, transform: { ...go.transform, ...patch } }
            : go,
        ),
      ),
    [],
  );

  return {
    gameObjects,
    setGameObjects,
    selectedId,
    setSelectedId,
    selectedIds,
    setSelectedIds,
    selected,
    hierarchyNodes,
    stageRef,
    setTransform,
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
  };
}
