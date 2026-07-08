export const BACKGROUND_ID = "background";
export const LEVEL1_ID = "level1";
export const PICTURE_ID = "picture";
export const OPTION_COUNT = 4;

const optionIds = (suffix: string) =>
  Array.from({ length: OPTION_COUNT }, (_, i) => `option-${i}-${suffix}`);

export const OPTION_TEXT_IDS = optionIds("text");
export const NORMAL_FRAME_IDS = optionIds("frame-normal");
export const CORRECT_FRAME_IDS = optionIds("frame-correct");
export const INCORRECT_FRAME_IDS = optionIds("frame-incorrect");
