import { SpellCheck } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import type { GameObject } from "@engine/gameObject";
import { SHARED_ASSETS } from "@/assets/shared";
import { DELETREO_ASSETS } from "./assets";
import { spellframeDefinition } from "./components/spellframe";
import { deletreoDefinition } from "./components/deletreo";
import {
  isDeletreoData,
  type DeletreoData,
} from "./components/deletreo/deletreoComponent";
import { loadJsonFile } from "@/helpers/persistence";
import { ANCHOR_ID, FRAME_ID } from "./constants";
import { DeletreoBehavior } from "./DeletreoBehavior";
import scene from "./scene.json";

export const deletreoGame: GameDefinition = {
  id: "deletreo",
  title: "Deletreo",
  icon: <SpellCheck className="h-3 w-3" />,
  initialSelectedId: FRAME_ID,
  assets: {
    correct: SHARED_ASSETS.correctSound,
    incorrect: SHARED_ASSETS.incorrectSound,
    ...DELETREO_ASSETS,
  },
  components: [spellframeDefinition, deletreoDefinition],
  behavior: DeletreoBehavior,
  onLoad: (file, editor) => {
    loadJsonFile<DeletreoData>(file, isDeletreoData)
      .then((data) =>
        editor.setGameObjects((prev) =>
          prev.map((go) =>
            go.id === ANCHOR_ID
              ? {
                  ...go,
                  components: go.components.map((c) =>
                    c.type === "deletreo"
                      ? {
                          ...c,
                          groups: data.groups,
                          groupIndex: 0,
                          slotIndex: 0,
                          fileName: file.name,
                        }
                      : c,
                  ),
                }
              : go,
          ),
        ),
      )
      .catch(() => console.error("JSON inválido para Deletreo."));
  },
  gameObjects: scene as GameObject[],
};
