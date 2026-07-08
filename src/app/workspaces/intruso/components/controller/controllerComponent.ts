import { GameObjectComponent } from "@engine/gameObject";

export interface IntrusoRoundData {
  description: string;
  imagePath: string;
  answerIndex: number;
  choices: string[];
}

export interface IntrusoData {
  textRounds: IntrusoRoundData[];
}

export interface IntrusoRound {
  imageUrl: string;
  answerIndex: number;
  choices: string[];
}

export interface ControllerComponent extends GameObjectComponent {
  type: "controller";
  rounds: IntrusoRound[];
  roundIndex: number;
  selected: number;
  fileName?: string;
  loadedAt?: number;
}

export function createControllerComponent(
  init?: Partial<Omit<ControllerComponent, "type">>,
): ControllerComponent {
  return {
    type: "controller",
    rounds: init?.rounds ?? [],
    roundIndex: init?.roundIndex ?? 0,
    selected: init?.selected ?? -1,
    fileName: init?.fileName,
  };
}

export function isIntrusoData(data: unknown): data is IntrusoData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as IntrusoData;
  return (
    Array.isArray(d.textRounds) &&
    d.textRounds.every(
      (r) =>
        typeof r === "object" &&
        r !== null &&
        typeof r.imagePath === "string" &&
        typeof r.answerIndex === "number" &&
        Array.isArray(r.choices) &&
        r.choices.length === 4 &&
        r.choices.every((c) => typeof c === "string"),
    )
  );
}
