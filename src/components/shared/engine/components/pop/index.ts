import { Maximize2 } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import { PopComponent, createPopComponent } from "./popComponent";
import { PopView } from "./PopView";

export const popDefinition = defineComponent<PopComponent>({
  type: "pop",
  label: "Pop",
  create: () => createPopComponent(),
  view: PopView,
  schema: {
    icon: Maximize2,
    accent: "anim",
    fields: [
      { key: "scale", type: "number", label: "Scale" },
      { key: "duration", type: "number", label: "Duration" },
    ],
  },
});
