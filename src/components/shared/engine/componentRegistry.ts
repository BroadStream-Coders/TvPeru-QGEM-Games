import { ComponentType } from "react";
import { GameObjectComponent } from "@/components/shared/engine/gameObject";
import { ImageView } from "@/components/shared/engine/components/image/ImageView";
import { ImageInspector } from "@/components/shared/engine/components/image/ImageInspector";
import { createImageComponent } from "@/components/shared/engine/components/image/imageComponent";
import { ColorView } from "@/components/shared/engine/components/color/ColorView";
import { ColorInspector } from "@/components/shared/engine/components/color/ColorInspector";
import { createColorComponent } from "@/components/shared/engine/components/color/colorComponent";

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
