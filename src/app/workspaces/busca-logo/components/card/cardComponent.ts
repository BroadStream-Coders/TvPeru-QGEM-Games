import { GameObjectComponent } from "@engine/gameObject";

export interface CardComponent extends GameObjectComponent {
  type: "card";
  index: number;
}

export function createCardComponent(
  init?: Partial<Omit<CardComponent, "type">>,
): CardComponent {
  return {
    type: "card",
    index: init?.index ?? 0,
  };
}
