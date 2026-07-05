import { GameObjectComponent } from "@engine/gameObject";

export type SlotStatus = "none" | "correct" | "incorrect";

export interface SlotComponent extends GameObjectComponent {
  type: "slot";
  status: SlotStatus;
}

export function createSlotComponent(
  init?: Partial<Omit<SlotComponent, "type">>,
): SlotComponent {
  return {
    type: "slot",
    status: init?.status ?? "none",
  };
}
