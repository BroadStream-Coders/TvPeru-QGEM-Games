import { defineComponent } from "@engine/componentRegistry";
import {
  VideoControlComponent,
  createVideoControlComponent,
} from "@engine/components/videoControl/videoControlComponent";
import { VideoControlView } from "@engine/components/videoControl/VideoControlView";
import { VideoControlInspector } from "@engine/components/videoControl/VideoControlInspector";

export const videoControlDefinition = defineComponent<VideoControlComponent>({
  type: "videoControl",
  label: "Video Control",
  create: () => createVideoControlComponent(),
  view: VideoControlView,
  editor: VideoControlInspector,
});
