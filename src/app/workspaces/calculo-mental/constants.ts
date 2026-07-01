export const BACKGROUND_ID = "background";
export const CONTROLLER_ID = "controller";

export const SLOT_COUNT = 4;
export const SLOT_IDS = Array.from({ length: SLOT_COUNT }, (_, i) => `slot-${i}`);
export const QUESTION_IDS = SLOT_IDS.map((id) => `${id}-question`);
export const ANSWER_IDS = SLOT_IDS.map((id) => `${id}-answer`);
