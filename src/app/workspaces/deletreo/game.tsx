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
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { ANCHOR_ID, FRAME_ID } from "./constants";
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
  onLoad: (file) => {
    loadJsonFile<DeletreoData>(file, isDeletreoData)
      .then((data) =>
        useSceneRuntime.getState().patchComponent(ANCHOR_ID, "deletreo", {
          groups: data.groups,
          groupIndex: 0,
          slotIndex: 0,
          fileName: file.name,
        }),
      )
      .catch(() => console.error("JSON inválido para Deletreo."));
  },
  gameObjects: scene as GameObject[],
};
