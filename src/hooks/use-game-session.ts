import { create } from "zustand";

interface GameSessionState {
  session: unknown;
  fileName: string | null;
  loadedAt: number;
  dispose: (() => void) | null;
  setSession: (
    session: unknown,
    opts?: { fileName?: string; dispose?: () => void },
  ) => void;
  clear: () => void;
}

export const useGameSession = create<GameSessionState>((set, get) => ({
  session: null,
  fileName: null,
  loadedAt: 0,
  dispose: null,
  setSession: (session, opts) => {
    get().dispose?.();
    set({
      session,
      fileName: opts?.fileName ?? null,
      loadedAt: Date.now(),
      dispose: opts?.dispose ?? null,
    });
  },
  clear: () => {
    get().dispose?.();
    set({ session: null, fileName: null, loadedAt: 0, dispose: null });
  },
}));
