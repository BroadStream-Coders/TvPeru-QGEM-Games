import { ComponentType } from "react";
import { GameObjectComponent } from "@/components/shared/engine/gameObject";
import { ImageView } from "@/components/shared/engine/components/image/ImageView";
import { ImageInspector } from "@/components/shared/engine/components/image/ImageInspector";

export interface ComponentDefinition {
  view: ComponentType<{ component: GameObjectComponent }>;
  editor: ComponentType<{
    component: GameObjectComponent;
    onChange: (next: GameObjectComponent) => void;
  }>;
}

export const COMPONENT_REGISTRY: Record<string, ComponentDefinition> = {
  image: {
    view: ImageView as unknown as ComponentDefinition["view"],
    editor: ImageInspector as unknown as ComponentDefinition["editor"],
  },
};
