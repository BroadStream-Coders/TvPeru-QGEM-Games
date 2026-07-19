export const LEVEL_ID = "level1";
export const QUESTION_FRAME_ID = "question-frame";
export const QUESTION_TEXT_ID = "question-text";

export const PLAYER_COUNT = 2;
export const MAX_HEART_SLOTS = 5;
export const SIDES = ["left", "right"] as const;

export const CONTENT_IDS = SIDES.map((s) => `content-${s}`);
export const NAME_TEXT_IDS = SIDES.map((s) => `name-text-${s}`);

export const HEART_SLOT_IDS = SIDES.map((s) =>
  Array.from({ length: MAX_HEART_SLOTS }, (_, i) => `heart-slot-${s}-${i}`),
);
export const HEART_ROOT_IDS = SIDES.map((s) =>
  Array.from({ length: MAX_HEART_SLOTS }, (_, i) => `heart-root-${s}-${i}`),
);
export const FULL_HEART_IDS = SIDES.map((s) =>
  Array.from({ length: MAX_HEART_SLOTS }, (_, i) => `heart-full-${s}-${i}`),
);
export const BROKEN_HEART_IDS = SIDES.map((s) =>
  Array.from({ length: MAX_HEART_SLOTS }, (_, i) => `heart-broken-${s}-${i}`),
);

const BANNER_SCALE = 0.92;
const HEART_PITCH = (82 + 9) * BANNER_SCALE;
export const HEART_SLOT_Y = -8 * BANNER_SCALE;
export const HEART_HIDDEN_Y = -74 * BANNER_SCALE;
export const QUESTION_HIDDEN_Y = -275;
export const CONTENT_HIDDEN_X = [-700 * BANNER_SCALE, 700 * BANNER_SCALE];

export const heartSlotX = (index: number, count: number) =>
  (index - (count - 1) / 2) * HEART_PITCH;
