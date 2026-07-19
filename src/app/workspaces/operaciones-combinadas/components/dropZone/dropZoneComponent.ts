import { GameObjectComponent } from "@engine/gameObject";

export interface DropZoneComponent extends GameObjectComponent {
  type: "dropZone";
  hover: boolean;
  filled: boolean;
}

export function createDropZoneComponent(
  init?: Partial<Omit<DropZoneComponent, "type">>,
): DropZoneComponent {
  return {
    type: "dropZone",
    hover: init?.hover ?? false,
    filled: init?.filled ?? false,
  };
}
