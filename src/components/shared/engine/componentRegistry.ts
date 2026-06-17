"use client";

import { ComponentType, createContext, useContext } from "react";
import { GameObjectComponent } from "@engine/gameObject";
import { Vec2 } from "@engine/RectTransform";
import { imageDefinition } from "@engine/components/image";
import { colorDefinition } from "@engine/components/color";
import { videoDefinition } from "@engine/components/video";
import { textDefinition } from "@engine/components/text";

export interface ComponentDefinition<
  C extends GameObjectComponent = GameObjectComponent,
> {
  type: C["type"];
  label: string;
  create: () => C;
  view: ComponentType<{ component: C }>;
  editor: ComponentType<{
    component: C;
    onChange: (next: C) => void;
    onRemove: () => void;
    onResize: (size: Vec2) => void;
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
  textDefinition,
];

const ComponentRegistryContext = createContext<ComponentRegistry>(
  createComponentRegistry(NATIVE_COMPONENTS),
);

export const ComponentRegistryProvider = ComponentRegistryContext.Provider;

export function useComponentRegistry() {
  return useContext(ComponentRegistryContext);
}
