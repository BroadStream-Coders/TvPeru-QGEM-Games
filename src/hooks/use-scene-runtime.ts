import { create } from "zustand";
import type { RuntimeState } from "@engine/runtime/sceneRuntime";
import type { RectTransformValues } from "@engine/RectTransform";

interface SceneRuntimeStore {
  runtime: RuntimeState;
  patchComponent: (
    goId: string,
    type: string,
    patch: Record<string, unknown>,
  ) => void;
  setActive: (goId: string, active: boolean) => void;
  setTransform: (goId: string, patch: Partial<RectTransformValues>) => void;
  reset: () => void;
}

export const useSceneRuntime = create<SceneRuntimeStore>((set) => ({
  runtime: {},
  patchComponent: (goId, type, patch) =>
    set((s) => {
      const prev = s.runtime[goId] ?? {};
      const prevComps = prev.components ?? {};
      return {
        runtime: {
          ...s.runtime,
          [goId]: {
            ...prev,
            components: {
              ...prevComps,
              [type]: { ...(prevComps[type] ?? {}), ...patch },
            },
          },
        },
      };
    }),
  setActive: (goId, active) =>
    set((s) => ({
      runtime: {
        ...s.runtime,
        [goId]: { ...(s.runtime[goId] ?? {}), active },
      },
    })),
  setTransform: (goId, patch) =>
    set((s) => {
      const prev = s.runtime[goId] ?? {};
      return {
        runtime: {
          ...s.runtime,
          [goId]: { ...prev, transform: { ...prev.transform, ...patch } },
        },
      };
    }),
  reset: () => set({ runtime: {} }),
}));
