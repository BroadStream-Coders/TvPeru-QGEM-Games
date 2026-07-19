"use client";

import { useSceneViewMode } from "@engine/SceneViewMode";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { usePlayMode } from "@/hooks/use-play-mode";
import { cn } from "@/lib/utils";
import { TARGET_ID } from "../../constants";
import { ButtonComponent } from "./buttonComponent";

export function ButtonView({ component }: { component: ButtonComponent }) {
  const gameView = useSceneViewMode() === "game";
  const playing = usePlayMode((s) => s.playing);
  const patchComponent = useSceneRuntime((s) => s.patchComponent);
  const interactive = gameView && playing;
  return (
    <div
      className={cn(
        "h-full w-full rounded-[1cqi] border-[0.2cqi] border-white/25 transition duration-75",
        interactive && "cursor-pointer hover:brightness-110 active:scale-95",
      )}
      style={{ backgroundColor: component.color }}
      onClick={
        interactive
          ? () => patchComponent(TARGET_ID, "color", { value: component.color })
          : undefined
      }
    />
  );
}
