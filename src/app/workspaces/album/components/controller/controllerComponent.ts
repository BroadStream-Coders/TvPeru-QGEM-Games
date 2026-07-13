import { GameObjectComponent } from "@engine/gameObject";
import { THEME_COUNT } from "../../constants";

export interface AlbumSessionCard {
  isCroma?: boolean;
  question: string;
  imagePath: string;
}

export interface AlbumSessionRound {
  title: string;
  cards: AlbumSessionCard[];
}

export interface AlbumSessionData {
  rounds: AlbumSessionRound[];
}

export interface AlbumCard {
  isCroma: boolean;
  question: string;
  imageUrl: string;
}

export interface AlbumRound {
  title: string;
  cards: AlbumCard[];
}

export type AlbumView = "themes" | "cards";

export interface ControllerComponent extends GameObjectComponent {
  type: "controller";
  roundIndex: number;
  cardIndex: number;
  view: AlbumView;
  locked: boolean[];
  fileName?: string;
  loadedAt?: number;
}

export function createControllerComponent(
  init?: Partial<Omit<ControllerComponent, "type">>,
): ControllerComponent {
  return {
    type: "controller",
    roundIndex: init?.roundIndex ?? 0,
    cardIndex: init?.cardIndex ?? 0,
    view: init?.view ?? "themes",
    locked: init?.locked ?? Array.from({ length: THEME_COUNT }, () => false),
    fileName: init?.fileName,
  };
}

export function isAlbumData(data: unknown): data is AlbumSessionData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as AlbumSessionData;
  return (
    Array.isArray(d.rounds) &&
    d.rounds.every(
      (r) =>
        typeof r === "object" &&
        r !== null &&
        typeof r.title === "string" &&
        Array.isArray(r.cards) &&
        r.cards.every(
          (c) =>
            typeof c === "object" &&
            c !== null &&
            typeof c.question === "string" &&
            typeof c.imagePath === "string" &&
            (c.isCroma === undefined || typeof c.isCroma === "boolean"),
        ),
    )
  );
}
