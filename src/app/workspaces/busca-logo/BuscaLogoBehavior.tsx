"use client";

import { useEffect, useRef } from "react";
import { useAnimations } from "@engine/animations/AnimationsContext";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { useGameSession } from "@/hooks/use-game-session";
import { useGameKeys } from "@/hooks/use-game-keys";
import { ControllerComponent } from "./components/controller/controllerComponent";
import type { BuscaLogoSession } from "./session";
import {
  BOARD_SIZE,
  LEVEL0_ID,
  LEVEL0_MESSAGE_ID,
  LEVEL2_ID,
  CARD_COUNT,
  CARD_IDS,
  CARD_BACK_IDS,
  CARD_FRONT_IDS,
  CARD_NORMAL_IDS,
  CARD_SELECTED_IDS,
  CARD_LOCKED_IDS,
  CARD_EMPTY_IDS,
  CARD_LOGO_IDS,
} from "./constants";

const NO_LOCKS = Array.from({ length: CARD_COUNT }, () => false);

export function BuscaLogoBehavior() {
  const runtime = useSceneRuntime((s) => s.runtime);
  const patchComponent = useSceneRuntime((s) => s.patchComponent);
  const setActive = useSceneRuntime((s) => s.setActive);
  const { play } = useAnimations();
  const flippingRef = useRef(new Set<number>());

  const session = useGameSession((s) => s.session) as BuscaLogoSession | null;
  const fileName = useGameSession((s) => s.fileName);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const controller = runtime[LEVEL2_ID]?.components?.controller as
    | Partial<ControllerComponent>
    | undefined;
  const boards = session?.boards ?? [];
  const boardIndex = controller?.boardIndex ?? 0;
  const selected = controller?.selected ?? -1;
  const locked = controller?.locked ?? NO_LOCKS;

  const patchController = (patch: Partial<ControllerComponent>) =>
    patchComponent(LEVEL2_ID, "controller", patch);

  useEffect(() => {
    patchComponent(LEVEL2_ID, "controller", {
      boardIndex: 0,
      selected: -1,
      locked: NO_LOCKS,
      fileName: fileName ?? undefined,
      loadedAt,
    });
  }, [loadedAt, patchComponent]);

  useEffect(() => {
    const board = boards[boardIndex];
    const supported = board?.size === BOARD_SIZE;
    setActive(LEVEL2_ID, !board || supported);
    setActive(LEVEL0_ID, !!board && !supported);
    if (board && !supported) {
      patchComponent(LEVEL0_MESSAGE_ID, "text", {
        text: `Tablero ${boardIndex + 1} · formato ${board.size}\nNo disponible: solo está implementado ${BOARD_SIZE}`,
      });
    }

    const logos = new Set(board?.logoPositions ?? []);
    for (let i = 0; i < CARD_COUNT; i++) {
      setActive(CARD_BACK_IDS[i], true);
      setActive(CARD_FRONT_IDS[i], false);
      setActive(CARD_EMPTY_IDS[i], !logos.has(i));
      setActive(CARD_LOGO_IDS[i], logos.has(i));
    }
    patchController({ selected: -1, locked: NO_LOCKS });
  }, [boardIndex, loadedAt, patchComponent, setActive]);

  useEffect(() => {
    for (let i = 0; i < CARD_COUNT; i++) {
      const isLocked = locked[i] === true;
      setActive(CARD_LOCKED_IDS[i], isLocked);
      setActive(CARD_SELECTED_IDS[i], !isLocked && selected === i);
      setActive(CARD_NORMAL_IDS[i], !isLocked && selected !== i);
    }
  }, [selected, locked, setActive]);

  const selectBoard = (n: number) => {
    const i = n - 1;
    if (i < 0 || i >= boards.length) return;
    patchController({ boardIndex: i });
  };

  const nextBoard = () => {
    if (boardIndex >= boards.length - 1) return;
    patchController({ boardIndex: boardIndex + 1 });
  };

  const clearBoard = () => patchController({ selected: -1, locked: NO_LOCKS });

  const toggleLock = (i: number) => {
    if (i < 0) return;
    const next = [...locked];
    next[i] = !next[i];
    patchController({ locked: next });
  };

  const flipCard = async (i: number, up: boolean) => {
    if (i < 0 || flippingRef.current.has(i)) return;
    if ((runtime[CARD_FRONT_IDS[i]]?.active === true) === up) return;
    flippingRef.current.add(i);
    try {
      await play(CARD_IDS[i], "flipHide");
      setActive(CARD_BACK_IDS[i], !up);
      setActive(CARD_FRONT_IDS[i], up);
      await play(CARD_IDS[i], "flipShow");
    } finally {
      flippingRef.current.delete(i);
    }
  };

  const flipAll = (up: boolean) => {
    for (let i = 0; i < CARD_COUNT; i++) void flipCard(i, up);
  };

  useGameKeys({
    onNavigate: selectBoard,
    onNext: nextBoard,
    onInteract: () => void flipCard(selected, true),
    onBack: () => void flipCard(selected, false),
    onClear: clearBoard,
  });

  const extraKeysRef = useRef({ toggleLock, flipAll, selected });
  extraKeysRef.current = { toggleLock, flipAll, selected };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;

      const h = extraKeysRef.current;
      if (e.code === "KeyL" && !e.shiftKey) {
        e.preventDefault();
        h.toggleLock(h.selected);
      } else if (e.code === "KeyU" && e.shiftKey) {
        e.preventDefault();
        h.flipAll(true);
      } else if (e.code === "KeyI" && e.shiftKey) {
        e.preventDefault();
        h.flipAll(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
