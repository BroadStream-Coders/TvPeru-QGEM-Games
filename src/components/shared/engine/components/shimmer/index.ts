import { Sparkles } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import { ShimmerComponent, createShimmerComponent } from "./shimmerComponent";
import { ShimmerView } from "./ShimmerView";

export const shimmerDefinition = defineComponent<ShimmerComponent>({
  type: "shimmer",
  label: "Shimmer",
  create: () => createShimmerComponent(),
  view: ShimmerView,
  schema: {
    icon: Sparkles,
    accent: "anim",
    fields: [
      { key: "period", type: "number", label: "Period" },
      { key: "sweep", type: "number", label: "Sweep" },
      { key: "phase", type: "number", label: "Phase" },
      { key: "intensity", type: "number", label: "Intensity" },
      { key: "radius", type: "number", label: "Radius" },
    ],
  },
});
