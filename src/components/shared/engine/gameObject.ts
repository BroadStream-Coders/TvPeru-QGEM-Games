import { RectTransformValues, Vec2 } from "@engine/RectTransform";

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

export function ancestorOffset(go: GameObject, all: GameObject[]): Vec2 {
  let offset: Vec2 = { x: 0, y: 0 };
  let parent = go.parentId ? all.find((p) => p.id === go.parentId) : undefined;
  while (parent) {
    offset = {
      x: offset.x + parent.transform.position.x,
      y: offset.y + parent.transform.position.y,
    };
    const nextId: string | undefined = parent.parentId;
    parent = nextId ? all.find((p) => p.id === nextId) : undefined;
  }
  return offset;
}
