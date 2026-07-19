import { Waves } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import { FloatComponent, createFloatComponent } from "./floatComponent";
import { FloatView } from "./FloatView";

export const floatDefinition = defineComponent<FloatComponent>({
  type: "float",
  label: "Float",
  create: () => createFloatComponent(),
  view: FloatView,
  schema: {
    icon: Waves,
    accent: "anim",
    fields: [
      { key: "amplitude", type: "number", label: "Amplitude" },
      { key: "rotation", type: "number", label: "Rotation" },
      { key: "period", type: "number", label: "Period" },
      { key: "phase", type: "number", label: "Phase" },
    ],
  },
});
