import { SquareDashed } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import {
  DropZoneComponent,
  createDropZoneComponent,
} from "./dropZoneComponent";
import { DropZoneView } from "./DropZoneView";

export const dropZoneDefinition = defineComponent<DropZoneComponent>({
  type: "dropZone",
  label: "Drop Zone",
  create: () => createDropZoneComponent(),
  view: DropZoneView,
  schema: {
    icon: SquareDashed,
    fields: [
      { key: "hover", type: "boolean", label: "Hover" },
      { key: "filled", type: "boolean", label: "Filled" },
    ],
  },
});
