import { VenetianMask } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import type { GameObject } from "@engine/gameObject";
import { INTRUSO_ASSETS } from "./assets";
import { controllerDefinition } from "./components/controller";
import { LEVEL1_ID } from "./constants";
import { IntrusoBehavior } from "./IntrusoBehavior";
import { loadIntrusoSession } from "./session";
import scene from "./scene.json";

export const intrusoGame: GameDefinition = {
  id: "intruso",
  title: "Intruso",
  icon: <VenetianMask className="h-3 w-3" />,
  initialSelectedId: LEVEL1_ID,
  assets: INTRUSO_ASSETS,
  components: [controllerDefinition],
  behavior: IntrusoBehavior,
  onLoad: (file) => {
    loadIntrusoSession(file).catch((error) =>
      console.error("Sesión inválida para Intruso.", error),
    );
  },
  gameObjects: scene as GameObject[],
};
