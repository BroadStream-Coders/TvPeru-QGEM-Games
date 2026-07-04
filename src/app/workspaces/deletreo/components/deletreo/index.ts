import { defineComponent } from "@engine/componentRegistry";
import {
  DeletreoComponent,
  createDeletreoComponent,
} from "./deletreoComponent";
import { DeletreoView } from "./DeletreoView";
import { DeletreoInspector } from "./DeletreoInspector";

export const deletreoDefinition = defineComponent<DeletreoComponent>({
  type: "deletreo",
  label: "Deletreo",
  create: () => createDeletreoComponent(),
  stripForExport: (c) =>
    createDeletreoComponent({
      image: c.image ?? undefined,
      normalFrame: c.normalFrame,
      errorFrame: c.errorFrame,
    }),
  view: DeletreoView,
  editor: DeletreoInspector,
});
