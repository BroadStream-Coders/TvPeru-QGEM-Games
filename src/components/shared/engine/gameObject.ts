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

export type GameObjectKind = "group" | "text" | "image" | "video" | "color";

const KIND_PRIORITY: GameObjectKind[] = ["video", "image", "text", "color"];
const ANIMATION_TYPES = new Set(["pop", "shake", "bounce", "slide"]);

export function gameObjectKind(
  components: GameObjectComponent[],
): GameObjectKind {
  for (const kind of KIND_PRIORITY) {
    if (components.some((c) => c.type === kind)) return kind;
  }
  return "group";
}

export function gameObjectHasAnimation(
  components: GameObjectComponent[],
): boolean {
  return components.some((c) => ANIMATION_TYPES.has(c.type));
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

export function isDescendantOf(
  all: GameObject[],
  nodeId: string,
  ancestorId: string,
): boolean {
  let current = all.find((g) => g.id === nodeId);
  while (current?.parentId) {
    if (current.parentId === ancestorId) return true;
    const parentId: string = current.parentId;
    current = all.find((g) => g.id === parentId);
  }
  return false;
}

export function collectSubtreeIds(
  all: GameObject[],
  rootId: string,
): Set<string> {
  const ids = new Set<string>([rootId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const go of all) {
      if (go.parentId && ids.has(go.parentId) && !ids.has(go.id)) {
        ids.add(go.id);
        grew = true;
      }
    }
  }
  return ids;
}

export function deleteGameObjectAndChildren(
  all: GameObject[],
  idToDelete: string,
): GameObject[] {
  const ids = collectSubtreeIds(all, idToDelete);
  return all.filter((go) => !ids.has(go.id));
}

export function reorderGameObjects(
  all: GameObject[],
  draggedId: string,
  targetId: string,
  position: "before" | "after" | "inside",
): GameObject[] {
  if (draggedId === targetId) return all;

  const dragged = all.find((g) => g.id === draggedId);
  const target = all.find((g) => g.id === targetId);
  if (!dragged || !target) return all;

  if (isDescendantOf(all, targetId, draggedId)) return all;

  const newParentId = position === "inside" ? targetId : target.parentId;

  const offsetForParent = (parentId?: string): Vec2 => {
    if (!parentId) return { x: 0, y: 0 };
    const parent = all.find((g) => g.id === parentId);
    if (!parent) return { x: 0, y: 0 };
    const ancestors = ancestorOffset(parent, all);
    return {
      x: parent.transform.position.x + ancestors.x,
      y: parent.transform.position.y + ancestors.y,
    };
  };

  const oldOffset = offsetForParent(dragged.parentId);
  const newOffset = offsetForParent(newParentId);
  const moved: GameObject = {
    ...dragged,
    parentId: newParentId,
    transform: {
      ...dragged.transform,
      position: {
        x: dragged.transform.position.x + oldOffset.x - newOffset.x,
        y: dragged.transform.position.y + oldOffset.y - newOffset.y,
      },
    },
  };

  const without = all.filter((g) => g.id !== draggedId);

  let insertIndex: number;
  if (position === "inside") {
    let lastChildIndex = without.findIndex((g) => g.id === targetId);
    without.forEach((g, i) => {
      if (g.parentId === targetId) lastChildIndex = i;
    });
    insertIndex = lastChildIndex + 1;
  } else {
    const targetIndex = without.findIndex((g) => g.id === targetId);
    insertIndex = position === "before" ? targetIndex : targetIndex + 1;
  }

  return [
    ...without.slice(0, insertIndex),
    moved,
    ...without.slice(insertIndex),
  ];
}
