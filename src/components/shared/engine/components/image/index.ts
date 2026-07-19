import { Image } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import {
  ImageComponent,
  createImageComponent,
} from "@engine/components/image/imageComponent";
import { ImageView } from "@engine/components/image/ImageView";

export const imageDefinition = defineComponent<ImageComponent>({
  type: "image",
  label: "Image",
  create: () => createImageComponent(),
  view: ImageView,
  schema: {
    icon: Image,
    accent: "image",
    fields: [
      {
        key: "assetKey",
        type: "assetKey",
        label: "Asset",
        kind: "image",
        resize: true,
      },
      {
        key: "fit",
        type: "enum",
        label: "Fit",
        options: [
          { value: "contain", label: "Contain" },
          { value: "fill", label: "Stretch" },
        ],
      },
      { key: "flipX", type: "boolean", label: "Flip X" },
    ],
  },
});
