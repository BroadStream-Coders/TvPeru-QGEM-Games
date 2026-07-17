import { defineComponent } from "@engine/componentRegistry";
import { ShimmerComponent, createShimmerComponent } from "./shimmerComponent";
import { ShimmerView } from "./ShimmerView";
import { ShimmerInspector } from "./ShimmerInspector";

export const shimmerDefinition = defineComponent<ShimmerComponent>({
  type: "shimmer",
  label: "Shimmer",
  create: () => createShimmerComponent(),
  view: ShimmerView,
  editor: ShimmerInspector,
});
