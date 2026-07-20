import { Images } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import type { GameObject } from "@engine/gameObject";
import { ALBUM_ASSETS } from "./assets";
import { controllerDefinition } from "./components/controller";
import { AlbumBehavior } from "./AlbumBehavior";
import { loadAlbumSession } from "./session";
import scene from "./scene.json";

export const albumGame: GameDefinition = {
  id: "album",
  title: "Álbum",
  icon: <Images className="h-3 w-3" />,
  assets: ALBUM_ASSETS,
  components: [controllerDefinition],
  behavior: AlbumBehavior,
  requiresSession: true,
  onLoad: (file) => {
    loadAlbumSession(file).catch((error) =>
      console.error("Sesión inválida para Álbum.", error),
    );
  },
  gameObjects: scene as GameObject[],
};
