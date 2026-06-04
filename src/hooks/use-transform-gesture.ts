import { useCallback, useEffect, useRef } from "react";
import type { RefObject } from "react";
import {
  RectTransformValues,
  Vec2,
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
} from "@engine/RectTransform";

export type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

export const HANDLES: { h: Handle; pos: string; cursor: string }[] = [
  { h: "nw", pos: "left-0 top-0", cursor: "cursor-nwse-resize" },
  { h: "n", pos: "left-1/2 top-0", cursor: "cursor-ns-resize" },
  { h: "ne", pos: "left-full top-0", cursor: "cursor-nesw-resize" },
  { h: "e", pos: "left-full top-1/2", cursor: "cursor-ew-resize" },
  { h: "se", pos: "left-full top-full", cursor: "cursor-nwse-resize" },
  { h: "s", pos: "left-1/2 top-full", cursor: "cursor-ns-resize" },
  { h: "sw", pos: "left-0 top-full", cursor: "cursor-nesw-resize" },
  { h: "w", pos: "left-0 top-1/2", cursor: "cursor-ew-resize" },
];

const MIN_SIZE = 20;

interface UseTransformGestureOptions {
  stageRef: RefObject<HTMLDivElement | null>;
  /** Transform actual al iniciar el gesto. Devuelve null para cancelar. */
  getTransform: () => RectTransformValues | null;
  /** Aplica la nueva posición/tamaño calculados durante el gesto. */
  onChange: (next: { position: Vec2; size: Vec2 }) => void;
}

export function useTransformGesture({
  stageRef,
  getTransform,
  onChange,
}: UseTransformGestureOptions) {
  const optsRef = useRef({ getTransform, onChange });
  useEffect(() => {
    optsRef.current = { getTransform, onChange };
  });

  const cleanupRef = useRef<(() => void) | null>(null);
  const gestureRef = useRef<{
    handle: Handle | "move";
    clientX: number;
    clientY: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
    pivot: Vec2;
  } | null>(null);

  const beginGesture = useCallback(
    (handle: Handle | "move", e: React.PointerEvent) => {
      const t = optsRef.current.getTransform();
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();

      const pivotLeft = DESIGN_WIDTH / 2 + t.position.x;
      const pivotTop = DESIGN_HEIGHT / 2 - t.position.y;
      const left = pivotLeft - t.pivot.x * t.size.x;
      const top = pivotTop - t.pivot.y * t.size.y;
      gestureRef.current = {
        handle,
        clientX: e.clientX,
        clientY: e.clientY,
        left,
        top,
        right: left + t.size.x,
        bottom: top + t.size.y,
        pivot: { ...t.pivot },
      };

      const onMove = (ev: PointerEvent) => {
        const g = gestureRef.current;
        const stage = stageRef.current;
        if (!g || !stage) return;
        const rect = stage.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        const dx = ((ev.clientX - g.clientX) * DESIGN_WIDTH) / rect.width;
        const dy = ((ev.clientY - g.clientY) * DESIGN_HEIGHT) / rect.height;

        let left = g.left;
        let top = g.top;
        let right = g.right;
        let bottom = g.bottom;

        if (g.handle === "move") {
          left += dx;
          right += dx;
          top += dy;
          bottom += dy;
        } else {
          if (g.handle.includes("w")) left = g.left + dx;
          if (g.handle.includes("e")) right = g.right + dx;
          if (g.handle.includes("n")) top = g.top + dy;
          if (g.handle.includes("s")) bottom = g.bottom + dy;
          if (right - left < MIN_SIZE) {
            if (g.handle.includes("w")) left = right - MIN_SIZE;
            else right = left + MIN_SIZE;
          }
          if (bottom - top < MIN_SIZE) {
            if (g.handle.includes("n")) top = bottom - MIN_SIZE;
            else bottom = top + MIN_SIZE;
          }
        }

        const w = right - left;
        const h = bottom - top;
        const pivotLeft = left + g.pivot.x * w;
        const pivotTop = top + g.pivot.y * h;
        optsRef.current.onChange({
          position: {
            x: Math.round(pivotLeft - DESIGN_WIDTH / 2),
            y: Math.round(DESIGN_HEIGHT / 2 - pivotTop),
          },
          size: { x: Math.round(w), y: Math.round(h) },
        });
      };

      const endGesture = () => {
        gestureRef.current = null;
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", endGesture);
        cleanupRef.current = null;
      };

      cleanupRef.current = endGesture;
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", endGesture);
    },
    [stageRef],
  );

  useEffect(() => () => cleanupRef.current?.(), []);

  return { beginGesture };
}
