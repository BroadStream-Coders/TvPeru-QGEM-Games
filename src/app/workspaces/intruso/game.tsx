import { UserX } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import type { GameObject } from "@engine/gameObject";
import { INTRUSO_ASSETS } from "./assets";
import { BACKGROUND_ID } from "./constants";
import scene from "./scene.json";

export const intrusoGame: GameDefinition = {
  id: "intruso",
  title: "Intruso",
  icon: <UserX className="h-3 w-3" />,
  initialSelectedId: BACKGROUND_ID,
  assets: INTRUSO_ASSETS,
  gameObjects: scene as GameObject[],
};
