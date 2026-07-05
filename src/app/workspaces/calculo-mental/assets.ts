import type { AssetCatalog } from "@/helpers/asset-source";

export const CALCULO_ASSETS = {
  correct: { kind: "audio", path: "shared/audio/correct.mp3" },
  incorrect: { kind: "audio", path: "shared/audio/incorrect.mp3" },
  poppinsSemiBold: {
    kind: "font",
    path: "shared/fonts/Poppins-SemiBold.ttf",
    family: "Poppins SemiBold",
    folder: "Fonts",
  },
  blueFrame: { kind: "image", path: "games/calculo-mental/blueFrame.png" },
  purpleFrame: { kind: "image", path: "games/calculo-mental/purpleFrame.png" },
  check: { kind: "image", path: "games/calculo-mental/check.png" },
  x: { kind: "image", path: "games/calculo-mental/x.png" },
} satisfies AssetCatalog;
