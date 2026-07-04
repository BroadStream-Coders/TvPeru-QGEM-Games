import { DESIGN_WIDTH, DESIGN_HEIGHT, type Vec2 } from "@engine/RectTransform";

export interface AbsRect {
  left: number;
  top: number;
  w: number;
  h: number;
}

export function toAbsRect(
  position: Vec2,
  size: Vec2,
  pivot: Vec2,
  origin: Vec2,
): AbsRect {
  const ax = position.x + origin.x;
  const ay = position.y + origin.y;
  const pivotLeft = DESIGN_WIDTH / 2 + ax;
  const pivotTop = DESIGN_HEIGHT / 2 - ay;
  return {
    left: pivotLeft - pivot.x * size.x,
    top: pivotTop - pivot.y * size.y,
    w: size.x,
    h: size.y,
  };
}

export function fromAbsRect(
  rect: AbsRect,
  pivot: Vec2,
  origin: Vec2,
): { position: Vec2; size: Vec2 } {
  const pivotLeft = rect.left + pivot.x * rect.w;
  const pivotTop = rect.top + pivot.y * rect.h;
  const ax = pivotLeft - DESIGN_WIDTH / 2;
  const ay = DESIGN_HEIGHT / 2 - pivotTop;
  return {
    position: { x: Math.round(ax - origin.x), y: Math.round(ay - origin.y) },
    size: { x: Math.round(rect.w), y: Math.round(rect.h) },
  };
}
