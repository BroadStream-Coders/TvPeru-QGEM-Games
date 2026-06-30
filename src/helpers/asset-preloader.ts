export type AssetKind = "image" | "video" | "audio" | "font";

export type AssetSpec =
  | { kind: "image" | "video" | "audio"; src: string }
  | { kind: "font"; src: string; family: string };

export type AssetManifest = Record<string, AssetSpec>;

export interface LoadedAsset {
  kind: AssetKind;
  url: string;
  family?: string;
}

export interface PreloadResult {
  assets: Record<string, LoadedAsset>;
  errors: Record<string, unknown>;
  dispose: () => void;
}

const fetchObjectUrl = async (src: string): Promise<string> => {
  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(
      `No se pudo descargar el asset (${response.status}): ${src}`,
    );
  }
  const blob = await response.blob();
  return URL.createObjectURL(blob);
};

const decodeImage = (url: string): Promise<void> => {
  const img = new Image();
  img.src = url;
  return img.decode();
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
  const url = await fetchObjectUrl(spec.src);
  switch (spec.kind) {
    case "image":
      await decodeImage(url);
      return { kind: "image", url };
    case "video":
      return { kind: "video", url };
    case "audio":
      await decodeAudio(url);
      return { kind: "audio", url };
    case "font":
      await loadFont(spec.family, url);
      return { kind: "font", url, family: spec.family };
  }
};

export async function preloadAssets(
  manifest: AssetManifest,
  onSettle?: (key: string, ok: boolean) => void,
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
        onSettle?.(key, true);
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
