"use client";

import { createContext, useContext } from "react";
import type { LoadedAsset, AssetKind } from "@/helpers/asset-preloader";
import type { AssetStatus } from "@/hooks/use-asset-preloader";
import type { AssetCatalog } from "@/helpers/asset-source";

export interface LoadedAssetsState {
  /** Catálogo original (key → { kind, path }); el path da la jerarquía de carpetas. */
  catalog: AssetCatalog;
  assets: Record<string, LoadedAsset | undefined>;
  statuses: Record<string, AssetStatus>;
  kinds: Record<string, AssetKind>;
  progress: { loaded: number; total: number };
  addLocalFiles: (files: FileList | File[]) => void;
  /** Carpetas creadas por el usuario (pueden estar vacías); las demás se derivan del catálogo. */
  folders: string[];
  createFolder: (path: string) => void;
  moveAssets: (keys: string[], folder: string) => void;
  moveFolder: (path: string, target: string) => void;
}

const EMPTY: LoadedAssetsState = {
  catalog: {},
  assets: {},
  statuses: {},
  kinds: {},
  progress: { loaded: 0, total: 0 },
  addLocalFiles: () => {},
  folders: [],
  createFolder: () => {},
  moveAssets: () => {},
  moveFolder: () => {},
};

const AssetsContext = createContext<LoadedAssetsState>(EMPTY);

export const AssetsProvider = AssetsContext.Provider;

export function useAssets() {
  return useContext(AssetsContext);
}
