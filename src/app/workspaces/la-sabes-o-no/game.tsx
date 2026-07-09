import { BookOpen } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import type { GameObject } from "@engine/gameObject";
import { LA_SABES_ASSETS } from "./assets";
import { controllerDefinition } from "./components/controller";
import { LEVEL1_ID } from "./constants";
import { LaSabesBehavior } from "./LaSabesBehavior";
import { loadLaSabesSession } from "./session";
import scene from "./scene.json";

export const laSabesGame: GameDefinition = {
  id: "la-sabes-o-no",
  title: "La Sabes o No",
  icon: <BookOpen className="h-3 w-3" />,
  initialSelectedId: LEVEL1_ID,
  assets: LA_SABES_ASSETS,
  components: [controllerDefinition],
  behavior: LaSabesBehavior,
  onLoad: (file) => {
    loadLaSabesSession(file).catch((error) =>
      console.error("Sesión inválida para La Sabes o No.", error),
    );
  },
  gameObjects: scene as GameObject[],
};
