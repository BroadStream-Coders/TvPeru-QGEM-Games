import { GameObjectComponent } from "@engine/gameObject";

export interface FloatComponent extends GameObjectComponent {
  type: "float";
  amplitude: number;
  rotation: number;
  period: number;
  phase: number;
}

export function createFloatComponent(
  init?: Partial<Omit<FloatComponent, "type">>,
): FloatComponent {
  return {
    type: "float",
    amplitude: init?.amplitude ?? 3,
    rotation: init?.rotation ?? 0.6,
    period: init?.period ?? 6,
    phase: init?.phase ?? 0,
  };
}
