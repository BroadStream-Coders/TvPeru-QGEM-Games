import { ComponentType } from "react";
import { GameObjectComponent } from "@engine/gameObject";
import { ImageView } from "@engine/components/image/ImageView";
import { ImageInspector } from "@engine/components/image/ImageInspector";
import { createImageComponent } from "@engine/components/image/imageComponent";
import { ColorView } from "@engine/components/color/ColorView";
import { ColorInspector } from "@engine/components/color/ColorInspector";
import { createColorComponent } from "@engine/components/color/colorComponent";

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
};

export const COMPONENT_OPTIONS = Object.entries(COMPONENT_REGISTRY).map(
  ([type, def]) => ({ type, label: def.label }),
);
