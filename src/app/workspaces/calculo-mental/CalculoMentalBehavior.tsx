"use client";

import { useEffect } from "react";
import { useAssets } from "@engine/assetsContext";
import { useAnimations } from "@engine/animations/AnimationsContext";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { useGameKeys } from "@/hooks/use-game-keys";
import { playSound } from "@/lib/audio";
import { ControllerComponent } from "./components/controller/controllerComponent";
import {
  SLOT_COUNT,
  SLOT_IDS,
  QUESTION_IDS,
  ANSWER_IDS,
  CONTROLLER_ID,
} from "./constants";

export function CalculoMentalBehavior() {
  const { assets } = useAssets();
  const { trigger } = useAnimations();
  const runtime = useSceneRuntime((s) => s.runtime);
  const patchComponent = useSceneRuntime((s) => s.patchComponent);
  const setActive = useSceneRuntime((s) => s.setActive);

  const correctUrl = assets.correct?.url;
  const incorrectUrl = assets.incorrect?.url;

  const controller = runtime[CONTROLLER_ID]?.components?.controller as
    | Partial<ControllerComponent>
    | undefined;
  const groups = controller?.groups ?? [];
  const groupIndex = controller?.groupIndex ?? 0;
  const boardIndex = controller?.boardIndex ?? 0;
  const cursor = controller?.cursor ?? -1;
  const fileName = controller?.fileName;

  const patchController = (patch: Partial<ControllerComponent>) =>
    patchComponent(CONTROLLER_ID, "controller", patch);

  const setStatus = (id: string, status: string) =>
    patchComponent(id, "slot", { status });

  const boardSlots = groups[groupIndex]?.boards[boardIndex]?.slots ?? [];

  useEffect(() => {
    const slots = groups[groupIndex]?.boards[boardIndex]?.slots ?? [];
    patchController({ cursor: -1 });
    SLOT_IDS.forEach((id, i) => {
      patchComponent(id, "slot", { status: "none" });
      patchComponent(QUESTION_IDS[i], "text", { text: slots[i]?.question ?? "" });
      patchComponent(ANSWER_IDS[i], "text", { text: slots[i]?.answer ?? "" });
      setActive(QUESTION_IDS[i], false);
      setActive(ANSWER_IDS[i], false);
    });
  }, [groupIndex, boardIndex, fileName, patchComponent, setActive]);

  const selectGroup = (n: number) => {
    if (n < 0 || n >= groups.length) return;
    patchController({ groupIndex: n, boardIndex: 0 });
  };

  const selectBoard = (n: number) => {
    const boards = groups[groupIndex]?.boards ?? [];
    if (n < 0 || n >= boards.length) return;
    patchController({ boardIndex: n });
  };

  const nextBoard = () => {
    const boards = groups[groupIndex]?.boards ?? [];
    if (boardIndex >= boards.length - 1) return;
    patchController({ boardIndex: boardIndex + 1 });
  };

  const prevBoard = () => {
    if (boardIndex <= 0) return;
    patchController({ boardIndex: boardIndex - 1 });
  };

  const revealNextQuestion = () => {
    const next = cursor + 1;
    if (next >= SLOT_COUNT || next >= boardSlots.length) return;
    setActive(QUESTION_IDS[next], true);
    patchController({ cursor: next });
  };

  const selectBackSlot = () => {
    if (cursor < 0) return;
    setActive(QUESTION_IDS[cursor], false);
    setActive(ANSWER_IDS[cursor], false);
    setStatus(SLOT_IDS[cursor], "none");
    patchController({ cursor: cursor - 1 });
  };

  const playSequence = (anim: "bounce" | "slide", delayMs = 100) =>
    SLOT_IDS.forEach((id, i) =>
      setTimeout(() => trigger(id, anim), i * delayMs),
    );

  const showCurrentAnswer = () => {
    if (cursor < 0) return;
    setActive(ANSWER_IDS[cursor], true);
    setStatus(SLOT_IDS[cursor], "correct");
    if (correctUrl) playSound(correctUrl);
    trigger(SLOT_IDS[cursor], "pop");
  };

  const markCurrentError = () => {
    if (cursor < 0) return;
    setStatus(SLOT_IDS[cursor], "incorrect");
    if (incorrectUrl) playSound(incorrectUrl);
    trigger(SLOT_IDS[cursor], "shake");
  };

  const clearCurrent = () => {
    if (cursor < 0) return;
    setStatus(SLOT_IDS[cursor], "none");
  };

  useGameKeys({
    onNavigate: selectGroup,
    onNumber: selectBoard,
    onNext: nextBoard,
    onBack: prevBoard,
    onArrowRight: revealNextQuestion,
    onArrowLeft: selectBackSlot,
    onShowAnswer: showCurrentAnswer,
    onMarkError: markCurrentError,
    onClear: clearCurrent,
    onArrowUp: () => playSequence("bounce"),
    onArrowDown: () => playSequence("slide"),
  });

  return null;
}
