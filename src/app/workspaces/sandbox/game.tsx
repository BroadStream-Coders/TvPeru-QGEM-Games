import { FlaskConical } from "lucide-react";
import type { GameDefinition } from "@engine/editor/GameDefinition";

export const sandboxGame: GameDefinition = {
  id: "sandbox",
  title: "Sandbox",
  icon: <FlaskConical className="h-3 w-3" />,
};
