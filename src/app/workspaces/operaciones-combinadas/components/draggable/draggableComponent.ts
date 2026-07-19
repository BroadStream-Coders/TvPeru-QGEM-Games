import { GameObjectComponent } from "@engine/gameObject";

export interface DraggableComponent extends GameObjectComponent {
  type: "draggable";
  color: string;
}

export function createDraggableComponent(
  init?: Partial<Omit<DraggableComponent, "type">>,
): DraggableComponent {
  return {
    type: "draggable",
    color: init?.color ?? "#FFB300",
  };
}
