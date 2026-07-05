import type { AssetCatalog } from "@/helpers/asset-source";

export const DELETREO_ASSETS = {
  correct: { kind: "audio", path: "shared/audio/correct.mp3" },
  incorrect: { kind: "audio", path: "shared/audio/incorrect.mp3" },
  geniusTechno: {
    kind: "font",
    path: "shared/fonts/GeniusTechno-Regular.ttf",
    family: "GeniusTechno",
    folder: "Fonts",
  },
  mainFrame: {
    kind: "image",
    path: "games/deletreo/mainFrame.png",
    folder: "Frames",
  },
  errorFrame: {
    kind: "image",
    path: "games/deletreo/errorFrame.png",
    folder: "Frames",
  },
} satisfies AssetCatalog;
