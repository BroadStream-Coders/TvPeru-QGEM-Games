import type { AssetCatalog } from "@/helpers/asset-source";

export const AL_VUELO_ASSETS = {
  correct: { kind: "audio", path: "shared/audio/correct.mp3" },
  incorrect: { kind: "audio", path: "shared/audio/incorrect.mp3" },
  mainBanner: {
    kind: "image",
    path: "games/al-vuelo/mainBanner.png",
    folder: "Frames",
  },
  answerBanner: {
    kind: "image",
    path: "games/al-vuelo/answerBanner.png",
    folder: "Frames",
  },
  correctFrame: {
    kind: "image",
    path: "games/al-vuelo/correctFrame.png",
    folder: "Frames",
  },
  incorrectFrame: {
    kind: "image",
    path: "games/al-vuelo/incorrectFrame.png",
    folder: "Frames",
  },
  selection: {
    kind: "image",
    path: "games/al-vuelo/selection.png",
    folder: "Frames",
  },
  geniusTechno: {
    kind: "font",
    path: "shared/fonts/GeniusTechno-Regular.ttf",
    family: "GeniusTechno",
    folder: "Fonts",
  },
} satisfies AssetCatalog;
