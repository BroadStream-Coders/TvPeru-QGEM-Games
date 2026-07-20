export const BACKGROUND_ID = "background";
export const LEVEL0_ID = "level0";
export const LEVEL0_MESSAGE_ID = "level0-message";
export const LEVEL2_ID = "level2";
export const CARD_COUNT = 20;
export const COLUMNS = 5;
export const BOARD_SIZE = "5x4";

const LETTERS = "ABCDE";

const cardIds = (suffix?: string) =>
  Array.from({ length: CARD_COUNT }, (_, i) =>
    suffix ? `card-${i}-${suffix}` : `card-${i}`,
  );

export const CARD_IDS = cardIds();
export const CARD_BACK_IDS = cardIds("back");
export const CARD_FRONT_IDS = cardIds("front");
export const CARD_NORMAL_IDS = cardIds("normal");
export const CARD_SELECTED_IDS = cardIds("selected");
export const CARD_LOCKED_IDS = cardIds("locked");
export const CARD_EMPTY_IDS = cardIds("empty");
export const CARD_LOGO_IDS = cardIds("logo");

export const CARD_LABELS = Array.from(
  { length: CARD_COUNT },
  (_, i) => `${Math.floor(i / COLUMNS) + 1}${LETTERS[i % COLUMNS]}`,
);
