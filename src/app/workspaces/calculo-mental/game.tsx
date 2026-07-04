import { Calculator } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import {
  RectTransformValues,
  Vec2,
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
} from "@engine/RectTransform";
import { createGameObject } from "@engine/gameObject";
import { createColorComponent } from "@engine/components/color/colorComponent";
import { createPopComponent } from "@engine/components/pop/popComponent";
import { createShakeComponent } from "@engine/components/shake/shakeComponent";
import { createBounceComponent } from "@engine/components/bounce/bounceComponent";
import { createSlideComponent } from "@engine/components/slide/slideComponent";
import { createTextComponent } from "@engine/components/text/textComponent";
import { SHARED_ASSETS } from "@/assets/shared";
import { CALCULO_ASSETS } from "./assets";
import { slotDefinition } from "./components/slot";
import { createSlotComponent } from "./components/slot/slotComponent";
import { controllerDefinition } from "./components/controller";
import {
  createControllerComponent,
  isCalcData,
  type CalcData,
} from "./components/controller/controllerComponent";
import { loadJsonFile } from "@/helpers/persistence";
import {
  BACKGROUND_ID,
  CONTROLLER_ID,
  SLOT_IDS,
  QUESTION_IDS,
  ANSWER_IDS,
} from "./constants";
import { CalculoMentalBehavior } from "./CalculoMentalBehavior";

const SLOT_POSITIONS: Vec2[] = [
  { x: -675, y: -400 },
  { x: -280, y: -400 },
  { x: 115, y: -400 },
  { x: 510, y: -400 },
];

const QUESTION_TRANSFORM: RectTransformValues = {
  position: { x: -8, y: 30 },
  size: { x: 346, y: 124 },
  pivot: { x: 0.5, y: 0.5 },
};
const ANSWER_TRANSFORM: RectTransformValues = {
  position: { x: 69, y: -45 },
  size: { x: 230, y: 87 },
  pivot: { x: 0.5, y: 0.5 },
};

const createSlotTextComponent = () =>
  createTextComponent({
    text: "",
    autoSize: true,
    fontSizeMin: 1,
    fontSizeMax: 6,
    color: "#ffffff",
    fontFamily: "var(--font-poppins-semibold)",
  });

export const calculoMentalGame: GameDefinition = {
  id: "calculo-mental",
  title: "Cálculo Mental",
  icon: <Calculator className="h-3 w-3" />,
  initialSelectedId: SLOT_IDS[0],
  assets: {
    correct: SHARED_ASSETS.correctSound,
    incorrect: SHARED_ASSETS.incorrectSound,
    ...CALCULO_ASSETS,
  },
  components: [slotDefinition, controllerDefinition],
  behavior: CalculoMentalBehavior,
  onLoad: (file, editor) => {
    loadJsonFile<CalcData>(file, isCalcData)
      .then((data) =>
        editor.setGameObjects((prev) =>
          prev.map((go) =>
            go.id === CONTROLLER_ID
              ? {
                  ...go,
                  components: go.components.map((c) =>
                    c.type === "controller"
                      ? {
                          ...c,
                          groups: data.groups,
                          groupIndex: 0,
                          boardIndex: 0,
                          cursor: -1,
                          fileName: file.name,
                        }
                      : c,
                  ),
                }
              : go,
          ),
        ),
      )
      .catch(() => console.error("JSON inválido para Cálculo Mental."));
  },
  gameObjects: () => [
    createGameObject({
      id: BACKGROUND_ID,
      name: "Background",
      transform: {
        position: { x: 0, y: 0 },
        size: { x: DESIGN_WIDTH, y: DESIGN_HEIGHT },
        pivot: { x: 0.5, y: 0.5 },
      },
      components: [createColorComponent({ value: "#01FF02" })],
    }),
    createGameObject({
      id: CONTROLLER_ID,
      name: "Controller",
      transform: {
        position: { x: 0, y: 0 },
        size: { x: DESIGN_WIDTH, y: DESIGN_HEIGHT },
        pivot: { x: 0.5, y: 0.5 },
      },
      components: [createControllerComponent()],
    }),
    ...SLOT_IDS.flatMap((id, i) => [
      createGameObject({
        id,
        name: `Slot ${i + 1}`,
        parentId: CONTROLLER_ID,
        transform: {
          position: SLOT_POSITIONS[i],
          size: { x: 400, y: 200 },
          pivot: { x: 0.5, y: 0.5 },
        },
        components: [
          createSlotComponent(),
          createPopComponent(),
          createShakeComponent(),
          createBounceComponent(),
          createSlideComponent(),
        ],
      }),
      createGameObject({
        id: QUESTION_IDS[i],
        name: "Pregunta",
        parentId: id,
        active: false,
        transform: QUESTION_TRANSFORM,
        components: [createSlotTextComponent()],
      }),
      createGameObject({
        id: ANSWER_IDS[i],
        name: "Respuesta",
        parentId: id,
        active: false,
        transform: ANSWER_TRANSFORM,
        components: [createSlotTextComponent()],
      }),
    ]),
  ],
};
