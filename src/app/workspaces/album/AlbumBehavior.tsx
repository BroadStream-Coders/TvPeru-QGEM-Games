"use client";

import { useEffect, useRef } from "react";
import { useAssets } from "@engine/assetsContext";
import { useAnimations } from "@engine/animations/AnimationsContext";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { useGameSession } from "@/hooks/use-game-session";
import { useGameKeys } from "@/hooks/use-game-keys";
import { playSound } from "@/lib/audio";
import { ControllerComponent } from "./components/controller/controllerComponent";
import type { AlbumSession } from "./session";
import { CARD_COLOR_KEYS } from "./assets";
import {
  ALBUM_ID,
  CARD_IDS,
  THEMES_ID,
  GAMEPLAY_ID,
  ROUND_TITLE_ID,
  CARD_COUNT,
  THEME_COUNT,
  CARD_BACK_IDS,
  CARD_FRONT_IDS,
  CARD_BACK_BG_IDS,
  CARD_FRONT_BG_IDS,
  CARD_QUESTION_IDS,
  CARD_PHOTO_IDS,
  CARD_PHOTO_COLOR_IDS,
  CARD_PHOTO_GRAY_IDS,
  THEME_NORMAL_IDS,
  THEME_LOCKED_IDS,
  THEME_NORMAL_TITLE_IDS,
  THEME_LOCKED_TITLE_IDS,
} from "./constants";

