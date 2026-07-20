import type { AssetCatalog } from "@/helpers/asset-source";

export const BUSCA_LOGO_ASSETS = {
  cardNormal: {
    kind: "image",
    path: "games/busca-logo/level_2/normal.png",
    folder: "Cards",
  },
  cardSelected: {
    kind: "image",
    path: "games/busca-logo/level_2/selected.png",
    folder: "Cards",
  },
  cardLocked: {
    kind: "image",
    path: "games/busca-logo/level_2/locked.png",
    folder: "Cards",
  },
  cardEmpty: {
    kind: "image",
    path: "games/busca-logo/level_2/empty.png",
    folder: "Cards",
  },
  cardWithLogo: {
    kind: "image",
    path: "games/busca-logo/level_2/withLogo.png",
    folder: "Cards",
  },
  geniusTechno: {
    kind: "font",
    path: "shared/fonts/GeniusTechno-Regular.ttf",
    family: "GeniusTechno",
    folder: "Fonts",
  },
} satisfies AssetCatalog;
