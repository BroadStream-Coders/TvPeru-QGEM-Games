import type { AssetCatalog } from "@/helpers/asset-source";

export const CALCULO_ASSETS = {
  blueFrame: { kind: "image", path: "games/calculo-mental/blueFrame.png" },
  purpleFrame: { kind: "image", path: "games/calculo-mental/purpleFrame.png" },
  check: { kind: "image", path: "games/calculo-mental/check.png" },
  x: { kind: "image", path: "games/calculo-mental/x.png" },
} satisfies AssetCatalog;
