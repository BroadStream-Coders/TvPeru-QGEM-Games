import type { AssetCatalog } from "@/helpers/asset-source";

export const LA_SABES_ASSETS = {
  correct: { kind: "audio", path: "shared/audio/correct.mp3" },
  incorrect: { kind: "audio", path: "shared/audio/incorrect.mp3" },
  questionFrame: {
    kind: "image",
    path: "games/la-sabes-o-no/questionFrame.png",
    folder: "Frames",
  },
  normalFrame: {
    kind: "image",
    path: "games/la-sabes-o-no/normalFrame.png",
    folder: "Frames",
  },
  correctFrame: {
    kind: "image",
    path: "games/la-sabes-o-no/correctFrame.png",
    folder: "Frames",
  },
  incorrectFrame: {
    kind: "image",
    path: "games/la-sabes-o-no/incorrectFrame.png",
    folder: "Frames",
  },
  border: {
    kind: "image",
    path: "games/la-sabes-o-no/border.png",
    folder: "Frames",
  },
  mask: {
    kind: "image",
    path: "games/la-sabes-o-no/mask.png",
    folder: "Frames",
  },
  bookLeft: {
    kind: "image",
    path: "games/la-sabes-o-no/bookLeft.png",
    folder: "Decor",
  },
  bookRight: {
    kind: "image",
    path: "games/la-sabes-o-no/bookRight.png",
    folder: "Decor",
  },
  jetBrainsMono: {
    kind: "font",
    path: "shared/fonts/JetBrainsMono.ttf",
    family: "JetBrains Mono",
    folder: "Fonts",
  },
} satisfies AssetCatalog;
