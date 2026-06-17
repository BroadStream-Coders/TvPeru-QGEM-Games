import type { AssetCatalog } from "@/helpers/asset-source";

export const SHARED_ASSETS = {
  correctSound: { kind: "audio", path: "shared/audio/correct.mp3" },
  incorrectSound: { kind: "audio", path: "shared/audio/incorrect.mp3" },
} satisfies AssetCatalog;
