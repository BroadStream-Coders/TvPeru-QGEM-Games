import { defineComponent } from "@engine/componentRegistry";
import {
  ControllerComponent,
  createControllerComponent,
} from "./controllerComponent";
import { ControllerView } from "./ControllerView";
import { ControllerInspector } from "./ControllerInspector";

export const controllerDefinition = defineComponent<ControllerComponent>({
  type: "controller",
  label: "Controller",
  create: () => createControllerComponent(),
  view: ControllerView,
  editor: ControllerInspector,
});
