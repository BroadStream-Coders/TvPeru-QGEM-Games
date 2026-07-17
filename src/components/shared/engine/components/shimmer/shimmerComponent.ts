import { GameObjectComponent } from "@engine/gameObject";

export interface ShimmerComponent extends GameObjectComponent {
  type: "shimmer";
  period: number;
  sweep: number;
  phase: number;
  intensity: number;
  radius: number;
}

export function createShimmerComponent(
  init?: Partial<Omit<ShimmerComponent, "type">>,
): ShimmerComponent {
  return {
    type: "shimmer",
    period: init?.period ?? 5.5,
    sweep: init?.sweep ?? 1,
    phase: init?.phase ?? 0,
    intensity: init?.intensity ?? 0.55,
    radius: init?.radius ?? 1,
  };
}
