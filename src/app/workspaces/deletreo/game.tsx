import { SpellCheck } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import type { GameObject } from "@engine/gameObject";
import { DELETREO_ASSETS } from "./assets";
import { spellframeDefinition } from "./components/spellframe";
import { deletreoDefinition } from "./components/deletreo";
import {
  isDeletreoData,
  type DeletreoData,
} from "./components/deletreo/deletreoComponent";
import { loadJsonFile } from "@/helpers/persistence";
import { useGameSession } from "@/hooks/use-game-session";
import { FRAME_ID } from "./constants";
import { DeletreoBehavior } from "./DeletreoBehavior";
import scene from "./scene.json";

export const deletreoGame: GameDefinition = {
  id: "deletreo",
  title: "Deletreo",
  icon: <SpellCheck className="h-3 w-3" />,
  initialSelectedId: FRAME_ID,
  assets: DELETREO_ASSETS,
  components: [spellframeDefinition, deletreoDefinition],
  behavior: DeletreoBehavior,
  requiresSession: true,
  onLoad: (file) => {
    loadJsonFile<DeletreoData>(file, isDeletreoData)
      .then((data) =>
        useGameSession.getState().setSession(data, { fileName: file.name }),
      )
      .catch(() => console.error("JSON inválido para Deletreo."));
  },
  gameObjects: scene as GameObject[],
};
