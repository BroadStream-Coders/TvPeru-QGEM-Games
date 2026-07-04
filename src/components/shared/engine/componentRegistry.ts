"use client";

import { ComponentType, createContext, useContext } from "react";
import { GameObjectComponent } from "@engine/gameObject";
import { Vec2 } from "@engine/RectTransform";
import { imageDefinition } from "@engine/components/image";
import { colorDefinition } from "@engine/components/color";
import { videoDefinition } from "@engine/components/video";
import { videoControlDefinition } from "@engine/components/videoControl";
import { textDefinition } from "@engine/components/text";
import { maskDefinition } from "@engine/components/mask";
import { popDefinition } from "@engine/components/pop";
import { shakeDefinition } from "@engine/components/shake";
import { bounceDefinition } from "@engine/components/bounce";
import { slideDefinition } from "@engine/components/slide";

export interface ComponentDefinition<
  C extends GameObjectComponent = GameObjectComponent,
> {
  type: C["type"];
  label: string;
  create: () => C;
  stripForExport?: (component: C) => C;
  view?: ComponentType<{ component: C }>;
  editor: ComponentType<{
    component: C;
    onChange: (next: C) => void;
    onRemove: () => void;
    onResize: (size: Vec2) => void;
    onAddComponent?: (type: string) => void;
  }>;
}

export function defineComponent<C extends GameObjectComponent>(
  def: ComponentDefinition<C>,
): ComponentDefinition {
  return def as unknown as ComponentDefinition;
}

export interface ComponentRegistry {
  get: (type: string) => ComponentDefinition | undefined;
  options: { type: string; label: string }[];
}

export function createComponentRegistry(
  defs: ComponentDefinition[],
): ComponentRegistry {
  const byType = new Map(defs.map((def) => [def.type, def]));
  return {
    get: (type) => byType.get(type),
    options: defs.map((def) => ({ type: def.type, label: def.label })),
  };
}

export const NATIVE_COMPONENTS: ComponentDefinition[] = [
  imageDefinition,
  colorDefinition,
  videoDefinition,
  videoControlDefinition,
  textDefinition,
  maskDefinition,
  popDefinition,
  shakeDefinition,
  bounceDefinition,
  slideDefinition,
];

const ComponentRegistryContext = createContext<ComponentRegistry>(
  createComponentRegistry(NATIVE_COMPONENTS),
);

export const ComponentRegistryProvider = ComponentRegistryContext.Provider;

export function useComponentRegistry() {
  return useContext(ComponentRegistryContext);
}
