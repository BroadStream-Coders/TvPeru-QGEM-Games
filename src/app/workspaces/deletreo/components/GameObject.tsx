import React from "react";
import {
  RectTransform,
  RectTransformValues,
} from "@/components/shared/engine/RectTransform";
import { GameObject as GameObjectType } from "../gameObject";

interface GameObjectProps {
  gameObject: GameObjectType;
  parent?: RectTransformValues;
  outline?: boolean;
  selected?: boolean;
  children?: React.ReactNode;
}

export function GameObject({
  gameObject,
  parent,
  outline,
  selected,
  children,
}: GameObjectProps) {
  return (
    <RectTransform
      position={gameObject.transform.position}
      size={gameObject.transform.size}
      pivot={gameObject.transform.pivot}
      parent={parent}
    >
      <div className="absolute inset-0">{children}</div>
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
