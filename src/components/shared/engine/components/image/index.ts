import { defineComponent } from "@engine/componentRegistry";
import { ImageComponent, createImageComponent } from "@engine/components/image/imageComponent";
import { ImageView } from "@engine/components/image/ImageView";
import { ImageInspector } from "@engine/components/image/ImageInspector";

export const imageDefinition = defineComponent<ImageComponent>({
  type: "image",
  label: "Image",
  create: () => createImageComponent(),
  view: ImageView,
  editor: ImageInspector,
});
