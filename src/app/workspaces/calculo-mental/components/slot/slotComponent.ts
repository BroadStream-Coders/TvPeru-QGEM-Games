import { GameObjectComponent } from "@engine/gameObject";

export type SlotStatus = "none" | "correct" | "incorrect";

export interface SlotComponent extends GameObjectComponent {
  type: "slot";
  question: string;
  answer: string;
  showQuestion: boolean;
  showAnswer: boolean;
  status: SlotStatus;
  blueSrc: string;
  purpleSrc: string;
  checkSrc: string;
  xSrc: string;
}

export function createSlotComponent(
  init?: Partial<Omit<SlotComponent, "type">>,
): SlotComponent {
  return {
    type: "slot",
    question: init?.question ?? "",
    answer: init?.answer ?? "",
    showQuestion: init?.showQuestion ?? false,
    showAnswer: init?.showAnswer ?? false,
    status: init?.status ?? "none",
    blueSrc: init?.blueSrc ?? "",
    purpleSrc: init?.purpleSrc ?? "",
    checkSrc: init?.checkSrc ?? "",
    xSrc: init?.xSrc ?? "",
  };
}
