import { Scissors } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import {
  MaskComponent,
  createMaskComponent,
} from "@engine/components/mask/maskComponent";

export const maskDefinition = defineComponent<MaskComponent>({
  type: "mask",
  label: "Mask",
  create: () => createMaskComponent(),
  schema: {
    icon: Scissors,
    fields: [{ key: "showImage", type: "boolean", label: "Show image" }],
  },
});
