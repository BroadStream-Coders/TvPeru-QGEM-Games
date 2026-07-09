"use client";

import { useEffect } from "react";
import { useAssets } from "@engine/assetsContext";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { useGameSession } from "@/hooks/use-game-session";
import { useGameKeys } from "@/hooks/use-game-keys";
import { playSound } from "@/lib/audio";
import {
  ControllerComponent,
  type AlVueloData,
} from "./components/controller/controllerComponent";
import {
  LEVEL1_ID,
  QUESTION_TEXT_ID,
  OPTION_COUNT,
  NORMAL_FRAME_IDS,
  CORRECT_FRAME_IDS,
  INCORRECT_FRAME_IDS,
} from "./constants";

export function AlVueloBehavior() {
  const { assets } = useAssets();
  const runtime = useSceneRuntime((s) => s.runtime);
  const patchComponent = useSceneRuntime((s) => s.patchComponent);
  const setActive = useSceneRuntime((s) => s.setActive);

  const correctUrl = assets.correct?.url;
  const incorrectUrl = assets.incorrect?.url;

  const session = useGameSession((s) => s.session) as AlVueloData | null;
  const loadedAt = useGameSession((s) => s.loadedAt);

  const controller = runtime[LEVEL1_ID]?.components?.controller as
    | Partial<ControllerComponent>
    | undefined;
  const groups = session?.groups ?? [];
  const groupIndex = controller?.groupIndex ?? 0;
  const questionIndex = controller?.questionIndex ?? 0;
  const selected = controller?.selected ?? -1;
  const questions = groups[groupIndex]?.questions ?? [];
  const question = questions[questionIndex];

  const patchController = (patch: Partial<ControllerComponent>) =>
    patchComponent(LEVEL1_ID, "controller", patch);

  useEffect(() => {
    patchComponent(LEVEL1_ID, "controller", {
      groupIndex: 0,
      questionIndex: 0,
    });
  }, [loadedAt, patchComponent]);

  useEffect(() => {
    const current = groups[groupIndex]?.questions[questionIndex];
    patchComponent(QUESTION_TEXT_ID, "text", {
      text: current?.question ?? "",
    });
    for (let i = 0; i < OPTION_COUNT; i++) {
      setActive(NORMAL_FRAME_IDS[i], true);
      setActive(CORRECT_FRAME_IDS[i], false);
      setActive(INCORRECT_FRAME_IDS[i], false);
    }
    patchController({ selected: -1 });
  }, [groupIndex, questionIndex, loadedAt, patchComponent, setActive]);

  const selectQuestion = (n: number) => {
    if (n < 0 || n >= questions.length) return;
    patchController({ questionIndex: n });
  };

  const nextQuestion = () => {
    if (questionIndex >= questions.length - 1) return;
    patchController({ questionIndex: questionIndex + 1 });
  };

  const prevQuestion = () => {
    if (questionIndex <= 0) return;
    patchController({ questionIndex: questionIndex - 1 });
  };

  const selectGroup = (n: number) => {
    if (n < 0 || n >= groups.length) return;
    patchController({ groupIndex: n, questionIndex: 0 });
  };

  const selectOption = (i: number) => {
    if (!question || i >= OPTION_COUNT) return;
    patchController({ selected: i });
  };

  const validate = () => {
    if (!question || selected < 0) return;
    const correctIndex = question.answer ? 0 : 1;
    const correct = selected === correctIndex;
    setActive(NORMAL_FRAME_IDS[selected], false);
    setActive(CORRECT_FRAME_IDS[selected], correct);
    setActive(INCORRECT_FRAME_IDS[selected], !correct);
    const soundUrl = correct ? correctUrl : incorrectUrl;
    if (soundUrl) playSound(soundUrl);
  };

  const showAnswer = () => {
    if (!question) return;
    const i = question.answer ? 0 : 1;
    setActive(NORMAL_FRAME_IDS[i], false);
    setActive(INCORRECT_FRAME_IDS[i], false);
    setActive(CORRECT_FRAME_IDS[i], true);
    if (correctUrl) playSound(correctUrl);
  };

  useGameKeys({
    onNumber: selectQuestion,
    onNavigate: selectGroup,
    onNext: nextQuestion,
    onBack: prevQuestion,
    onOption: selectOption,
    onValidate: validate,
    onShowAnswer: showAnswer,
  });

  return null;
}
