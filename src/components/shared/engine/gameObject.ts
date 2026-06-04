import { RectTransformValues } from "@engine/RectTransform";

export interface GameObjectComponent {
  type: string;
}

export interface GameObject {
  id: string;
  name: string;
  active: boolean;
  parentId?: string;
  transform: RectTransformValues;
  components: GameObjectComponent[];
}

export function createGameObject(init: {
  id: string;
  name: string;
  transform: RectTransformValues;
  active?: boolean;
  parentId?: string;
  components?: GameObjectComponent[];
}): GameObject {
  return {
    id: init.id,
    name: init.name,
    active: init.active ?? true,
    parentId: init.parentId,
    transform: init.transform,
    components: init.components ?? [],
  };
}
