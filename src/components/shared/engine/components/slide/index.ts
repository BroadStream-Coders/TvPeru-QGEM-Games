import { MoveDown } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import { SlideComponent, createSlideComponent } from "./slideComponent";
import { SlideView } from "./SlideView";

export const slideDefinition = defineComponent<SlideComponent>({
  type: "slide",
  label: "Slide",
  create: () => createSlideComponent(),
  view: SlideView,
  schema: {
    icon: MoveDown,
    accent: "anim",
    fields: [
      { key: "speed", type: "number", label: "Speed" },
      { key: "hiddenOffset", type: "vec2", label: "Hide" },
    ],
  },
});
