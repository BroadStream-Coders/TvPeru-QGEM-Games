import { GameObjectComponent } from "@engine/gameObject";

export interface SparklesComponent extends GameObjectComponent {
  type: "sparkles";
  rate: number;
  size: number;
  duration: number;
}

export function createSparklesComponent(
  init?: Partial<Omit<SparklesComponent, "type">>,
): SparklesComponent {
  return {
    type: "sparkles",
    rate: init?.rate ?? 3,
    size: init?.size ?? 3.5,
    duration: init?.duration ?? 0.7,
  };
}
