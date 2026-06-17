import { defineComponent } from "@engine/componentRegistry";
import { BorderComponent, createBorderComponent } from "./borderComponent";
import { BorderView } from "./BorderView";
import { BorderInspector } from "./BorderInspector";

export const borderDefinition = defineComponent<BorderComponent>({
  type: "border",
  label: "Border",
  create: () => createBorderComponent(),
  view: BorderView,
  editor: BorderInspector,
});
