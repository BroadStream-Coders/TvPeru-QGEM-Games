import { create } from "zustand";
import React from "react";

interface WorkspaceHeaderState {
  title: string | null;
  icon: React.ReactNode | null;
  format?: "json" | "zip";
  onSave?: () => void;
  onLoad?: (file: File) => void;
  setHeader: (
    header: Omit<WorkspaceHeaderState, "setHeader" | "resetHeader">,
  ) => void;
  resetHeader: () => void;
}

export const useWorkspaceHeader = create<WorkspaceHeaderState>((set) => ({
  title: null,
  icon: null,
  format: undefined,
  onSave: undefined,
  onLoad: undefined,
  setHeader: (header) => set((state) => ({ ...state, ...header })),
  resetHeader: () =>
    set({
      title: null,
      icon: null,
      format: undefined,
      onSave: undefined,
      onLoad: undefined,
    }),
}));
