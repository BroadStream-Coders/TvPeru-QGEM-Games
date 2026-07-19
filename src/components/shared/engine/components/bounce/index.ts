import { MoveUp } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import { BounceComponent, createBounceComponent } from "./bounceComponent";
import { BounceView } from "./BounceView";

export const bounceDefinition = defineComponent<BounceComponent>({
  type: "bounce",
  label: "Bounce",
  create: () => createBounceComponent(),
  view: BounceView,
  schema: {
    icon: MoveUp,
    accent: "anim",
    fields: [
      { key: "travelSpeed", type: "number", label: "Speed" },
      { key: "bounceAmplitude", type: "number", label: "Amplitude" },
      { key: "bounceDuration", type: "number", label: "Duration" },
    ],
  },
});
