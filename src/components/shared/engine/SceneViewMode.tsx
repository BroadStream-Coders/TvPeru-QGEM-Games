"use client";

import { createContext, useContext } from "react";

export type ViewMode = "game" | "scene";

const SceneViewModeContext = createContext<ViewMode>("game");

export const SceneViewModeProvider = SceneViewModeContext.Provider;

export function useSceneViewMode() {
  return useContext(SceneViewModeContext);
}
