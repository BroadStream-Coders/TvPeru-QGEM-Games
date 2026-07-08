import { useEffect, useMemo, useState } from "react";
import {
  AssetManifest,
  LoadedAsset,
  preloadAssets,
} from "@/helpers/asset-preloader";
import { useMemoryBudget } from "@/hooks/use-memory-budget";

export type AssetStatus = "loading" | "ready" | "error";

export interface UseAssetPreloader {
  ready: boolean;
  assets: Record<string, LoadedAsset | undefined>;
  statuses: Record<string, AssetStatus>;
  progress: { loaded: number; total: number };
}

export function useAssetPreloader(manifest: AssetManifest): UseAssetPreloader {
  const keys = useMemo(() => Object.keys(manifest), [manifest]);

  const [assets, setAssets] = useState<Record<string, LoadedAsset | undefined>>(
    {},
  );
  const [statuses, setStatuses] = useState<Record<string, AssetStatus>>(() =>
    Object.fromEntries(keys.map((key) => [key, "loading" as AssetStatus])),
  );
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    setAssets({});
    setStatuses(Object.fromEntries(keys.map((key) => [key, "loading"])));
    setReady(false);

    const result = preloadAssets(manifest, (key, ok, asset) => {
      if (!active) return;
      if (asset) {
        useMemoryBudget.getState().register("catalog", key, {
          kind: asset.kind,
          bytes: asset.bytes,
          width: asset.width,
          height: asset.height,
        });
      }
      setStatuses((prev) => ({ ...prev, [key]: ok ? "ready" : "error" }));
    });

    result.then(({ assets: loaded }) => {
      if (!active) return;
      setAssets(loaded);
      setReady(true);
    });

    return () => {
      active = false;
      useMemoryBudget.getState().clear("catalog");
      result.then(({ dispose }) => dispose());
    };
  }, [manifest, keys]);

  const loaded = keys.reduce(
    (count, key) => (statuses[key] === "ready" ? count + 1 : count),
    0,
  );

  return { ready, assets, statuses, progress: { loaded, total: keys.length } };
}
