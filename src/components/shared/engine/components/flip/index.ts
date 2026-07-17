import { defineComponent } from "@engine/componentRegistry";
import { FlipComponent, createFlipComponent } from "./flipComponent";
import { FlipView } from "./FlipView";
import { FlipInspector } from "./FlipInspector";

export const flipDefinition = defineComponent<FlipComponent>({
  type: "flip",
  label: "Flip",
  create: () => createFlipComponent(),
  view: FlipView,
  editor: FlipInspector,
});
