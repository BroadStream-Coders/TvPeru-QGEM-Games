import { Zap } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import { BlinkComponent, createBlinkComponent } from "./blinkComponent";
import { BlinkView } from "./BlinkView";

export const blinkDefinition = defineComponent<BlinkComponent>({
  type: "blink",
  label: "Blink",
  create: () => createBlinkComponent(),
  view: BlinkView,
  schema: {
    icon: Zap,
    accent: "anim",
    fields: [
      { key: "pulseScale", type: "number", label: "Pulse scale" },
      { key: "pulseDuration", type: "number", label: "Pulse duration" },
      { key: "blinkCount", type: "number", label: "Blinks" },
      { key: "blinkDuration", type: "number", label: "Blink duration" },
    ],
  },
});
