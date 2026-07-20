import { Calculator } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import type { GameObject } from "@engine/gameObject";
import { CALCULO_ASSETS } from "./assets";
import { slotDefinition } from "./components/slot";
import { controllerDefinition } from "./components/controller";
import {
  isCalcData,
  type CalcData,
} from "./components/controller/controllerComponent";
import { loadJsonFile } from "@/helpers/persistence";
import { useGameSession } from "@/hooks/use-game-session";
import { CalculoMentalBehavior } from "./CalculoMentalBehavior";
import scene from "./scene.json";

export const calculoMentalGame: GameDefinition = {
  id: "calculo-mental",
  title: "Cálculo Mental",
  icon: <Calculator className="h-3 w-3" />,
  assets: CALCULO_ASSETS,
  components: [slotDefinition, controllerDefinition],
  behavior: CalculoMentalBehavior,
  requiresSession: true,
  onLoad: (file) => {
    loadJsonFile<CalcData>(file, isCalcData)
      .then((data) =>
        useGameSession.getState().setSession(data, { fileName: file.name }),
      )
      .catch(() => console.error("JSON inválido para Cálculo Mental."));
  },
  gameObjects: scene as GameObject[],
};
