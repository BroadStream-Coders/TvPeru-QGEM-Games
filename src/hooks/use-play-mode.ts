import { create } from "zustand";

export type PlayEditing = "restrict" | "edit";

interface PlayModeState {
  playing: boolean;
  editing: PlayEditing;
  enterPlay: () => void;
  exitPlay: () => void;
  setEditing: (editing: PlayEditing) => void;
  reset: (editing?: PlayEditing) => void;
}

export const usePlayMode = create<PlayModeState>((set) => ({
  playing: false,
  editing: "restrict",
  enterPlay: () => set({ playing: true }),
  exitPlay: () => set({ playing: false }),
  setEditing: (editing) => set({ editing }),
  reset: (editing = "restrict") => set({ playing: false, editing }),
}));