export function AlbumBehavior() {
  const { assets } = useAssets();
  const runtime = useSceneRuntime((s) => s.runtime);
  const patchComponent = useSceneRuntime((s) => s.patchComponent);
  const setActive = useSceneRuntime((s) => s.setActive);
  const { play } = useAnimations();
  const flippingRef = useRef(new Set<number>());

  const correctUrl = assets.correct?.url;
  const incorrectUrl = assets.incorrect?.url;

  const session = useGameSession((s) => s.session) as AlbumSession | null;
  const fileName = useGameSession((s) => s.fileName);
  const loadedAt = useGameSession((s) => s.loadedAt);

  const controller = runtime[ALBUM_ID]?.components?.controller as
    | Partial<ControllerComponent>
    | undefined;
  const rounds = session?.rounds ?? [];
  const roundIndex = controller?.roundIndex ?? 0;
  const cardIndex = controller?.cardIndex ?? 0;
  const view = controller?.view ?? "themes";
  const locked =
    controller?.locked ?? Array.from({ length: THEME_COUNT }, () => false);

  const patchController = (patch: Partial<ControllerComponent>) =>
    patchComponent(ALBUM_ID, "controller", patch);

  useEffect(() => {
    for (let i = 0; i < THEME_COUNT; i++) {
      const title = rounds[i]?.title ?? "";
      patchComponent(THEME_NORMAL_TITLE_IDS[i], "text", { text: title });
      patchComponent(THEME_LOCKED_TITLE_IDS[i], "text", { text: title });
      setActive(THEME_NORMAL_IDS[i], true);
      setActive(THEME_LOCKED_IDS[i], false);
    }
    patchComponent(ALBUM_ID, "controller", {
      roundIndex: 0,
      cardIndex: 0,
      view: "themes",
      locked: Array.from({ length: THEME_COUNT }, () => false),
      fileName: fileName ?? undefined,
      loadedAt,
    });
  }, [loadedAt, patchComponent, setActive]);

  useEffect(() => {
    setActive(THEMES_ID, view === "themes");
    setActive(GAMEPLAY_ID, view === "cards");
  }, [view, setActive]);

  useEffect(() => {
    const round = rounds[roundIndex];
    patchComponent(ROUND_TITLE_ID, "text", { text: round?.title ?? "" });
    const colorKey = CARD_COLOR_KEYS[roundIndex] ?? CARD_COLOR_KEYS[0];
    for (let i = 0; i < CARD_COUNT; i++) {
      const card = round?.cards[i];
      const bgKey = card?.isCroma ? "cardCroma" : colorKey;
      patchComponent(CARD_IDS[i], "holo", { enabled: !!card?.isCroma });
      patchComponent(CARD_PHOTO_COLOR_IDS[i], "sparkles", {
        enabled: !!card?.isCroma,
      });
      patchComponent(CARD_BACK_BG_IDS[i], "image", { assetKey: bgKey });
      patchComponent(CARD_FRONT_BG_IDS[i], "image", { assetKey: bgKey });
      patchComponent(CARD_QUESTION_IDS[i], "text", {
        text: card?.question ?? "",
      });
      patchComponent(CARD_PHOTO_COLOR_IDS[i], "image", {
        src: card?.imageUrl ?? "",
      });
      patchComponent(CARD_PHOTO_GRAY_IDS[i], "image", {
        src: card?.imageUrl ?? "",
      });
      setActive(CARD_BACK_IDS[i], true);
      setActive(CARD_FRONT_IDS[i], false);
      setActive(CARD_QUESTION_IDS[i], true);
      setActive(CARD_PHOTO_IDS[i], false);
      setActive(CARD_PHOTO_COLOR_IDS[i], true);
      setActive(CARD_PHOTO_GRAY_IDS[i], false);
    }
  }, [roundIndex, loadedAt, patchComponent, setActive]);

  const selectCard = (n: number) => {
    if (n < 0 || n >= CARD_COUNT) return;
    patchController({ cardIndex: n });
  };

  const selectTheme = (n: number) => {
    const i = n - 1;
    if (n === 0 || i >= THEME_COUNT || i >= rounds.length) return;
    patchController({ roundIndex: i, cardIndex: 0 });
  };

  const flipCard = async (i: number, up: boolean) => {
    if (flippingRef.current.has(i)) return;
    const isUp = runtime[CARD_FRONT_IDS[i]]?.active === true;
    if (isUp === up) return;
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

  const flipUp = (i: number) => {
    void flipCard(i, true);
  };

  const flipDown = (i: number) => {
    void flipCard(i, false);
  };

  const resetCard = (i: number) => {
    setActive(CARD_QUESTION_IDS[i], true);
    setActive(CARD_PHOTO_IDS[i], false);
  };

  const showPhoto = (i: number, gray: boolean) => {
    setActive(CARD_QUESTION_IDS[i], false);
    setActive(CARD_PHOTO_IDS[i], true);
    setActive(CARD_PHOTO_COLOR_IDS[i], !gray);
    setActive(CARD_PHOTO_GRAY_IDS[i], gray);
  };

  const toggleLock = () => {
    const next = [...locked];
    next[roundIndex] = !next[roundIndex];
    patchController({ locked: next });
    setActive(THEME_NORMAL_IDS[roundIndex], !next[roundIndex]);
    setActive(THEME_LOCKED_IDS[roundIndex], next[roundIndex]);
  };

  const allFaceUp = () => {
    for (let i = 0; i < CARD_COUNT; i++) {
      setTimeout(() => flipUp(i), i * 80);
    }
  };

  const allToColor = () => {
    for (let i = 0; i < CARD_COUNT; i++) showPhoto(i, false);
  };

  useGameKeys({
    onNumber: selectCard,
    onNavigate: selectTheme,
    onInsert: () => patchController({ view: "themes" }),
    onHome: () => patchController({ view: "cards" }),
    onInteract: () => flipUp(cardIndex),
    onBack: () => flipDown(cardIndex),
    onClear: () => resetCard(cardIndex),
    onShowAnswer: () => {
      showPhoto(cardIndex, false);
      if (correctUrl) playSound(correctUrl);
    },
    onMarkError: () => {
      showPhoto(cardIndex, true);
      if (incorrectUrl) playSound(incorrectUrl);
    },
  });

  const extraKeysRef = useRef({ toggleLock, allFaceUp, allToColor });
  extraKeysRef.current = { toggleLock, allFaceUp, allToColor };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;

      const h = extraKeysRef.current;
      if (e.code === "KeyL" && !e.shiftKey) {
        e.preventDefault();
        h.toggleLock();
      } else if (e.code === "KeyU" && e.shiftKey) {
        e.preventDefault();
        h.allFaceUp();
      } else if (e.code === "KeyI" && e.shiftKey) {
        e.preventDefault();
        h.allToColor();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}
