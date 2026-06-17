import { GameObjectComponent } from "@engine/gameObject";

export interface BorderComponent extends GameObjectComponent {
  type: "border";
  color: string;
  width: number;
  radius: number;
}

export function createBorderComponent(
  init?: Partial<Omit<BorderComponent, "type">>,
): BorderComponent {
  return {
    type: "border",
    color: init?.color ?? "#ffffff",
    width: init?.width ?? 2,
    radius: init?.radius ?? 0,
  };
}
