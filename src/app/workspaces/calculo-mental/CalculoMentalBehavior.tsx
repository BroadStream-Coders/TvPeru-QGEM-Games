"use client";

import { useEffect } from "react";
import { useEditor } from "@engine/editor/editorContext";
import { useAssets } from "@engine/assetsContext";
import { useAnimations } from "@engine/animations/AnimationsContext";
import { useGameKeys } from "@/hooks/use-game-keys";
import { playSound } from "@/lib/audio";
import { SlotComponent } from "./components/slot/slotComponent";
import { ControllerComponent } from "./components/controller/controllerComponent";
import {
  SLOT_COUNT,
  SLOT_IDS,
  QUESTION_IDS,
  ANSWER_IDS,
  CONTROLLER_ID,
} from "./constants";

export function CalculoMentalBehavior() {
  const { gameObjects, setGameObjects, patchGameObject } = useEditor();
  const { assets } = useAssets();
  const { trigger } = useAnimations();

  const blueUrl = assets.blueFrame?.url;
  const purpleUrl = assets.purpleFrame?.url;
  const checkUrl = assets.check?.url;
  const xUrl = assets.x?.url;
  const correctUrl = assets.correct?.url;
  const incorrectUrl = assets.incorrect?.url;

  useEffect(() => {
    setGameObjects((prev) =>
      prev.map((go) =>
        SLOT_IDS.includes(go.id)
          ? {
              ...go,
              components: go.components.map((c) => {
                if (c.type !== "slot") return c;
                const slot = c as SlotComponent;
                return {
                  ...slot,
                  blueSrc: blueUrl ?? slot.blueSrc,
                  purpleSrc: purpleUrl ?? slot.purpleSrc,
                  checkSrc: checkUrl ?? slot.checkSrc,
                  xSrc: xUrl ?? slot.xSrc,
                };
              }),
            }
          : go,
      ),
    );
  }, [blueUrl, purpleUrl, checkUrl, xUrl, setGameObjects]);

  const controller = gameObjects
    .find((go) => go.id === CONTROLLER_ID)
    ?.components.find((c) => c.type === "controller") as
    | ControllerComponent
    | undefined;
  const groups = controller?.groups ?? [];
  const groupIndex = controller?.groupIndex ?? 0;
  const boardIndex = controller?.boardIndex ?? 0;
  const cursor = controller?.cursor ?? -1;
  const fileName = controller?.fileName;

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

  const patchSlot = (id: string, patch: Partial<SlotComponent>) =>
    setGameObjects((prev) =>
      prev.map((go) =>
        go.id === id
          ? {
              ...go,
              components: go.components.map((c) =>
                c.type === "slot" ? { ...c, ...patch } : c,
              ),
            }
          : go,
      ),
    );

  const boardSlots = groups[groupIndex]?.boards[boardIndex]?.slots ?? [];

  useEffect(() => {
    const slots = groups[groupIndex]?.boards[boardIndex]?.slots ?? [];
    setGameObjects((prev) =>
      prev.map((go) => {
        if (go.id === CONTROLLER_ID) {
          return {
            ...go,
            components: go.components.map((c) =>
              c.type === "controller" ? { ...c, cursor: -1 } : c,
            ),
          };
        }
        if (SLOT_IDS.includes(go.id)) {
          return {
            ...go,
            components: go.components.map((c) =>
              c.type === "slot" ? { ...c, status: "none" } : c,
            ),
          };
        }
        const qIndex = QUESTION_IDS.indexOf(go.id);
        if (qIndex !== -1) {
          const text = slots[qIndex]?.question ?? "";
          return {
            ...go,
            active: false,
            components: go.components.map((c) =>
              c.type === "text" ? { ...c, text } : c,
            ),
          };
        }
        const aIndex = ANSWER_IDS.indexOf(go.id);
        if (aIndex !== -1) {
          const text = slots[aIndex]?.answer ?? "";
          return {
            ...go,
            active: false,
            components: go.components.map((c) =>
              c.type === "text" ? { ...c, text } : c,
            ),
          };
        }
        return go;
      }),
    );
  }, [groupIndex, boardIndex, fileName, setGameObjects]);

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
    patchGameObject(QUESTION_IDS[next], { active: true });
    patchController({ cursor: next });
  };

  const selectBackSlot = () => {
    if (cursor < 0) return;
    patchGameObject(QUESTION_IDS[cursor], { active: false });
    patchGameObject(ANSWER_IDS[cursor], { active: false });
    patchSlot(SLOT_IDS[cursor], { status: "none" });
    patchController({ cursor: cursor - 1 });
  };

  const playSequence = (anim: "bounce" | "slide", delayMs = 100) =>
    SLOT_IDS.forEach((id, i) =>
      setTimeout(() => trigger(id, anim), i * delayMs),
    );

  const showCurrentAnswer = () => {
    if (cursor < 0) return;
    patchGameObject(ANSWER_IDS[cursor], { active: true });
    patchSlot(SLOT_IDS[cursor], { status: "correct" });
    if (correctUrl) playSound(correctUrl);
    trigger(SLOT_IDS[cursor], "pop");
  };

  const markCurrentError = () => {
    if (cursor < 0) return;
    patchSlot(SLOT_IDS[cursor], { status: "incorrect" });
    if (incorrectUrl) playSound(incorrectUrl);
    trigger(SLOT_IDS[cursor], "shake");
  };

  const clearCurrent = () => {
    if (cursor < 0) return;
    patchSlot(SLOT_IDS[cursor], { status: "none" });
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
