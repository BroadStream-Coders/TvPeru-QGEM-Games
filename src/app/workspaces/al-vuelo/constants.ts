export const LEVEL1_ID = "level1";
export const QUESTION_TEXT_ID = "question-text";
export const OPTION_COUNT = 2;

const optionIds = (suffix: string) =>
  Array.from({ length: OPTION_COUNT }, (_, i) => `option-${i}-${suffix}`);

export const NORMAL_FRAME_IDS = optionIds("frame-normal");
export const CORRECT_FRAME_IDS = optionIds("frame-correct");
export const INCORRECT_FRAME_IDS = optionIds("frame-incorrect");
