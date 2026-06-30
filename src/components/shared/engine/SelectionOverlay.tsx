"use client";

import { PointerEvent } from "react";
import { RectTransform } from "@engine/RectTransform";
import { GameObject, ancestorOffset } from "@engine/gameObject";
import { Handle, HANDLES } from "@/hooks/use-transform-gesture";

export function SelectionOverlay({
  selected,
  allGameObjects,
  onGesture,
}: {
  selected: GameObject | null;
  allGameObjects: GameObject[];
  onGesture: (handle: Handle | "move", e: PointerEvent) => void;
}) {
  if (!selected) return null;

  const origin = ancestorOffset(selected, allGameObjects);
  const position = {
    x: selected.transform.position.x + origin.x,
    y: selected.transform.position.y + origin.y,
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      <RectTransform
        position={position}
        size={selected.transform.size}
        pivot={selected.transform.pivot}
      >
        <div
          onPointerDown={(e) => onGesture("move", e)}
          className="pointer-events-auto absolute inset-0 cursor-move touch-none select-none border border-acc"
        />
        {HANDLES.map((hd) => (
          <div
            key={hd.h}
            onPointerDown={(e) => onGesture(hd.h, e)}
            className={`pointer-events-auto absolute ${hd.pos} ${hd.cursor} h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 touch-none rounded-[2px] bg-acc ring-1 ring-white`}
          />
        ))}
      </RectTransform>
    </div>
  );
}
