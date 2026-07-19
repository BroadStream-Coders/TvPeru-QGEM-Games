import { Vibrate } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import { ShakeComponent, createShakeComponent } from "./shakeComponent";
import { ShakeView } from "./ShakeView";

export const shakeDefinition = defineComponent<ShakeComponent>({
  type: "shake",
  label: "Shake",
  create: () => createShakeComponent(),
  view: ShakeView,
  schema: {
    icon: Vibrate,
    accent: "anim",
    fields: [
      { key: "amplitude", type: "number", label: "Amplitude" },
      { key: "shakes", type: "number", label: "Shakes" },
      { key: "duration", type: "number", label: "Duration" },
    ],
  },
});
