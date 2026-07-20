import { Search } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import type { GameObject } from "@engine/gameObject";
import { BUSCA_LOGO_ASSETS } from "./assets";
import { BuscaLogoBehavior } from "./BuscaLogoBehavior";
import { cardDefinition } from "./components/card";
import { controllerDefinition } from "./components/controller";
import { LEVEL2_ID } from "./constants";
import { loadBuscaLogoSession } from "./session";
import scene from "./scene.json";

export const buscaLogoGame: GameDefinition = {
  id: "busca-logo",
  title: "Busca Logo",
  icon: <Search className="h-3 w-3" />,
  initialSelectedId: LEVEL2_ID,
  assets: BUSCA_LOGO_ASSETS,
  components: [controllerDefinition, cardDefinition],
  behavior: BuscaLogoBehavior,
  requiresSession: true,
  onLoad: (file) => {
    loadBuscaLogoSession(file).catch((error) =>
      console.error("Sesión inválida para Busca Logo.", error),
    );
  },
  gameObjects: scene as GameObject[],
};
