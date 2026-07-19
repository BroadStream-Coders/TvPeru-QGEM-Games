import { MousePointerClick } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import {
  ButtonComponent,
  createButtonComponent,
} from "./buttonComponent";
import { ButtonView } from "./ButtonView";

export const buttonDefinition = defineComponent<ButtonComponent>({
  type: "button",
  label: "Button",
  create: () => createButtonComponent(),
  view: ButtonView,
  schema: {
    icon: MousePointerClick,
    fields: [{ key: "color", type: "color", label: "Color" }],
  },
});
