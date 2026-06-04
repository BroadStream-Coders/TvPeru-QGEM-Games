import React from "react";
import { RectTransform, RectTransformValues } from "@engine/RectTransform";
import { GameObject } from "@engine/gameObject";
import { COMPONENT_REGISTRY } from "@engine/componentRegistry";

interface GameObjectViewProps {
  gameObject: GameObject;
  parent?: RectTransformValues;
  outline?: boolean;
  selected?: boolean;
  children?: React.ReactNode;
}

export function GameObjectView({
  gameObject,
  parent,
  outline,
  selected,
  children,
}: GameObjectViewProps) {
  return (
    <RectTransform
      position={gameObject.transform.position}
      size={gameObject.transform.size}
      pivot={gameObject.transform.pivot}
      parent={parent}
    >
      <div className="absolute inset-0">
        {gameObject.components.map((component, index) => {
          const View = COMPONENT_REGISTRY[component.type]?.view;
          return View ? <View key={index} component={component} /> : null;
        })}
        {children}
      </div>
      {outline && (
        <div
          className={`pointer-events-none absolute inset-0 border-2 border-dashed ${
            selected ? "border-brand" : "border-white/60"
          }`}
        />
      )}
    </RectTransform>
  );
}
