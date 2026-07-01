"use client";

import { createContext, useContext } from "react";
import type { LoadedAsset, AssetKind } from "@/helpers/asset-preloader";
import type { AssetStatus } from "@/hooks/use-asset-preloader";

export interface LoadedAssetsState {
  assets: Record<string, LoadedAsset | undefined>;
  statuses: Record<string, AssetStatus>;
  kinds: Record<string, AssetKind>;
  progress: { loaded: number; total: number };
}

const EMPTY: LoadedAssetsState = {
  assets: {},
  statuses: {},
  kinds: {},
  progress: { loaded: 0, total: 0 },
};

const AssetsContext = createContext<LoadedAssetsState>(EMPTY);

export const AssetsProvider = AssetsContext.Provider;

export function useAssets() {
  return useContext(AssetsContext);
}
