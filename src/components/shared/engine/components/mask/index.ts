import { defineComponent } from "@engine/componentRegistry";
import {
  MaskComponent,
  createMaskComponent,
} from "@engine/components/mask/maskComponent";
import { MaskInspector } from "@engine/components/mask/MaskInspector";

export const maskDefinition = defineComponent<MaskComponent>({
  type: "mask",
  label: "Mask",
  create: () => createMaskComponent(),
  editor: MaskInspector,
});
