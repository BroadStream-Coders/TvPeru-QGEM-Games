import { BookHeart } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import type { GameObject } from "@engine/gameObject";
import { MI_LIBRO_FAVORITO_ASSETS } from "./assets";
import { controllerDefinition } from "./components/controller";
import { LEVEL_ID } from "./constants";
import { MiLibroFavoritoBehavior } from "./MiLibroFavoritoBehavior";
import { loadMiLibroSession } from "./session";
import scene from "./scene.json";

export const miLibroFavoritoGame: GameDefinition = {
  id: "mi-libro-favorito",
  title: "Mi Libro Favorito",
  icon: <BookHeart className="h-3 w-3" />,
  initialSelectedId: LEVEL_ID,
  assets: MI_LIBRO_FAVORITO_ASSETS,
  components: [controllerDefinition],
  behavior: MiLibroFavoritoBehavior,
  requiresSession: true,
  onLoad: (file) => {
    loadMiLibroSession(file).catch((error) =>
      console.error("Sesión inválida para Mi Libro Favorito.", error),
    );
  },
  gameObjects: scene as GameObject[],
};
