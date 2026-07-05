import { defineComponent } from "@engine/componentRegistry";
import { SlotComponent, createSlotComponent } from "./slotComponent";
import { SlotView } from "./SlotView";
import { SlotInspector } from "./SlotInspector";

export const slotDefinition = defineComponent<SlotComponent>({
  type: "slot",
  label: "Slot",
  create: () => createSlotComponent(),
  stripForExport: () => createSlotComponent(),
  view: SlotView,
  editor: SlotInspector,
});
