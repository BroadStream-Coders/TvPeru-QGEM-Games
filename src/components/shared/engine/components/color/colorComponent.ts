import { GameObjectComponent } from "@engine/gameObject";

export interface ColorComponent extends GameObjectComponent {
  type: "color";
  value: string;
}

export function createColorComponent(
  init?: Partial<Omit<ColorComponent, "type">>,
): ColorComponent {
  return {
    type: "color",
    value: init?.value ?? "#ffffff",
  };
}
