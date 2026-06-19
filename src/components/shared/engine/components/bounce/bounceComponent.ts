import { GameObjectComponent } from "@engine/gameObject";

export interface BounceComponent extends GameObjectComponent {
  type: "bounce";
  travelSpeed: number;
  bounceAmplitude: number;
  bounceDuration: number;
}

export function createBounceComponent(
  init?: Partial<Omit<BounceComponent, "type">>,
): BounceComponent {
  return {
    type: "bounce",
    travelSpeed: init?.travelSpeed ?? 1800,
    bounceAmplitude: init?.bounceAmplitude ?? 40,
    bounceDuration: init?.bounceDuration ?? 0.4,
  };
}
