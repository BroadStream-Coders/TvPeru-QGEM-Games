import { Palette } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import {
  ColorComponent,
  createColorComponent,
} from "@engine/components/color/colorComponent";
import { ColorView } from "@engine/components/color/ColorView";

export const colorDefinition = defineComponent<ColorComponent>({
  type: "color",
  label: "Color",
  create: () => createColorComponent(),
  view: ColorView,
  schema: {
    icon: Palette,
    fields: [{ key: "value", type: "color" }],
  },
});
