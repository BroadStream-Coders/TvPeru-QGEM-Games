import type { AssetCatalog } from "@/helpers/asset-source";

export const INTRUSO_ASSETS = {
  mainFrame: {
    kind: "image",
    path: "games/intruso/mainFrame.png",
    folder: "Frames",
  },
  normalFrame: {
    kind: "image",
    path: "games/intruso/normalFrame.png",
    folder: "Frames",
  },
  correctFrame: {
    kind: "image",
    path: "games/intruso/correctFrame.png",
    folder: "Frames",
  },
  incorrectFrame: {
    kind: "image",
    path: "games/intruso/incorrectFrame.png",
    folder: "Frames",
  },
  mask: { kind: "image", path: "games/intruso/mask.png", folder: "Frames" },
  colorBlue: {
    kind: "image",
    path: "games/intruso/color/blue.png",
    folder: "Colors",
  },
  colorGreen: {
    kind: "image",
    path: "games/intruso/color/green.png",
    folder: "Colors",
  },
  colorRed: {
    kind: "image",
    path: "games/intruso/color/red.png",
    folder: "Colors",
  },
  colorYellow: {
    kind: "image",
    path: "games/intruso/color/yellow.png",
    folder: "Colors",
  },
  background: {
    kind: "video",
    path: "shared/backgrounds/backgroundBlue.mp4",
    folder: "Backgrounds",
  },
  geniusTechno: {
    kind: "font",
    path: "shared/fonts/GeniusTechno-Regular.ttf",
    family: "GeniusTechno",
    folder: "Fonts",
  },
} satisfies AssetCatalog;
