import { defineComponent } from "@engine/componentRegistry";
import { HoloComponent, createHoloComponent } from "./holoComponent";
import { HoloView } from "./HoloView";
import { HoloInspector } from "./HoloInspector";

export const holoDefinition = defineComponent<HoloComponent>({
  type: "holo",
  label: "Holo",
  create: () => createHoloComponent(),
  view: HoloView,
  editor: HoloInspector,
});
