"use client";

import { useRef, useState, type PointerEvent } from "react";
import { useSceneViewMode } from "@engine/SceneViewMode";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { useEditorStore } from "@/hooks/use-editor-store";
import { usePlayMode } from "@/hooks/use-play-mode";
import { cn } from "@/lib/utils";
import { DROP_ZONE_ID } from "../../constants";
import { DraggableComponent } from "./draggableComponent";

interface DragState {
  goId: string;
  scale: number;
  origin: { x: number; y: number };
  start: { x: number; y: number };
}

const overDropZone = (e: PointerEvent) =>
  document
    .elementsFromPoint(e.clientX, e.clientY)
    .some((el) => el.hasAttribute("data-dropzone"));

export function DraggableView({
  component,
}: {
  component: DraggableComponent;
}) {
  const gameView = useSceneViewMode() === "game";
  const playing = usePlayMode((s) => s.playing);
  const interactive = gameView && playing;
  const setTransform = useSceneRuntime((s) => s.setTransform);
  const patchComponent = useSceneRuntime((s) => s.patchComponent);
  const drag = useRef<DragState | null>(null);
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!interactive) return;
    const goEl = e.currentTarget.closest<HTMLElement>("[data-go-id]");
    const goId = goEl?.dataset.goId;
    const go = useEditorStore.getState().gameObjects.find((g) => g.id === goId);
    if (!goEl || !goId || !go) return;
    const origin =
      useSceneRuntime.getState().runtime[goId]?.transform?.position ??
      go.transform.position;
    drag.current = {
      goId,
      scale: goEl.getBoundingClientRect().width / go.transform.size.x,
      origin,
      start: { x: e.clientX, y: e.clientY },
    };
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    patchComponent(DROP_ZONE_ID, "dropZone", { hover: false, filled: false });
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    setTransform(d.goId, {
      position: {
        x: d.origin.x + (e.clientX - d.start.x) / d.scale,
        y: d.origin.y - (e.clientY - d.start.y) / d.scale,
      },
    });
    patchComponent(DROP_ZONE_ID, "dropZone", { hover: overDropZone(e) });
  };

  const onPointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    setDragging(false);
    if (overDropZone(e)) {
      const zone = useEditorStore
        .getState()
        .gameObjects.find((g) => g.id === DROP_ZONE_ID);
      if (zone) setTransform(d.goId, { position: zone.transform.position });
      patchComponent(DROP_ZONE_ID, "dropZone", { hover: false, filled: true });
    } else {
      patchComponent(DROP_ZONE_ID, "dropZone", { hover: false });
    }
  };

  return (
    <div
      className={cn(
        "h-full w-full touch-none rounded-[1cqi] border-[0.2cqi] border-white/25 shadow-lg",
        interactive && "cursor-grab",
        dragging && "cursor-grabbing brightness-110",
      )}
      style={{ backgroundColor: component.color }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    />
  );
}
