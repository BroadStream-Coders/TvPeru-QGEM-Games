export type AssetKind = "image" | "video" | "audio" | "font";

export type AssetSpec =
  | { kind: "image" | "video" | "audio"; src: string }
  | { kind: "font"; src: string; family: string };

export type AssetManifest = Record<string, AssetSpec>;

export interface LoadedAsset {
  kind: AssetKind;
  url: string;
  family?: string;
  bytes: number;
  width?: number;
  height?: number;
}

export interface PreloadResult {
  assets: Record<string, LoadedAsset>;
  errors: Record<string, unknown>;
  dispose: () => void;
}

const fetchObjectUrl = async (
  src: string,
): Promise<{ url: string; bytes: number }> => {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(
      `No se pudo descargar el asset (${response.status}): ${src}`,
    );
  }
  const blob = await response.blob();
  return { url: URL.createObjectURL(blob), bytes: blob.size };
};

const decodeImage = async (
  url: string,
): Promise<{ width: number; height: number }> => {
  const img = new Image();
  img.src = url;
  await img.decode();
  return { width: img.naturalWidth, height: img.naturalHeight };
};

const decodeAudio = (url: string): Promise<void> =>
  new Promise((resolve, reject) => {
    const audio = new Audio();
    audio.preload = "auto";
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error(`No se pudo decodificar el audio: ${url}`));
    };
    const cleanup = () => {
      audio.removeEventListener("canplaythrough", onReady);
      audio.removeEventListener("error", onError);
    };
    audio.addEventListener("canplaythrough", onReady);
    audio.addEventListener("error", onError);
    audio.src = url;
    audio.load();
  });

const loadFont = async (family: string, url: string): Promise<void> => {
  const face = new FontFace(family, `url(${url})`);
  await face.load();
  document.fonts.add(face);
};

const loadOne = async (spec: AssetSpec): Promise<LoadedAsset> => {
  const { url, bytes } = await fetchObjectUrl(spec.src);
  switch (spec.kind) {
    case "image": {
      const { width, height } = await decodeImage(url);
      return { kind: "image", url, bytes, width, height };
    }
    case "video":
      return { kind: "video", url, bytes };
    case "audio":
      await decodeAudio(url);
      return { kind: "audio", url, bytes };
    case "font":
      await loadFont(spec.family, url);
      return { kind: "font", url, bytes, family: spec.family };
  }
};

export async function preloadAssets(
  manifest: AssetManifest,
  onSettle?: (key: string, ok: boolean, asset?: LoadedAsset) => void,
): Promise<PreloadResult> {
  const assets: Record<string, LoadedAsset> = {};
  const errors: Record<string, unknown> = {};
  const createdUrls: string[] = [];

  const entries = Object.entries(manifest);

  await Promise.all(
    entries.map(async ([key, spec]) => {
      try {
        const loaded = await loadOne(spec);
        assets[key] = loaded;
        createdUrls.push(loaded.url);
        onSettle?.(key, true, loaded);
      } catch (error) {
        errors[key] = error;
        onSettle?.(key, false);
      }
    }),
  );

  const dispose = () => {
    for (const url of createdUrls) URL.revokeObjectURL(url);
  };

  return { assets, errors, dispose };
}
