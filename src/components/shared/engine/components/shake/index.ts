import { defineComponent } from "@engine/componentRegistry";
import { ShakeComponent, createShakeComponent } from "./shakeComponent";
import { ShakeView } from "./ShakeView";
import { ShakeInspector } from "./ShakeInspector";

export const shakeDefinition = defineComponent<ShakeComponent>({
  type: "shake",
  label: "Shake",
  create: () => createShakeComponent(),
  view: ShakeView,
  editor: ShakeInspector,
});
