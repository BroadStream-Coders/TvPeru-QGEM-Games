import { ComponentRef, GameObjectComponent } from "@engine/gameObject";

export interface DeletreoGroup {
  words: string[];
}

export interface DeletreoData {
  groups: DeletreoGroup[];
}

export type DeletreoFrame = "normal" | "error";

export interface DeletreoComponent extends GameObjectComponent {
  type: "deletreo";
  groups: DeletreoGroup[];
  groupIndex: number;
  slotIndex: number;
  fileName?: string;
  image: ComponentRef | null;
  normalFrame?: string;
  errorFrame?: string;
  frame: DeletreoFrame;
}

export function createDeletreoComponent(
  init?: Partial<Omit<DeletreoComponent, "type">>,
): DeletreoComponent {
  return {
    type: "deletreo",
    groups: init?.groups ?? [],
    groupIndex: init?.groupIndex ?? 0,
    slotIndex: init?.slotIndex ?? 0,
    fileName: init?.fileName,
    image: init?.image ?? null,
    normalFrame: init?.normalFrame,
    errorFrame: init?.errorFrame,
    frame: init?.frame ?? "normal",
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
