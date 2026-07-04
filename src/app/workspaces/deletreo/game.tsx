import { SpellCheck } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "@engine/RectTransform";
import { createGameObject } from "@engine/gameObject";
import { createColorComponent } from "@engine/components/color/colorComponent";
import { createImageComponent } from "@engine/components/image/imageComponent";
import { createPopComponent } from "@engine/components/pop/popComponent";
import { createShakeComponent } from "@engine/components/shake/shakeComponent";
import { createBounceComponent } from "@engine/components/bounce/bounceComponent";
import { createSlideComponent } from "@engine/components/slide/slideComponent";
import { SHARED_ASSETS } from "@/assets/shared";
import { DELETREO_ASSETS } from "./assets";
import { spellframeDefinition } from "./components/spellframe";
import { createSpellframeComponent } from "./components/spellframe/spellframeComponent";
import { controllerDefinition } from "./components/controller";
import { createControllerComponent } from "./components/controller/controllerComponent";
import { ANCHOR_ID, FRAME_ID, TEXT_ID, CONTROLLER_ID } from "./constants";
import { DeletreoBehavior } from "./DeletreoBehavior";

export const deletreoGame: GameDefinition = {
  id: "deletreo",
  title: "Deletreo",
  icon: <SpellCheck className="h-3 w-3" />,
  initialSelectedId: FRAME_ID,
  assets: {
    correct: SHARED_ASSETS.correctSound,
    incorrect: SHARED_ASSETS.incorrectSound,
    ...DELETREO_ASSETS,
  },
  components: [spellframeDefinition, controllerDefinition],
  behavior: DeletreoBehavior,
  gameObjects: () => [
    createGameObject({
      id: "background",
      name: "Background",
      transform: {
        position: { x: 0, y: 0 },
        size: { x: DESIGN_WIDTH, y: DESIGN_HEIGHT },
        pivot: { x: 0.5, y: 0.5 },
      },
      components: [createColorComponent({ value: "#01FF02" })],
    }),
    createGameObject({
      id: ANCHOR_ID,
      name: "Anchor",
      transform: {
        position: { x: 25, y: -358 },
        size: { x: 1170, y: 204 },
        pivot: { x: 0.5, y: 0.5 },
      },
    }),
    createGameObject({
      id: FRAME_ID,
      name: "MainFrame",
      parentId: ANCHOR_ID,
      transform: {
        position: { x: 0, y: 0 },
        size: { x: 1170, y: 204 },
        pivot: { x: 0.5, y: 0.5 },
      },
      components: [
        createImageComponent({ fit: "fill", assetKey: "mainFrame" }),
        createPopComponent(),
        createShakeComponent(),
        createBounceComponent(),
        createSlideComponent(),
      ],
    }),
    createGameObject({
      id: TEXT_ID,
      name: "Text",
      parentId: FRAME_ID,
      transform: {
        position: { x: 0, y: 0 },
        size: { x: 900, y: 160 },
        pivot: { x: 0.5, y: 0.5 },
      },
      components: [createSpellframeComponent()],
    }),
    createGameObject({
      id: CONTROLLER_ID,
      name: "Controller",
      transform: {
        position: { x: 0, y: 0 },
        size: { x: 0, y: 0 },
        pivot: { x: 0.5, y: 0.5 },
      },
      components: [createControllerComponent()],
    }),
  ],
};
