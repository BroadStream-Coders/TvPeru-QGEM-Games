import { create } from "zustand";
import React from "react";

interface WorkspaceHeaderState {
  title: string | null;
  icon: React.ReactNode | null;
  onLoad?: (file: File) => void;
  /** Registrado por el editor; alterna el Play Mode. */
  onPlay?: () => void;
  /** Play deshabilitado (el juego requiere sesión y no hay una cargada). */
  playDisabled?: boolean;
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
        | "playDisabled"
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
  playDisabled: false,
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
      playDisabled: false,
      onExport: undefined,
      onUndo: undefined,
      onRedo: undefined,
      canUndo: false,
      canRedo: false,
    }),
}));
