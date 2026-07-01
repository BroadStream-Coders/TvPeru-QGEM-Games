import { UserX } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "@engine/RectTransform";
import { createGameObject } from "@engine/gameObject";
import { createVideoComponent } from "@engine/components/video/videoComponent";
import { SHARED_ASSETS } from "@/assets/shared";
import { INTRUSO_ASSETS } from "./assets";
import { BACKGROUND_ID } from "./constants";
import { IntrusoBehavior } from "./IntrusoBehavior";

export const intrusoGame: GameDefinition = {
  id: "intruso",
  title: "Intruso",
  icon: <UserX className="h-3 w-3" />,
  initialSelectedId: BACKGROUND_ID,
  assets: {
    correct: SHARED_ASSETS.correctSound,
    incorrect: SHARED_ASSETS.incorrectSound,
    ...INTRUSO_ASSETS,
  },
  behavior: IntrusoBehavior,
  gameObjects: () => [
    createGameObject({
      id: BACKGROUND_ID,
      name: "Background",
      transform: {
        position: { x: 0, y: 0 },
        size: { x: DESIGN_WIDTH, y: DESIGN_HEIGHT },
        pivot: { x: 0.5, y: 0.5 },
      },
      components: [createVideoComponent({ fit: "cover" })],
    }),
  ],
};
