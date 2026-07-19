import { Gem } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import { HoloComponent, createHoloComponent } from "./holoComponent";
import { HoloView } from "./HoloView";

export const holoDefinition = defineComponent<HoloComponent>({
  type: "holo",
  label: "Holo",
  create: () => createHoloComponent(),
  view: HoloView,
  schema: {
    icon: Gem,
    accent: "anim",
    fields: [
      { key: "enabled", type: "boolean", label: "Enabled" },
      { key: "period", type: "number", label: "Period" },
      { key: "intensity", type: "number", label: "Intensity" },
      { key: "glow", type: "number", label: "Glow" },
      { key: "radius", type: "number", label: "Radius" },
    ],
  },
});
