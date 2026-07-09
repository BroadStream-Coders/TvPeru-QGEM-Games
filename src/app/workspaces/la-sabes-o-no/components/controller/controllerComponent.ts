import { GameObjectComponent } from "@engine/gameObject";

export interface LaSabesQuestion {
  question: string;
  options: string[];
  correctIndex: number;
}

export interface LaSabesGroup {
  title: string;
  questions: LaSabesQuestion[];
}

export interface LaSabesData {
  groups: LaSabesGroup[];
}

export interface ControllerComponent extends GameObjectComponent {
  type: "controller";
  groups: LaSabesGroup[];
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

export function isLaSabesData(data: unknown): data is LaSabesData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as LaSabesData;
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
            typeof q.correctIndex === "number" &&
            Array.isArray(q.options) &&
            q.options.length === 2 &&
            q.options.every((o) => typeof o === "string"),
        ),
    )
  );
}
