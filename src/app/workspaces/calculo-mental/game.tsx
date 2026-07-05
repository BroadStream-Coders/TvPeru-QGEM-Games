import { Calculator } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import type { GameObject } from "@engine/gameObject";
import { SHARED_ASSETS } from "@/assets/shared";
import { CALCULO_ASSETS } from "./assets";
import { slotDefinition } from "./components/slot";
import { controllerDefinition } from "./components/controller";
import {
  isCalcData,
  type CalcData,
} from "./components/controller/controllerComponent";
import { loadJsonFile } from "@/helpers/persistence";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { CONTROLLER_ID, SLOT_IDS } from "./constants";
import { CalculoMentalBehavior } from "./CalculoMentalBehavior";
import scene from "./scene.json";

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
  onLoad: (file) => {
    loadJsonFile<CalcData>(file, isCalcData)
      .then((data) =>
        useSceneRuntime.getState().patchComponent(CONTROLLER_ID, "controller", {
          groups: data.groups,
          groupIndex: 0,
          boardIndex: 0,
          cursor: -1,
          fileName: file.name,
        }),
      )
      .catch(() => console.error("JSON inválido para Cálculo Mental."));
  },
  gameObjects: scene as GameObject[],
};
