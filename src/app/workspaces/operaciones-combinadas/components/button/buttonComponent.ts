import { GameObjectComponent } from "@engine/gameObject";

export interface ButtonComponent extends GameObjectComponent {
  type: "button";
  color: string;
}

export function createButtonComponent(
  init?: Partial<Omit<ButtonComponent, "type">>,
): ButtonComponent {
  return {
    type: "button",
    color: init?.color ?? "#ffffff",
  };
}
