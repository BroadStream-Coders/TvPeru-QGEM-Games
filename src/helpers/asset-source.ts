import type { AssetManifest } from "@/helpers/asset-preloader";

export type CatalogEntry =
  | { kind: "image" | "video" | "audio"; path: string }
  | { kind: "font"; path: string; family: string };

export type AssetCatalog = Record<string, CatalogEntry>;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const BASE = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/assets`
  : "/assets";

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
