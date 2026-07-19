import { GameObjectComponent } from "@engine/gameObject";

export interface MiLibroPlayer {
  playerName: string;
  maxHealth: number;
}

export interface MiLibroSlot {
  question: string;
  answer: string;
}

export interface MiLibroGroup {
  slots: MiLibroSlot[];
}

export interface MiLibroData {
  players: MiLibroPlayer[];
  groups: MiLibroGroup[];
}

export interface ControllerComponent extends GameObjectComponent {
  type: "controller";
  players: MiLibroPlayer[];
  groups: MiLibroGroup[];
  groupIndex: number;
  slotIndex: number;
  selectedPlayer: number;
  lives: number[];
  fileName?: string;
}

export function createControllerComponent(
  init?: Partial<Omit<ControllerComponent, "type">>,
): ControllerComponent {
  return {
    type: "controller",
    players: init?.players ?? [],
    groups: init?.groups ?? [],
    groupIndex: init?.groupIndex ?? 0,
    slotIndex: init?.slotIndex ?? 0,
    selectedPlayer: init?.selectedPlayer ?? 0,
    lives: init?.lives ?? [],
    fileName: init?.fileName,
  };
}

export function isMiLibroData(data: unknown): data is MiLibroData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as MiLibroData;
  return (
    Array.isArray(d.players) &&
    d.players.length >= 2 &&
    d.players.every(
      (p) =>
        typeof p === "object" &&
        p !== null &&
        typeof p.playerName === "string" &&
        typeof p.maxHealth === "number",
    ) &&
    Array.isArray(d.groups) &&
    d.groups.every(
      (g) =>
        typeof g === "object" &&
        g !== null &&
        Array.isArray(g.slots) &&
        g.slots.every(
          (s) =>
            typeof s === "object" &&
            s !== null &&
            typeof s.question === "string" &&
            typeof s.answer === "string",
        ),
    )
  );
}
