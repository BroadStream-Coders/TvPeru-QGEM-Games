"use client";

import { useSceneViewMode } from "@engine/SceneViewMode";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { usePlayMode } from "@/hooks/use-play-mode";
import { LEVEL2_ID } from "../../constants";
import { CardComponent } from "./cardComponent";

export function CardView({ component }: { component: CardComponent }) {
  const gameView = useSceneViewMode() === "game";
  const playing = usePlayMode((s) => s.playing);
  const patchComponent = useSceneRuntime((s) => s.patchComponent);
  if (!gameView || !playing) return null;
  return (
    <div
      className="absolute inset-0 z-10 cursor-pointer touch-none"
      onPointerDown={() =>
        patchComponent(LEVEL2_ID, "controller", { selected: component.index })
      }
    />
  );
}
