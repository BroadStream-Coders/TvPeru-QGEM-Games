import { create } from "zustand";
import { temporal } from "zundo";
import { Vec2, Vec2Field } from "@engine/RectTransform";
import { ComponentRegistry } from "@engine/componentRegistry";
import {
  GameObject,
  GameObjectComponent,
  createGameObject,
  reorderGameObjects,
  collectSubtreeIds,
  duplicateSubtrees,
} from "@engine/gameObject";

type Updater<T> = T | ((prev: T) => T);
const apply = <T,>(updater: Updater<T>, prev: T): T =>
  typeof updater === "function" ? (updater as (p: T) => T)(prev) : updater;

const lastId = (ids: string[]): string | null =>
  ids.length ? ids[ids.length - 1] : null;

export interface EditorState {
  gameObjects: GameObject[];
  selectedIds: string[];
  registry: ComponentRegistry | null;

  init: (opts: {
    gameObjects: GameObject[];
    selectedIds: string[];
    registry: ComponentRegistry;
  }) => void;

  setGameObjects: (updater: Updater<GameObject[]>) => void;
  setSelectedIds: (updater: Updater<string[]>) => void;
  setSelectedId: (id: string | null) => void;

  patchGameObject: (id: string, patch: Partial<GameObject>) => void;
  createNewGameObject: (parentId?: string) => void;
  duplicateSelected: () => void;
  deleteGameObject: (id: string) => void;
  handleReorder: (
    draggedId: string,
    targetId: string,
    position: "before" | "after" | "inside",
  ) => void;
  addComponent: (goId: string, type: string) => void;
  removeComponent: (goId: string, index: number) => void;
  patchComponent: (
    goId: string,
    index: number,
    next: GameObjectComponent,
  ) => void;
  setGameObjectSize: (goId: string, size: Vec2) => void;
  setAxis: (field: Vec2Field, axis: keyof Vec2) => (value: number) => void;
  setRotation: (value: number) => void;
}

export const useEditorStore = create<EditorState>()(
  temporal(
    (set, get) => ({
      gameObjects: [],
      selectedIds: [],
      registry: null,

      init: ({ gameObjects, selectedIds, registry }) =>
        set({ gameObjects, selectedIds, registry }),

      setGameObjects: (updater) =>
        set((s) => ({ gameObjects: apply(updater, s.gameObjects) })),
      setSelectedIds: (updater) =>
        set((s) => ({ selectedIds: apply(updater, s.selectedIds) })),
      setSelectedId: (id) => set({ selectedIds: id ? [id] : [] }),

      patchGameObject: (id, patch) =>
        set((s) => ({
          gameObjects: s.gameObjects.map((go) =>
            go.id === id ? { ...go, ...patch } : go,
          ),
        })),

      createNewGameObject: (parentId) => {
        const id = crypto.randomUUID();
        set((s) => ({
          gameObjects: [
            ...s.gameObjects,
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
          ],
          selectedIds: [id],
        }));
      },

      duplicateSelected: () => {
        const { gameObjects, selectedIds } = get();
        if (!selectedIds.length) return;
        const { next, newRootIds } = duplicateSubtrees(
          gameObjects,
          selectedIds,
          { x: 20, y: -20 },
        );
        if (!newRootIds.length) return;
        set({ gameObjects: next, selectedIds: newRootIds });
      },

      deleteGameObject: (id) => {
        const ids = collectSubtreeIds(get().gameObjects, id);
        set((s) => ({
          gameObjects: s.gameObjects.filter((go) => !ids.has(go.id)),
          selectedIds: s.selectedIds.filter((sid) => !ids.has(sid)),
        }));
      },

      handleReorder: (draggedId, targetId, position) =>
        set((s) => ({
          gameObjects: reorderGameObjects(
            s.gameObjects,
            draggedId,
            targetId,
            position,
          ),
        })),

      addComponent: (goId, type) => {
        const def = get().registry?.get(type);
        if (!def) return;
        set((s) => ({
          gameObjects: s.gameObjects.map((go) =>
            go.id === goId
              ? { ...go, components: [...go.components, def.create()] }
              : go,
          ),
        }));
      },

      removeComponent: (goId, index) =>
        set((s) => ({
          gameObjects: s.gameObjects.map((go) =>
            go.id === goId
              ? { ...go, components: go.components.filter((_, i) => i !== index) }
              : go,
          ),
        })),

      patchComponent: (goId, index, next) =>
        set((s) => ({
          gameObjects: s.gameObjects.map((go) =>
            go.id === goId
              ? {
                  ...go,
                  components: go.components.map((c, i) =>
                    i === index ? next : c,
                  ),
                }
              : go,
          ),
        })),

      setGameObjectSize: (goId, size) =>
        set((s) => ({
          gameObjects: s.gameObjects.map((go) =>
            go.id === goId
              ? { ...go, transform: { ...go.transform, size } }
              : go,
          ),
        })),

      setAxis: (field, axis) => (value) => {
        const selectedId = lastId(get().selectedIds);
        set((s) => ({
          gameObjects: s.gameObjects.map((go) =>
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
        }));
      },

      setRotation: (value) => {
        const selectedId = lastId(get().selectedIds);
        set((s) => ({
          gameObjects: s.gameObjects.map((go) =>
            go.id === selectedId
              ? { ...go, transform: { ...go.transform, rotation: value } }
              : go,
          ),
        }));
      },
    }),
    {
      partialize: (state) => ({ gameObjects: state.gameObjects }),
      limit: 100,
    },
  ),
);
