import { useRef, useState } from "react";
import { TreeNode } from "@engine/Hierarchy";
import { ComponentRegistry } from "@engine/componentRegistry";
import {
  GameObject,
  gameObjectKind,
  gameObjectHasAnimation,
} from "@engine/gameObject";
import { useEditorStore } from "@/hooks/use-editor-store";

export function useSceneEditor({
  registry,
  initialGameObjects,
  initialSelectedId = null,
}: {
  registry: ComponentRegistry;
  initialGameObjects?: GameObject[] | (() => GameObject[]);
  initialSelectedId?: string | null;
}) {
  useState(() => {
    const initial =
      typeof initialGameObjects === "function"
        ? initialGameObjects()
        : (initialGameObjects ?? []);
    useEditorStore.getState().init({
      gameObjects: initial,
      selectedIds: initialSelectedId ? [initialSelectedId] : [],
      registry,
    });
    useEditorStore.temporal.getState().clear();
    return true;
  });

  const gameObjects = useEditorStore((s) => s.gameObjects);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const {
    setGameObjects,
    setSelectedIds,
    setSelectedId,
    patchGameObject,
    createNewGameObject,
    duplicateSelected,
    deleteGameObject,
    handleReorder,
    addComponent,
    removeComponent,
    patchComponent,
    setGameObjectSize,
    setAxis,
    setRotation,
  } = useEditorStore.getState();

  const stageRef = useRef<HTMLDivElement>(null);
  const selectedId = selectedIds.length
    ? selectedIds[selectedIds.length - 1]
    : null;
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
    patchGameObject,
    createNewGameObject,
    duplicateSelected,
    deleteGameObject,
    handleReorder,
    addComponent,
    removeComponent,
    patchComponent,
    setGameObjectSize,
    setAxis,
    setRotation,
  };
}
