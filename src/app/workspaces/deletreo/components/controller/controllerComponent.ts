import { GameObjectComponent } from "@engine/gameObject";

export interface DeletreoGroup {
  words: string[];
}

export interface DeletreoData {
  groups: DeletreoGroup[];
}

export interface ControllerComponent extends GameObjectComponent {
  type: "controller";
  groups: DeletreoGroup[];
  groupIndex: number;
  slotIndex: number;
  fileName?: string;
}

export function createControllerComponent(
  init?: Partial<Omit<ControllerComponent, "type">>,
): ControllerComponent {
  return {
    type: "controller",
    groups: init?.groups ?? [],
    groupIndex: init?.groupIndex ?? 0,
    slotIndex: init?.slotIndex ?? 0,
    fileName: init?.fileName,
  };
}

export function isDeletreoData(data: unknown): data is DeletreoData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as DeletreoData;
  return (
    Array.isArray(d.groups) &&
    d.groups.every(
      (g) =>
        typeof g === "object" &&
        g !== null &&
        Array.isArray(g.words) &&
        g.words.every((w) => typeof w === "string"),
    )
  );
}
