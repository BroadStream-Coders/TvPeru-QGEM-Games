import type { AssetCatalog } from "@/helpers/asset-source";

export const MI_LIBRO_FAVORITO_ASSETS = {
  correct: { kind: "audio", path: "shared/audio/correct.mp3" },
  incorrect: { kind: "audio", path: "shared/audio/incorrect.mp3" },
  mainFrame: {
    kind: "image",
    path: "games/mi-libro-favorito/mainFrame.png",
    folder: "Frames",
  },
  nameFrame: {
    kind: "image",
    path: "games/mi-libro-favorito/nameFrame.png",
    folder: "Frames",
  },
  fullHeart: {
    kind: "image",
    path: "games/mi-libro-favorito/fullHeart.png",
    folder: "Hearts",
  },
  brokenHeart: {
    kind: "image",
    path: "games/mi-libro-favorito/brokenHeart.png",
    folder: "Hearts",
  },
  geniusTechno: {
    kind: "font",
    path: "shared/fonts/GeniusTechno-Regular.ttf",
    family: "GeniusTechno",
    folder: "Fonts",
  },
} satisfies AssetCatalog;
