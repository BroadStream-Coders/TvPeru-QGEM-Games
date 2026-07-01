"use client";

import { useEffect, useState } from "react";
import { useEditor } from "@engine/editor/editorContext";
import { useAssets } from "@engine/assetsContext";
import { useAnimations } from "@engine/animations/AnimationsContext";
import { ImageComponent } from "@engine/components/image/imageComponent";
import { useGameKeys } from "@/hooks/use-game-keys";
import { playSound } from "@/lib/audio";
import {
  ControllerComponent,
} from "./components/controller/controllerComponent";
import { FRAME_ID, TEXT_ID, CONTROLLER_ID } from "./constants";

export function DeletreoBehavior() {
  const { gameObjects, setGameObjects } = useEditor();
  const { assets } = useAssets();
  const { trigger } = useAnimations();

  const normalUrl = assets.mainFrame?.url;
  const errorUrl = assets.errorFrame?.url;
  const correctUrl = assets.correct?.url;
  const incorrectUrl = assets.incorrect?.url;

  const [spellStep, setSpellStep] = useState(0);
  const [normalSrc, setNormalSrc] = useState("");

  const controller = gameObjects
    .find((go) => go.id === CONTROLLER_ID)
    ?.components.find((c) => c.type === "controller") as
    | ControllerComponent
    | undefined;
  const groups = controller?.groups ?? [];
  const groupIndex = controller?.groupIndex ?? 0;
  const slotIndex = controller?.slotIndex ?? 0;

  const patchController = (patch: Partial<ControllerComponent>) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === CONTROLLER_ID
          ? {
              ...go,
              components: go.components.map((c) =>
                c.type === "controller" ? { ...c, ...patch } : c,
              ),
            }
          : go,
      ),
    );

  const setMainFrameImageSrc = (src: string) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === FRAME_ID
          ? {
              ...go,
              components: go.components.map((c) =>
                c.type === "image" ? { ...c, src } : c,
              ),
            }
          : go,
      ),
    );

  useEffect(() => {
    if (!normalUrl) return;
    setNormalSrc(normalUrl);
    setMainFrameImageSrc(normalUrl);
  }, [normalUrl]);

  useEffect(() => {
    const frame = gameObjects.find((go) => go.id === FRAME_ID);
    const img = frame?.components.find((c) => c.type === "image") as
      | ImageComponent
      | undefined;
    if (img?.src && img.src !== errorUrl) setNormalSrc(img.src);
  }, [gameObjects, errorUrl]);

  const currentGroup = groups[groupIndex]?.words ?? [];
  const word = currentGroup[slotIndex] ?? "";

  useEffect(() => {
    setSpellStep(0);
    setMainFrameImageSrc(normalSrc);
  }, [groupIndex, slotIndex, controller?.fileName]);

  useEffect(() => {
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === TEXT_ID
          ? {
              ...go,
              components: go.components.map((c) =>
                c.type === "spellframe" ? { ...c, word, spellStep } : c,
              ),
            }
          : go,
      ),
    );
  }, [word, spellStep, setGameObjects]);

  const selectGroup = (n: number) => {
    if (n < 0 || n >= groups.length) return;
    patchController({ groupIndex: n, slotIndex: 0 });
  };

  const selectSlot = (n: number) => {
    if (n < 0 || n >= currentGroup.length) return;
    patchController({ slotIndex: n });
  };

  const nextSlot = () => {
    if (slotIndex >= currentGroup.length - 1) return;
    patchController({ slotIndex: slotIndex + 1 });
  };

  const prevSlot = () => {
    if (slotIndex <= 0) return;
    patchController({ slotIndex: slotIndex - 1 });
  };

  useGameKeys({
    onNumber: selectSlot,
    onNavigate: selectGroup,
    onNext: nextSlot,
    onBack: prevSlot,
    onShowAnswer: () => {
      setSpellStep(word.length);
      setMainFrameImageSrc(normalSrc);
      if (correctUrl) playSound(correctUrl);
      trigger(FRAME_ID, "pop");
    },
    onMarkError: () => {
      if (errorUrl) setMainFrameImageSrc(errorUrl);
      if (incorrectUrl) playSound(incorrectUrl);
      trigger(FRAME_ID, "shake");
    },
    onInteract: () => setSpellStep((s) => Math.min(s + 1, word.length)),
    onArrowUp: () => trigger(FRAME_ID, "bounce"),
    onArrowDown: () => trigger(FRAME_ID, "slide"),
  });

  return null;
}
