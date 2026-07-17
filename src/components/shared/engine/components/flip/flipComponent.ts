import { GameObjectComponent } from "@engine/gameObject";

export interface FlipComponent extends GameObjectComponent {
  type: "flip";
  hideDuration: number;
  showDuration: number;
  perspective: number;
}

export function createFlipComponent(
  init?: Partial<Omit<FlipComponent, "type">>,
): FlipComponent {
  return {
    type: "flip",
    hideDuration: init?.hideDuration ?? 0.25,
    showDuration: init?.showDuration ?? 0.45,
    perspective: init?.perspective ?? 6,
  };
}
