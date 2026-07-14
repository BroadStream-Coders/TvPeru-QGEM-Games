import type { AssetCatalog } from "@/helpers/asset-source";

export const ALBUM_ASSETS = {
  correct: { kind: "audio", path: "shared/audio/correct.mp3" },
  incorrect: { kind: "audio", path: "shared/audio/incorrect.mp3" },
  cardCroma: {
    kind: "image",
    path: "games/album/cards/00_CromaCard.png",
    folder: "Cards",
  },
  cardRed: {
    kind: "image",
    path: "games/album/cards/01_RedCard.png",
    folder: "Cards",
  },
  cardYellow: {
    kind: "image",
    path: "games/album/cards/02_YellowCard.png",
    folder: "Cards",
  },
  cardBlue: {
    kind: "image",
    path: "games/album/cards/03_BlueCard.png",
    folder: "Cards",
  },
  cardOrange: {
    kind: "image",
    path: "games/album/cards/04_OrangeCard.png",
    folder: "Cards",
  },
  cardGreen: {
    kind: "image",
    path: "games/album/cards/05_GreenCard.png",
    folder: "Cards",
  },
  cardPurple: {
    kind: "image",
    path: "games/album/cards/06_PurpleCard.png",
    folder: "Cards",
  },
  logo: {
    kind: "image",
    path: "games/album/Logo.png",
  },
  mask: {
    kind: "image",
    path: "games/album/Mask.png",
  },
  themeRed: {
    kind: "image",
    path: "games/album/themes/01_RedPackage.png",
    folder: "Themes",
  },
  themeYellow: {
    kind: "image",
    path: "games/album/themes/02_YellowPackage.png",
    folder: "Themes",
  },
  themeBlue: {
    kind: "image",
    path: "games/album/themes/03_BluePackage.png",
    folder: "Themes",
  },
  themeOrange: {
    kind: "image",
    path: "games/album/themes/04_OrangePackage.png",
    folder: "Themes",
  },
  themeGreen: {
    kind: "image",
    path: "games/album/themes/05_GreenPackage.png",
    folder: "Themes",
  },
  themePurple: {
    kind: "image",
    path: "games/album/themes/06_PurplePackage.png",
    folder: "Themes",
  },
  background: {
    kind: "video",
    path: "shared/backgrounds/backgroundBlue.mp4",
    folder: "Backgrounds",
  },
  geniusTechno: {
    kind: "font",
    path: "shared/fonts/GeniusTechno-Regular.ttf",
    family: "Genius Techno",
    folder: "Fonts",
  },
  retroGaming: {
    kind: "font",
    path: "shared/fonts/Retro-Gaming.ttf",
    family: "Retro Gaming",
    folder: "Fonts",
  },
  jetBrainsMono: {
    kind: "font",
    path: "shared/fonts/JetBrainsMono.ttf",
    family: "JetBrains Mono",
    folder: "Fonts",
  },
} satisfies AssetCatalog;

export const CARD_COLOR_KEYS = [
  "cardRed",
  "cardYellow",
  "cardBlue",
  "cardOrange",
  "cardGreen",
  "cardPurple",
] as const;
