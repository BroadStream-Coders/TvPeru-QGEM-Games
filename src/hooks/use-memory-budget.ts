import { create } from "zustand";
import type { AssetKind } from "@/helpers/asset-preloader";

export const MEMORY_BUDGET_BYTES = 2 * 1024 ** 3;

export type MemoryCategory = "catalog" | "local" | "session";

export interface MemoryEntry {
  kind: AssetKind;
  bytes: number;
  width?: number;
  height?: number;
}

export const estimateBytes = (entry: MemoryEntry): number =>
  entry.bytes +
  (entry.width && entry.height ? entry.width * entry.height * 4 : 0);

export const categoryBytes = (
  entries: Record<string, MemoryEntry>,
): number =>
  Object.values(entries).reduce((sum, entry) => sum + estimateBytes(entry), 0);

export const formatBytes = (bytes: number): string => {
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
};

interface MemoryBudgetState {
  entries: Record<MemoryCategory, Record<string, MemoryEntry>>;
  register: (
    category: MemoryCategory,
    key: string,
    entry: MemoryEntry,
  ) => void;
  clear: (category: MemoryCategory) => void;
}

export const useMemoryBudget = create<MemoryBudgetState>((set) => ({
  entries: { catalog: {}, local: {}, session: {} },
  register: (category, key, entry) =>
    set((state) => ({
      entries: {
        ...state.entries,
        [category]: { ...state.entries[category], [key]: entry },
      },
    })),
  clear: (category) =>
    set((state) => ({ entries: { ...state.entries, [category]: {} } })),
}));
