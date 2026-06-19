import { defineComponent } from "@engine/componentRegistry";
import { PopComponent, createPopComponent } from "./popComponent";
import { PopView } from "./PopView";
import { PopInspector } from "./PopInspector";

export const popDefinition = defineComponent<PopComponent>({
  type: "pop",
  label: "Pop",
  create: () => createPopComponent(),
  view: PopView,
  editor: PopInspector,
});
