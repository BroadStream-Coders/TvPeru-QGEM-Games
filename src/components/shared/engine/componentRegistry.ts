import { ComponentType } from "react";
import { GameObjectComponent } from "@engine/gameObject";
import { ImageView } from "@engine/components/image/ImageView";
import { ImageInspector } from "@engine/components/image/ImageInspector";
import { createImageComponent } from "@engine/components/image/imageComponent";
import { ColorView } from "@engine/components/color/ColorView";
import { ColorInspector } from "@engine/components/color/ColorInspector";
import { createColorComponent } from "@engine/components/color/colorComponent";
import { VideoView } from "@engine/components/video/VideoView";
import { VideoInspector } from "@engine/components/video/VideoInspector";
import { createVideoComponent } from "@engine/components/video/videoComponent";
import { TextView } from "@engine/components/text/TextView";
import { TextInspector } from "@engine/components/text/TextInspector";
import { createTextComponent } from "@engine/components/text/textComponent";

export interface ComponentDefinition {
  label: string;
  create: () => GameObjectComponent;
  view: ComponentType<{ component: GameObjectComponent }>;
  editor: ComponentType<{
    component: GameObjectComponent;
    onChange: (next: GameObjectComponent) => void;
    onRemove: () => void;
    onResize: (size: { x: number; y: number }) => void;
  }>;
}

export const COMPONENT_REGISTRY: Record<string, ComponentDefinition> = {
  image: {
    label: "Image",
    create: () => createImageComponent(),
    view: ImageView as unknown as ComponentDefinition["view"],
    editor: ImageInspector as unknown as ComponentDefinition["editor"],
  },
  color: {
    label: "Color",
    create: () => createColorComponent(),
    view: ColorView as unknown as ComponentDefinition["view"],
    editor: ColorInspector as unknown as ComponentDefinition["editor"],
  },
  video: {
    label: "Video",
    create: () => createVideoComponent(),
    view: VideoView as unknown as ComponentDefinition["view"],
    editor: VideoInspector as unknown as ComponentDefinition["editor"],
  },
  text: {
    label: "Text",
    create: () => createTextComponent(),
    view: TextView as unknown as ComponentDefinition["view"],
    editor: TextInspector as unknown as ComponentDefinition["editor"],
  },
};

export const COMPONENT_OPTIONS = Object.entries(COMPONENT_REGISTRY).map(
  ([type, def]) => ({ type, label: def.label }),
);
