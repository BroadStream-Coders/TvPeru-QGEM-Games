import { RectTransformValues } from "@/components/shared/RectTransform";

export interface GameObjectComponent {
  type: string;
}

export interface GameObject {
  id: string;
  name: string;
  active: boolean;
  transform: RectTransformValues;
  components: GameObjectComponent[];
}

export function createGameObject(init: {
  id: string;
  name: string;
  transform: RectTransformValues;
  active?: boolean;
  components?: GameObjectComponent[];
}): GameObject {
  return {
    id: init.id,
    name: init.name,
    active: init.active ?? true,
    transform: init.transform,
    components: init.components ?? [],
  };
}
