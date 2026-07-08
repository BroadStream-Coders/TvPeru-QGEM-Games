"use client";

import { useEffect } from "react";
import { useAssets } from "@engine/assetsContext";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { useGameKeys } from "@/hooks/use-game-keys";
import { playSound } from "@/lib/audio";
import { ControllerComponent } from "./components/controller/controllerComponent";
import {
  LEVEL1_ID,
  PICTURE_ID,
  OPTION_COUNT,
  OPTION_TEXT_IDS,
  NORMAL_FRAME_IDS,
  CORRECT_FRAME_IDS,
  INCORRECT_FRAME_IDS,
} from "./constants";

export function IntrusoBehavior() {
  const { assets } = useAssets();
  const runtime = useSceneRuntime((s) => s.runtime);
  const patchComponent = useSceneRuntime((s) => s.patchComponent);
  const setActive = useSceneRuntime((s) => s.setActive);

  const correctUrl = assets.correct?.url;
  const incorrectUrl = assets.incorrect?.url;

  const controller = runtime[LEVEL1_ID]?.components?.controller as
    | Partial<ControllerComponent>
    | undefined;
  const rounds = controller?.rounds ?? [];
  const roundIndex = controller?.roundIndex ?? 0;
  const selected = controller?.selected ?? -1;
  const loadedAt = controller?.loadedAt;
  const round = rounds[roundIndex];

  const patchController = (patch: Partial<ControllerComponent>) =>
    patchComponent(LEVEL1_ID, "controller", patch);

  useEffect(() => {
    const current = rounds[roundIndex];
    patchComponent(PICTURE_ID, "image", { src: current?.imageUrl ?? "" });
    for (let i = 0; i < OPTION_COUNT; i++) {
      patchComponent(OPTION_TEXT_IDS[i], "text", {
        text: current?.choices[i] ?? "",
      });
      setActive(NORMAL_FRAME_IDS[i], true);
      setActive(CORRECT_FRAME_IDS[i], false);
      setActive(INCORRECT_FRAME_IDS[i], false);
    }
    patchController({ selected: -1 });
  }, [roundIndex, loadedAt, patchComponent, setActive]);

  const selectRound = (n: number) => {
    if (n < 0 || n >= rounds.length) return;
    patchController({ roundIndex: n });
  };

  const nextRound = () => {
    if (roundIndex >= rounds.length - 1) return;
    patchController({ roundIndex: roundIndex + 1 });
  };

  const prevRound = () => {
    if (roundIndex <= 0) return;
    patchController({ roundIndex: roundIndex - 1 });
  };

  const selectOption = (i: number) => {
    if (!round) return;
    patchController({ selected: i });
  };

  const validate = () => {
    if (!round || selected < 0) return;
    const correct = selected === round.answerIndex;
    setActive(NORMAL_FRAME_IDS[selected], false);
    setActive(CORRECT_FRAME_IDS[selected], correct);
    setActive(INCORRECT_FRAME_IDS[selected], !correct);
    const soundUrl = correct ? correctUrl : incorrectUrl;
    if (soundUrl) playSound(soundUrl);
  };

  const showAnswer = () => {
    if (!round) return;
    const i = round.answerIndex;
    setActive(NORMAL_FRAME_IDS[i], false);
    setActive(INCORRECT_FRAME_IDS[i], false);
    setActive(CORRECT_FRAME_IDS[i], true);
    if (correctUrl) playSound(correctUrl);
  };

  useGameKeys({
    onNumber: selectRound,
    onNext: nextRound,
    onBack: prevRound,
    onOption: selectOption,
    onValidate: validate,
    onShowAnswer: showAnswer,
  });

  return null;
}
