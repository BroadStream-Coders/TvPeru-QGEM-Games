import type { AssetCatalog } from "@/helpers/asset-source";

export const SHARED_ASSETS = {
  correctSound: { kind: "audio", path: "shared/audio/correct.mp3" },
  incorrectSound: { kind: "audio", path: "shared/audio/incorrect.mp3" },
  poppinsSemiBold: {
    kind: "font",
    path: "shared/fonts/Poppins-SemiBold.ttf",
    family: "Poppins SemiBold",
    folder: "Fonts",
  },
} satisfies AssetCatalog;
