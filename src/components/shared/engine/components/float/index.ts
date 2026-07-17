import { defineComponent } from "@engine/componentRegistry";
import { FloatComponent, createFloatComponent } from "./floatComponent";
import { FloatView } from "./FloatView";
import { FloatInspector } from "./FloatInspector";

export const floatDefinition = defineComponent<FloatComponent>({
  type: "float",
  label: "Float",
  create: () => createFloatComponent(),
  view: FloatView,
  editor: FloatInspector,
});
