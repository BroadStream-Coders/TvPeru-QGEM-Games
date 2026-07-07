import { create } from "zustand";
import React from "react";

interface WorkspaceHeaderState {
  title: string | null;
  icon: React.ReactNode | null;
  onLoad?: (file: File) => void;
  /** Registrado por el panel Game del editor; la topbar dispara fullscreen. */
  onPlay?: () => void;
  onExport?: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  setHeader: (
    header: Partial<
      Pick<
        WorkspaceHeaderState,
        | "title"
        | "icon"
        | "onLoad"
        | "onPlay"
        | "onExport"
        | "onUndo"
        | "onRedo"
        | "canUndo"
        | "canRedo"
      >
    >,
  ) => void;
  resetHeader: () => void;
}

export const useWorkspaceHeader = create<WorkspaceHeaderState>((set) => ({
  title: null,
  icon: null,
  onLoad: undefined,
  onPlay: undefined,
  onExport: undefined,
  onUndo: undefined,
  onRedo: undefined,
  canUndo: false,
  canRedo: false,
  setHeader: (header) => set((state) => ({ ...state, ...header })),
  resetHeader: () =>
    set({
      title: null,
      icon: null,
      onLoad: undefined,
      onPlay: undefined,
      onExport: undefined,
      onUndo: undefined,
      onRedo: undefined,
      canUndo: false,
      canRedo: false,
    }),
}));
