import { GameObjectComponent } from "@engine/gameObject";

export interface CalcSlot {
  question: string;
  answer: string;
}

export interface CalcBoard {
  slots: CalcSlot[];
}

export interface CalcGroup {
  boards: CalcBoard[];
}

export interface CalcData {
  groups: CalcGroup[];
}

export interface ControllerComponent extends GameObjectComponent {
  type: "controller";
  groups: CalcGroup[];
  groupIndex: number;
  boardIndex: number;
  cursor: number;
  fileName?: string;
}

export function createControllerComponent(
  init?: Partial<Omit<ControllerComponent, "type">>,
): ControllerComponent {
  return {
    type: "controller",
    groups: init?.groups ?? [],
    groupIndex: init?.groupIndex ?? 0,
    boardIndex: init?.boardIndex ?? 0,
    cursor: init?.cursor ?? -1,
    fileName: init?.fileName,
  };
}

export function isCalcData(data: unknown): data is CalcData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as CalcData;
  return (
    Array.isArray(d.groups) &&
    d.groups.every(
      (g) =>
        typeof g === "object" &&
        g !== null &&
        Array.isArray(g.boards) &&
        g.boards.every(
          (b) =>
            typeof b === "object" &&
            b !== null &&
            Array.isArray(b.slots) &&
            b.slots.every(
              (s) =>
                typeof s === "object" &&
                s !== null &&
                typeof s.question === "string" &&
                typeof s.answer === "string",
            ),
        ),
    )
  );
}
