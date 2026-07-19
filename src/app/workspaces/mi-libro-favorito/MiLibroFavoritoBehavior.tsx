"use client";

import { useEffect } from "react";
import { useAssets } from "@engine/assetsContext";
import { useAnimations } from "@engine/animations/AnimationsContext";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { useGameSession } from "@/hooks/use-game-session";
import { useGameKeys } from "@/hooks/use-game-keys";
import { playSound } from "@/lib/audio";
import {
  ControllerComponent,
  type MiLibroData,
} from "./components/controller/controllerComponent";
import {
  LEVEL_ID,
  QUESTION_FRAME_ID,
  QUESTION_TEXT_ID,
  PLAYER_COUNT,
  MAX_HEART_SLOTS,
  CONTENT_IDS,
  NAME_TEXT_IDS,
  HEART_SLOT_IDS,
  HEART_ROOT_IDS,
  FULL_HEART_IDS,
  BROKEN_HEART_IDS,
  HEART_SLOT_Y,
  HEART_HIDDEN_Y,
  QUESTION_HIDDEN_Y,
  CONTENT_HIDDEN_X,
  heartSlotX,
} from "./constants";

export function MiLibroFavoritoBehavior() {
  const { assets } = useAssets();
  const { play, playStagger } = useAnimations();
  const runtime = useSceneRuntime((s) => s.runtime);
  const patchComponent = useSceneRuntime((s) => s.patchComponent);
  const setActive = useSceneRuntime((s) => s.setActive);
  const setTransform = useSceneRuntime((s) => s.setTransform);

  const correctUrl = assets.correct?.url;
  const incorrectUrl = assets.incorrect?.url;

  const session = useGameSession((s) => s.session) as MiLibroData | null;
  const fileName = useGameSession((s) => s.fileName);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const controller = runtime[LEVEL_ID]?.components?.controller as
    | Partial<ControllerComponent>
    | undefined;
  const groups = session?.groups ?? [];
  const players = session?.players ?? [];
  const groupIndex = controller?.groupIndex ?? 0;
  const slotIndex = controller?.slotIndex ?? 0;
  const selectedPlayer = controller?.selectedPlayer ?? 0;
  const lives = controller?.lives ?? [];
  const slots = groups[groupIndex]?.slots ?? [];
  const slot = slots[slotIndex];

  const maxHealth = (side: number) =>
    Math.min(players[side]?.maxHealth ?? 0, MAX_HEART_SLOTS);

  const patchController = (patch: Partial<ControllerComponent>) =>
    patchComponent(LEVEL_ID, "controller", patch);

  useEffect(() => {
    if (!session) return;
    const data = session as MiLibroData;
    patchComponent(LEVEL_ID, "controller", {
      players: data.players,
      groups: data.groups,
      groupIndex: 0,
      slotIndex: 0,
      selectedPlayer: 0,
      lives: Array.from({ length: PLAYER_COUNT }, (_, side) =>
        Math.min(data.players[side]?.maxHealth ?? 0, MAX_HEART_SLOTS),
      ),
      fileName: fileName ?? undefined,
    });
    patchComponent(QUESTION_TEXT_ID, "text", {
      text: data.groups[0]?.slots[0]?.question ?? "",
    });
    setTransform(QUESTION_FRAME_ID, {
      position: { x: 0, y: QUESTION_HIDDEN_Y },
    });
    for (let side = 0; side < PLAYER_COUNT; side++) {
      const max = Math.min(
        data.players[side]?.maxHealth ?? 0,
        MAX_HEART_SLOTS,
      );
      patchComponent(NAME_TEXT_IDS[side], "text", {
        text: data.players[side]?.playerName ?? "",
      });
      setTransform(CONTENT_IDS[side], {
        position: { x: CONTENT_HIDDEN_X[side], y: 0 },
      });
      for (let i = 0; i < MAX_HEART_SLOTS; i++) {
        setActive(HEART_SLOT_IDS[side][i], i < max);
        setTransform(HEART_SLOT_IDS[side][i], {
          position: { x: heartSlotX(i, max), y: HEART_SLOT_Y },
        });
        setTransform(HEART_ROOT_IDS[side][i], {
          position: { x: 0, y: HEART_HIDDEN_Y },
        });
        setActive(FULL_HEART_IDS[side][i], true);
        setActive(BROKEN_HEART_IDS[side][i], false);
      }
    }
  }, [loadedAt, session, fileName, patchComponent, setActive, setTransform]);

  const showSlot = (g: number, i: number) => {
    const target = groups[g]?.slots[i];
    if (!target) return;
    patchController({ groupIndex: g, slotIndex: i });
    patchComponent(QUESTION_TEXT_ID, "text", { text: target.question });
    play(QUESTION_FRAME_ID, "slide");
  };

  const showAnswer = () => {
    if (!slot) return;
    patchComponent(QUESTION_TEXT_ID, "text", { text: slot.answer });
    play(QUESTION_FRAME_ID, "pop");
    if (correctUrl) playSound(correctUrl);
  };

  const markError = () => {
    if (!slot) return;
    patchComponent(QUESTION_TEXT_ID, "text", { text: slot.answer });
    play(QUESTION_FRAME_ID, "shake");
    if (incorrectUrl) playSound(incorrectUrl);
  };

  const activeRoots = (side: number) =>
    HEART_ROOT_IDS[side].slice(0, maxHealth(side));

  const enterBanner = (side: number) => {
    play(CONTENT_IDS[side], "bounce");
    window.setTimeout(() => playStagger(activeRoots(side), "bounce", 200), 230);
  };

  const exitBanner = (side: number) => {
    play(CONTENT_IDS[side], "slide");
    window.setTimeout(() => {
      for (const rootId of activeRoots(side)) {
        setTransform(rootId, { position: { x: 0, y: HEART_HIDDEN_Y } });
      }
    }, 200);
  };

  const selectPlayer = (side: number) => {
    patchController({ selectedPlayer: side });
    enterBanner(side);
    exitBanner(1 - side);
  };

  const addLife = () => {
    const current = lives[selectedPlayer] ?? 0;
    if (current >= maxHealth(selectedPlayer)) return;
    setActive(FULL_HEART_IDS[selectedPlayer][current], true);
    setActive(BROKEN_HEART_IDS[selectedPlayer][current], false);
    patchController({
      lives: lives.map((l, s) => (s === selectedPlayer ? l + 1 : l)),
    });
  };

  const removeLife = () => {
    const index = (lives[selectedPlayer] ?? 0) - 1;
    if (index < 0) return;
    patchController({
      lives: lives.map((l, s) => (s === selectedPlayer ? l - 1 : l)),
    });
    const rootId = HEART_ROOT_IDS[selectedPlayer][index];
    setActive(FULL_HEART_IDS[selectedPlayer][index], true);
    setActive(BROKEN_HEART_IDS[selectedPlayer][index], false);
    play(rootId, "blink").then(() => {
      setActive(FULL_HEART_IDS[selectedPlayer][index], false);
      setActive(BROKEN_HEART_IDS[selectedPlayer][index], true);
      play(rootId, "blinkSettle");
    });
  };

  useGameKeys({
    onNumber: (n) => showSlot(groupIndex, n),
    onNavigate: (n) => showSlot(n, 0),
    onNext: () => showSlot(groupIndex, slotIndex + 1),
    onBack: () => showSlot(groupIndex, slotIndex - 1),
    onInteract: () => play(QUESTION_FRAME_ID, "bounce"),
    onClear: () => play(QUESTION_FRAME_ID, "slide"),
    onShowAnswer: showAnswer,
    onMarkError: markError,
    onArrowLeft: () => selectPlayer(0),
    onArrowRight: () => selectPlayer(1),
    onArrowUp: () => {
      enterBanner(0);
      enterBanner(1);
    },
    onArrowDown: () => {
      exitBanner(0);
      exitBanner(1);
    },
    onPlus: addLife,
    onMinus: removeLife,
  });

  return null;
}
