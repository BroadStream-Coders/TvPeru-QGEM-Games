import { defineComponent } from "@engine/componentRegistry";
import { BounceComponent, createBounceComponent } from "./bounceComponent";
import { BounceView } from "./BounceView";
import { BounceInspector } from "./BounceInspector";

export const bounceDefinition = defineComponent<BounceComponent>({
  type: "bounce",
  label: "Bounce",
  create: () => createBounceComponent(),
  view: BounceView,
  editor: BounceInspector,
});
