import { GameObjectComponent } from "@engine/gameObject";

export interface BoardData {
  size: string;
  logoPositions: number[];
}

export interface BuscaLogoData {
  boards: BoardData[];
}

export interface ControllerComponent extends GameObjectComponent {
  type: "controller";
  boardIndex: number;
  selected: number;
  locked: boolean[];
  fileName?: string;
  loadedAt?: number;
}

export function createControllerComponent(
  init?: Partial<Omit<ControllerComponent, "type">>,
): ControllerComponent {
  return {
    type: "controller",
    boardIndex: init?.boardIndex ?? 0,
    selected: init?.selected ?? -1,
    locked: init?.locked ?? [],
    fileName: init?.fileName,
  };
}

export function isBuscaLogoData(data: unknown): data is BuscaLogoData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as BuscaLogoData;
  return (
    Array.isArray(d.boards) &&
    d.boards.every(
      (b) =>
        typeof b === "object" &&
        b !== null &&
        typeof b.size === "string" &&
        Array.isArray(b.logoPositions) &&
        b.logoPositions.every((p) => typeof p === "number"),
    )
  );
}
