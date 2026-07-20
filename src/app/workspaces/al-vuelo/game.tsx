import { Zap } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import type { GameObject } from "@engine/gameObject";
import { AL_VUELO_ASSETS } from "./assets";
import { controllerDefinition } from "./components/controller";
import { AlVueloBehavior } from "./AlVueloBehavior";
import { loadAlVueloSession } from "./session";
import scene from "./scene.json";

export const alVueloGame: GameDefinition = {
  id: "al-vuelo",
  title: "Al Vuelo",
  icon: <Zap className="h-3 w-3" />,
  assets: AL_VUELO_ASSETS,
  components: [controllerDefinition],
  behavior: AlVueloBehavior,
  requiresSession: true,
  onLoad: (file) => {
    loadAlVueloSession(file).catch((error) =>
      console.error("Sesión inválida para Al Vuelo.", error),
    );
  },
  gameObjects: scene as GameObject[],
};
