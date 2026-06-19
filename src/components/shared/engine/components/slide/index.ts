import { defineComponent } from "@engine/componentRegistry";
import { SlideComponent, createSlideComponent } from "./slideComponent";
import { SlideView } from "./SlideView";
import { SlideInspector } from "./SlideInspector";

export const slideDefinition = defineComponent<SlideComponent>({
  type: "slide",
  label: "Slide",
  create: () => createSlideComponent(),
  view: SlideView,
  editor: SlideInspector,
});
