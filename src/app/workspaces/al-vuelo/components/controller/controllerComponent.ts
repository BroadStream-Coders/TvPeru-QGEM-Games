import { GameObjectComponent } from "@engine/gameObject";

export interface AlVueloQuestion {
  question: string;
  answer: boolean;
}

export interface AlVueloGroup {
  title: string;
  questions: AlVueloQuestion[];
}

export interface AlVueloData {
  groups: AlVueloGroup[];
}

export interface ControllerComponent extends GameObjectComponent {
  type: "controller";
  groups: AlVueloGroup[];
  groupIndex: number;
  questionIndex: number;
  selected: number;
  fileName?: string;
  loadedAt?: number;
}

export function createControllerComponent(
  init?: Partial<Omit<ControllerComponent, "type">>,
): ControllerComponent {
  return {
    type: "controller",
    groups: init?.groups ?? [],
    groupIndex: init?.groupIndex ?? 0,
    questionIndex: init?.questionIndex ?? 0,
    selected: init?.selected ?? -1,
    fileName: init?.fileName,
  };
}

export function isAlVueloData(data: unknown): data is AlVueloData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as AlVueloData;
  return (
    Array.isArray(d.groups) &&
    d.groups.every(
      (g) =>
        typeof g === "object" &&
        g !== null &&
        typeof g.title === "string" &&
        Array.isArray(g.questions) &&
        g.questions.every(
          (q) =>
            typeof q === "object" &&
            q !== null &&
            typeof q.question === "string" &&
            typeof q.answer === "boolean",
        ),
    )
  );
}
