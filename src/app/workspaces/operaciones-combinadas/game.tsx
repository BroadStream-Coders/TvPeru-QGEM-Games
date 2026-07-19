import { Sigma } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import { createGameObject } from "@engine/gameObject";
import { createColorComponent } from "@engine/components/color/colorComponent";
import { buttonDefinition } from "./components/button";
import { createButtonComponent } from "./components/button/buttonComponent";
import { TARGET_ID } from "./constants";

const pivot = { x: 0.5, y: 0.5 };

const BUTTONS = [
  { id: "button-red", name: "Button Red", x: -420, color: "#E53935" },
  { id: "button-green", name: "Button Green", x: 0, color: "#43A047" },
  { id: "button-blue", name: "Button Blue", x: 420, color: "#1E88E5" },
];

const gameObjects = () => [
  createGameObject({
    id: TARGET_ID,
    name: "Target",
    transform: {
      position: { x: 0, y: 120 },
      size: { x: 380, y: 380 },
      pivot,
    },
    components: [createColorComponent({ value: "#ffffff" })],
  }),
  ...BUTTONS.map((b) =>
    createGameObject({
      id: b.id,
      name: b.name,
      transform: {
        position: { x: b.x, y: -330 },
        size: { x: 300, y: 140 },
        pivot,
      },
      components: [createButtonComponent({ color: b.color })],
    }),
  ),
];

export const operacionesCombinadasGame: GameDefinition = {
  id: "operaciones-combinadas",
  title: "Operaciones Combinadas",
  icon: <Sigma className="h-3 w-3" />,
  components: [buttonDefinition],
  gameObjects,
  initialSelectedId: TARGET_ID,
};
