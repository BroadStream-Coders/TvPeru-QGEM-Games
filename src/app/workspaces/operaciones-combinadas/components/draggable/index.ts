import { Move } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import {
  DraggableComponent,
  createDraggableComponent,
} from "./draggableComponent";
import { DraggableView } from "./DraggableView";

export const draggableDefinition = defineComponent<DraggableComponent>({
  type: "draggable",
  label: "Draggable",
  create: () => createDraggableComponent(),
  view: DraggableView,
  schema: {
    icon: Move,
    fields: [{ key: "color", type: "color", label: "Color" }],
  },
});
