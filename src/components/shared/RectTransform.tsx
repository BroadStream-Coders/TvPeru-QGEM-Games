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
}

interface RectTransformProps {
  position?: Vec2;
  size?: Vec2;
  pivot?: Vec2;
  parent?: RectTransformValues;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const DEFAULT_POSITION: Vec2 = { x: 0, y: 0 };
const DEFAULT_SIZE: Vec2 = { x: 400, y: 200 };
const DEFAULT_PIVOT: Vec2 = { x: 0.5, y: 0.5 };

export function RectTransform({
  position = DEFAULT_POSITION,
  size = DEFAULT_SIZE,
  pivot = DEFAULT_PIVOT,
  className,
  style,
  children,
}: RectTransformProps) {
  return (
    <div
      className={cn("absolute", className)}
      style={{
        left: `${((DESIGN_WIDTH / 2 + position.x) / DESIGN_WIDTH) * 100}cqw`,
        top: `${((DESIGN_HEIGHT / 2 - position.y) / DESIGN_HEIGHT) * 100}cqh`,
        width: `${(size.x / DESIGN_WIDTH) * 100}cqw`,
        height: `${(size.y / DESIGN_HEIGHT) * 100}cqh`,
        transform: `translate(${-pivot.x * 100}%, ${-pivot.y * 100}%)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
