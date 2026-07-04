import React from "react";
import { cn } from "@/lib/utils";

export const DESIGN_WIDTH = 1920;
export const DESIGN_HEIGHT = 1080;

export interface Vec2 {
  x: number;
  y: number;
}

export interface RectTransformValues {
  position: Vec2;
  size: Vec2;
  pivot: Vec2;
  rotation?: number;
}

export type Vec2Field = "position" | "size" | "pivot";

interface RectTransformProps {
  position?: Vec2;
  size?: Vec2;
  pivot?: Vec2;
  rotation?: number;
  parentSize?: Vec2;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  goId?: string;
}

const DEFAULT_POSITION: Vec2 = { x: 0, y: 0 };
const DEFAULT_SIZE: Vec2 = { x: 400, y: 200 };
const DEFAULT_PIVOT: Vec2 = { x: 0.5, y: 0.5 };
const DEFAULT_PARENT_SIZE: Vec2 = { x: DESIGN_WIDTH, y: DESIGN_HEIGHT };

export function rectTransformStyle(
  position: Vec2,
  size: Vec2,
  pivot: Vec2,
  rotation: number,
  parentSize: Vec2,
): React.CSSProperties {
  return {
    left: `${(0.5 + position.x / parentSize.x - (pivot.x * size.x) / parentSize.x) * 100}%`,
    top: `${(0.5 - position.y / parentSize.y - (pivot.y * size.y) / parentSize.y) * 100}%`,
    width: `${(size.x / parentSize.x) * 100}%`,
    height: `${(size.y / parentSize.y) * 100}%`,
    transformOrigin: `${pivot.x * 100}% ${pivot.y * 100}%`,
    transform: rotation ? `rotate(${rotation}deg)` : "none",
  };
}

export function RectTransform({
  position = DEFAULT_POSITION,
  size = DEFAULT_SIZE,
  pivot = DEFAULT_PIVOT,
  rotation = 0,
  parentSize = DEFAULT_PARENT_SIZE,
  className,
  style,
  children,
  goId,
}: RectTransformProps) {
  return (
    <div
      data-go-id={goId}
      className={cn("absolute", className)}
      style={{
        ...rectTransformStyle(position, size, pivot, rotation, parentSize),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
