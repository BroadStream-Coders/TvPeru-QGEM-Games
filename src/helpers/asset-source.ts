import type { AssetManifest, LoadedAsset } from "@/helpers/asset-preloader";

// `path` = origen físico del archivo (public/ o Supabase). `folder` = organización
// dentro de la carga local, independiente del origen ("/"-separado para anidar).
export type CatalogEntry =
  | { kind: "image" | "video" | "audio"; path: string; folder?: string }
  | { kind: "font"; path: string; family: string; folder?: string };

export type AssetCatalog = Record<string, CatalogEntry>;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const BASE = SUPABASE_URL
  ? `${SUPABASE_URL}/storage/v1/object/public/assets`
  : "/assets";

export const resolveAssetUrl = (path: string): string =>
  `${BASE}/${path.replace(/^\//, "")}`;

export type LocalAsset = { entry: CatalogEntry; loaded: LoadedAsset };

const FONT_EXT = /\.(ttf|otf|woff2?)$/i;
const isFontFile = (file: File) =>
  file.type.startsWith("font/") || FONT_EXT.test(file.name);

const kindFromFile = (file: File): "image" | "video" | "audio" | null => {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  return null;
};

export function localAssetFromFile(file: File): LocalAsset | null {
  const url = URL.createObjectURL(file);

  if (isFontFile(file)) {
    const family = `qgem-font-${crypto.randomUUID()}`;
    const face = new FontFace(family, `url(${url})`);
    document.fonts.add(face);
    face.load();
    return {
      entry: { kind: "font", path: file.name, family, folder: "" },
      loaded: { kind: "font", url, family },
    };
  }

  const kind = kindFromFile(file);
  if (!kind) {
    URL.revokeObjectURL(url);
    return null;
  }
  return { entry: { kind, path: file.name, folder: "" }, loaded: { kind, url } };
}

export function toManifest(catalog: AssetCatalog): AssetManifest {
  return Object.fromEntries(
    Object.entries(catalog).map(([key, entry]) => [
      key,
      entry.kind === "font"
        ? {
            kind: "font",
            src: resolveAssetUrl(entry.path),
            family: entry.family,
          }
        : { kind: entry.kind, src: resolveAssetUrl(entry.path) },
    ]),
  );
}
