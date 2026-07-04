"use client";

import { createContext, useContext } from "react";
import type { ComponentRegistry } from "@engine/componentRegistry";
import type { useSceneEditor } from "@/hooks/use-scene-editor";

export type EditorApi = ReturnType<typeof useSceneEditor> & {
  registry: ComponentRegistry;
};

const EditorContext = createContext<EditorApi | null>(null);

export const EditorProvider = EditorContext.Provider;

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useEditor must be used inside EditorProvider");
  return ctx;
}
