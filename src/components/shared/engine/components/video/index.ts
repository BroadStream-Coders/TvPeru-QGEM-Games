import { Video } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import {
  VideoComponent,
  createVideoComponent,
} from "@engine/components/video/videoComponent";
import { VideoView } from "@engine/components/video/VideoView";

export const videoDefinition = defineComponent<VideoComponent>({
  type: "video",
  label: "Video",
  create: () => createVideoComponent(),
  view: VideoView,
  schema: {
    icon: Video,
    accent: "video",
    fields: [
      {
        key: "assetKey",
        type: "assetKey",
        label: "Asset",
        kind: "video",
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
      { key: "muted", type: "boolean", label: "Sound", invert: true },
      { key: "loop", type: "boolean", label: "Loop" },
    ],
  },
});
