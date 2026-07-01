import type { AssetCatalog } from "@/helpers/asset-source";

export const INTRUSO_ASSETS = {
  mainFrame: { kind: "image", path: "games/intruso/mainFrame.png" },
  normalFrame: { kind: "image", path: "games/intruso/normalFrame.png" },
  correctFrame: { kind: "image", path: "games/intruso/correctFrame.png" },
  incorrectFrame: { kind: "image", path: "games/intruso/incorrectFrame.png" },
  mask: { kind: "image", path: "games/intruso/mask.png" },
  colorBlue: { kind: "image", path: "games/intruso/color/blue.png" },
  colorGreen: { kind: "image", path: "games/intruso/color/green.png" },
  colorRed: { kind: "image", path: "games/intruso/color/red.png" },
  colorYellow: { kind: "image", path: "games/intruso/color/yellow.png" },
  background: { kind: "video", path: "shared/backgrounds/backgroundBlue.mp4" },
  geniusTechno: {
    kind: "font",
    path: "shared/fonts/GeniusTechno-Regular.ttf",
    family: "GeniusTechno",
  },
} satisfies AssetCatalog;
