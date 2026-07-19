import { GameObjectComponent } from "@engine/gameObject";
import { Vec2 } from "@engine/RectTransform";

export interface BounceComponent extends GameObjectComponent {
  type: "bounce";
  travelSpeed: number;
  bounceAmplitude: number;
  bounceDuration: number;
  target: Vec2;
}

export function createBounceComponent(
  init?: Partial<Omit<BounceComponent, "type">>,
): BounceComponent {
  return {
    type: "bounce",
    travelSpeed: init?.travelSpeed ?? 1800,
    bounceAmplitude: init?.bounceAmplitude ?? 40,
    bounceDuration: init?.bounceDuration ?? 0.4,
    target: init?.target ?? { x: 0, y: 0 },
  };
}
