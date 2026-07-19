import { FlipHorizontal2 } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import { FlipComponent, createFlipComponent } from "./flipComponent";
import { FlipView } from "./FlipView";

export const flipDefinition = defineComponent<FlipComponent>({
  type: "flip",
  label: "Flip",
  create: () => createFlipComponent(),
  view: FlipView,
  schema: {
    icon: FlipHorizontal2,
    accent: "anim",
    fields: [
      { key: "hideDuration", type: "number", label: "Hide Duration" },
      { key: "showDuration", type: "number", label: "Show Duration" },
      { key: "perspective", type: "number", label: "Perspective" },
    ],
  },
});
