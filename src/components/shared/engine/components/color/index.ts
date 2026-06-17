import { defineComponent } from "@engine/componentRegistry";
import { ColorComponent, createColorComponent } from "@engine/components/color/colorComponent";
import { ColorView } from "@engine/components/color/ColorView";
import { ColorInspector } from "@engine/components/color/ColorInspector";

export const colorDefinition = defineComponent<ColorComponent>({
  type: "color",
  label: "Color",
  create: () => createColorComponent(),
  view: ColorView,
  editor: ColorInspector,
});
