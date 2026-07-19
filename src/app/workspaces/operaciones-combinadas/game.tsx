import { Sigma } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import { createGameObject } from "@engine/gameObject";
import { createColorComponent } from "@engine/components/color/colorComponent";
import { createTextComponent } from "@engine/components/text/textComponent";
import { buttonDefinition } from "./components/button";
import { createButtonComponent } from "./components/button/buttonComponent";
import { draggableDefinition } from "./components/draggable";
import { createDraggableComponent } from "./components/draggable/draggableComponent";
import { dropZoneDefinition } from "./components/dropZone";
import { createDropZoneComponent } from "./components/dropZone/dropZoneComponent";
import { TARGET_ID, DROP_ZONE_ID } from "./constants";

const pivot = { x: 0.5, y: 0.5 };

const BUTTONS = [
  { id: "button-red", name: "Button Red", x: -810, color: "#E53935" },
  { id: "button-green", name: "Button Green", x: -650, color: "#43A047" },
  { id: "button-blue", name: "Button Blue", x: -490, color: "#1E88E5" },
];

const gameObjects = () => [
  createGameObject({
    id: TARGET_ID,
    name: "Target",
    transform: {
      position: { x: -650, y: 260 },
      size: { x: 220, y: 220 },
      pivot,
    },
    components: [createColorComponent({ value: "#ffffff" })],
  }),
  ...BUTTONS.map((b) =>
    createGameObject({
      id: b.id,
      name: b.name,
      transform: {
        position: { x: b.x, y: 60 },
        size: { x: 140, y: 80 },
        pivot,
      },
      components: [createButtonComponent({ color: b.color })],
    }),
  ),
  createGameObject({
    id: DROP_ZONE_ID,
    name: "Drop Zone",
    transform: {
      position: { x: 620, y: 160 },
      size: { x: 260, y: 260 },
      pivot,
    },
    components: [createDropZoneComponent()],
  }),
  createGameObject({
    id: "chip",
    name: "Chip",
    transform: {
      position: { x: 180, y: 160 },
      size: { x: 150, y: 150 },
      pivot,
    },
    components: [createDraggableComponent()],
  }),
  createGameObject({
    id: "selection-text",
    name: "Selection Text",
    transform: {
      position: { x: 0, y: -420 },
      size: { x: 1400, y: 120 },
      pivot,
    },
    components: [
      createTextComponent({
        text: "Texto de prueba: intenta seleccionarme o arrastrarme",
        fontSize: 5,
      }),
    ],
  }),
];

export const operacionesCombinadasGame: GameDefinition = {
  id: "operaciones-combinadas",
  title: "Operaciones Combinadas",
  icon: <Sigma className="h-3 w-3" />,
  components: [buttonDefinition, draggableDefinition, dropZoneDefinition],
  gameObjects,
  initialSelectedId: TARGET_ID,
};
