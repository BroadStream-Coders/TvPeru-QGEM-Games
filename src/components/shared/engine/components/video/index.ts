import { defineComponent } from "@engine/componentRegistry";
import {
  VideoComponent,
  createVideoComponent,
} from "@engine/components/video/videoComponent";
import { VideoView } from "@engine/components/video/VideoView";
import { VideoInspector } from "@engine/components/video/VideoInspector";

export const videoDefinition = defineComponent<VideoComponent>({
  type: "video",
  label: "Video",
  create: () => createVideoComponent(),
  view: VideoView,
  editor: VideoInspector,
});
