import type { AssetManifest } from "@/helpers/asset-preloader";

export type CatalogEntry =
  | { kind: "image" | "video" | "audio"; path: string }
  | { kind: "font"; path: string; family: string };

export type AssetCatalog = Record<string, CatalogEntry>;

const BASE = (
  process.env.NEXT_PUBLIC_ASSET_BASE_URL ?? "/assets"
).replace(/\/$/, "");

export const resolveAssetUrl = (path: string): string =>
  `${BASE}/${path.replace(/^\//, "")}`;

export function toManifest(catalog: AssetCatalog): AssetManifest {
  return Object.fromEntries(
    Object.entries(catalog).map(([key, entry]) => [
      key,
      entry.kind === "font"
        ? { kind: "font", src: resolveAssetUrl(entry.path), family: entry.family }
        : { kind: entry.kind, src: resolveAssetUrl(entry.path) },
    ]),
  );
}
