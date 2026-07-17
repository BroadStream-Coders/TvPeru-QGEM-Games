export const ALBUM_ID = "album";
export const THEMES_ID = "themes";
export const GAMEPLAY_ID = "gameplay";
export const ROUND_TITLE_ID = "round-title";
export const CARD_COUNT = 5;
export const THEME_COUNT = 6;

const cardIds = (suffix: string) =>
  Array.from({ length: CARD_COUNT }, (_, i) => `card-${i}-${suffix}`);

export const CARD_IDS = Array.from(
  { length: CARD_COUNT },
  (_, i) => `card-${i}`,
);
export const CARD_BACK_IDS = cardIds("back");
export const CARD_FRONT_IDS = cardIds("front");
export const CARD_BACK_BG_IDS = cardIds("back-bg");
export const CARD_FRONT_BG_IDS = cardIds("front-bg");
export const CARD_QUESTION_IDS = cardIds("question");
export const CARD_PHOTO_IDS = cardIds("photo");
export const CARD_PHOTO_COLOR_IDS = cardIds("photo-color");
export const CARD_PHOTO_GRAY_IDS = cardIds("photo-gray");

const themeIds = (suffix: string) =>
  Array.from({ length: THEME_COUNT }, (_, i) => `theme-${i}-${suffix}`);

export const THEME_NORMAL_IDS = themeIds("normal");
export const THEME_LOCKED_IDS = themeIds("locked");
export const THEME_NORMAL_TITLE_IDS = themeIds("normal-title");
export const THEME_LOCKED_TITLE_IDS = themeIds("locked-title");
