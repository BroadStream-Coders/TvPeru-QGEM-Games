"use client";

import { useEffect, useState } from "react";
import { useAssets } from "@engine/assetsContext";
import { useAnimations } from "@engine/animations/AnimationsContext";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { useGameKeys } from "@/hooks/use-game-keys";
import { playSound } from "@/lib/audio";
import {
  DeletreoComponent,
  DeletreoFrame,
} from "./components/deletreo/deletreoComponent";
import { ANCHOR_ID, FRAME_ID, TEXT_ID } from "./constants";

export function DeletreoBehavior() {
  const { assets } = useAssets();
  const { trigger } = useAnimations();
  const runtime = useSceneRuntime((s) => s.runtime);
  const patchComponent = useSceneRuntime((s) => s.patchComponent);

  const correctUrl = assets.correct?.url;
  const incorrectUrl = assets.incorrect?.url;

  const [spellStep, setSpellStep] = useState(0);

  const controller = runtime[ANCHOR_ID]?.components?.deletreo as
    | Partial<DeletreoComponent>
    | undefined;
  const groups = controller?.groups ?? [];
  const groupIndex = controller?.groupIndex ?? 0;
  const slotIndex = controller?.slotIndex ?? 0;

  const patchDeletreo = (patch: Partial<DeletreoComponent>) =>
    patchComponent(ANCHOR_ID, "deletreo", patch);

  const setFrame = (frame: DeletreoFrame) => patchDeletreo({ frame });

  const currentGroup = groups[groupIndex]?.words ?? [];
  const word = currentGroup[slotIndex] ?? "";

  useEffect(() => {
    setSpellStep(0);
    setFrame("normal");
  }, [groupIndex, slotIndex, controller?.fileName]);

  useEffect(() => {
    patchComponent(TEXT_ID, "spellframe", { word, spellStep });
  }, [word, spellStep, patchComponent]);

  const selectGroup = (n: number) => {
    if (n < 0 || n >= groups.length) return;
    patchDeletreo({ groupIndex: n, slotIndex: 0 });
  };

  const selectSlot = (n: number) => {
    if (n < 0 || n >= currentGroup.length) return;
    patchDeletreo({ slotIndex: n });
  };

  const nextSlot = () => {
    if (slotIndex >= currentGroup.length - 1) return;
    patchDeletreo({ slotIndex: slotIndex + 1 });
  };

  const prevSlot = () => {
    if (slotIndex <= 0) return;
    patchDeletreo({ slotIndex: slotIndex - 1 });
  };

  useGameKeys({
    onNumber: selectSlot,
    onNavigate: selectGroup,
    onNext: nextSlot,
    onBack: prevSlot,
    onShowAnswer: () => {
      setSpellStep(word.length);
      setFrame("normal");
      if (correctUrl) playSound(correctUrl);
      trigger(FRAME_ID, "pop");
    },
    onMarkError: () => {
      setFrame("error");
      if (incorrectUrl) playSound(incorrectUrl);
      trigger(FRAME_ID, "shake");
    },
    onInteract: () => setSpellStep((s) => Math.min(s + 1, word.length)),
    onArrowUp: () => trigger(FRAME_ID, "bounce"),
    onArrowDown: () => trigger(FRAME_ID, "slide"),
  });

  return null;
}
