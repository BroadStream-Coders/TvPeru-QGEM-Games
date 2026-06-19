import { GameObjectComponent } from "@engine/gameObject";

export interface ShakeComponent extends GameObjectComponent {
  type: "shake";
  amplitude: number;
  shakes: number;
  duration: number;
}

export function createShakeComponent(
  init?: Partial<Omit<ShakeComponent, "type">>,
): ShakeComponent {
  return {
    type: "shake",
    amplitude: init?.amplitude ?? 2,
    shakes: init?.shakes ?? 3,
    duration: init?.duration ?? 0.4,
  };
}
