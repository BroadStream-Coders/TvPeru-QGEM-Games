"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { SpellCheck } from "lucide-react";
import { loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useGameKeys } from "@/hooks/use-game-keys";
import { useTransformGesture, HANDLES } from "@/hooks/use-transform-gesture";
import { SOUNDS, playSound } from "@/lib/audio";

import {
  FullScreen,
  FullScreenBackground,
} from "@/components/shared/FullScreen";
import { BackgroundConfig } from "@/components/shared/BackgroundConfig";
import { Transform, TransformValues, Vec2 } from "@/components/shared/Transform";
import { SpellFrame } from "./components/SpellFrame";
import { StatusCard } from "./components/StatusCard";
import { LegendCard } from "./components/LegendCard";
import { PositionCard } from "./components/PositionCard";
import { TextCard } from "./components/TextCard";

interface DeletreoGroup {
  words: string[];
}

interface DeletreoData {
  groups: DeletreoGroup[];
}

export default function DeletreoPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [groups, setGroups] = useState<string[][]>([]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [slotIndex, setSlotIndex] = useState(0);

  const [background, setBackground] = useState<FullScreenBackground>({
    type: "color",
    value: "#00B140",
  });
  const [editMode, setEditMode] = useState(false);
  const [showGuides, setShowGuides] = useState(false);

  const [transform, setTransform] = useState<TransformValues>({
    position: { x: 960, y: 907 },
    size: { x: 1170, y: 204 },
    pivot: { x: 0.5, y: 0.5 },
  });

  const [textConfig, setTextConfig] = useState({
    fontSize: 80,
    letterSpacing: 20,
    offset: { x: 0, y: 0 },
    underlineGap: 0,
  });

  const [spellStep, setSpellStep] = useState(0);
  const [errorMode, setErrorMode] = useState(false);
  const [manualText, setManualText] = useState("");

  const setAxis =
    (field: keyof TransformValues, axis: keyof Vec2) => (value: number) =>
      setTransform((t) => ({ ...t, [field]: { ...t[field], [axis]: value } }));

  const stageRef = useRef<HTMLDivElement>(null);
  const { beginGesture } = useTransformGesture({
    stageRef,
    getTransform: () => transform,
    onChange: ({ position, size }) =>
      setTransform((t) => ({ ...t, position, size })),
  });

  const handleLoad = useCallback(async (file: File) => {
    try {
      const isValid = (data: unknown): data is DeletreoData =>
        typeof data === "object" &&
        data !== null &&
        "groups" in data &&
        Array.isArray((data as DeletreoData).groups) &&
        (data as DeletreoData).groups.every((g) => Array.isArray(g.words));

      const data = await loadJsonFile<DeletreoData>(file, isValid);
      setGroups(data.groups.map((g) => g.words));
      setGroupIndex(0);
      setSlotIndex(0);
      setSpellStep(0);
      setErrorMode(false);
    } catch {
      console.error("Error al cargar el archivo JSON.");
    }
  }, []);

  useEffect(() => {
    return () => resetHeader();
  }, [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Deletreo",
      icon: <SpellCheck className="h-3 w-3" />,
      onLoad: handleLoad,
    });
  }, [setHeader, handleLoad]);

  const currentGroup = groups[groupIndex] ?? [];
  const word = manualText !== "" ? manualText : (currentGroup[slotIndex] ?? "");

  const selectGroup = (n: number) => {
    if (n < 0 || n >= groups.length) return;
    setGroupIndex(n);
    setSlotIndex(0);
    setSpellStep(0);
    setErrorMode(false);
  };

  const selectSlot = (n: number) => {
    if (n < 0 || n >= currentGroup.length) return;
    setSlotIndex(n);
    setSpellStep(0);
    setErrorMode(false);
  };

  const nextSlot = () => {
    setSlotIndex((i) => Math.min(i + 1, currentGroup.length - 1));
    setSpellStep(0);
    setErrorMode(false);
  };

  const prevSlot = () => {
    setSlotIndex((i) => Math.max(i - 1, 0));
    setSpellStep(0);
    setErrorMode(false);
  };

  useGameKeys({
    onNumber: selectSlot,
    onNavigate: selectGroup,
    onNext: nextSlot,
    onBack: prevSlot,
    onShowAnswer: () => {
      setSpellStep(word.length);
      setErrorMode(false);
      playSound(SOUNDS.correctAnswer);
    },
    onMarkError: () => {
      setErrorMode(true);
      playSound(SOUNDS.incorrectAnswer);
    },
    onInteract: () => setSpellStep((s) => Math.min(s + 1, word.length)),
  });

  return (
    <main className="flex-1 p-6 overflow-auto flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 min-w-0">
          <FullScreen background={background}>
            <div ref={stageRef} className="absolute inset-0">
              <Transform
                position={transform.position}
                size={transform.size}
                pivot={transform.pivot}
                className={
                  showGuides || editMode
                    ? "border-2 border-dashed border-white/60"
                    : undefined
                }
              >
                <SpellFrame
                  word={word}
                  spellStep={spellStep}
                  errorMode={errorMode}
                  textConfig={textConfig}
                />
                {editMode && (
                  <>
                    <div
                      onPointerDown={(e) => beginGesture("move", e)}
                      className="absolute inset-0 cursor-move touch-none select-none"
                    />
                    {HANDLES.map((hd) => (
                      <div
                        key={hd.h}
                        onPointerDown={(e) => beginGesture(hd.h, e)}
                        className={`absolute ${hd.pos} ${hd.cursor} h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-white touch-none`}
                      />
                    ))}
                  </>
                )}
              </Transform>
            </div>
          </FullScreen>
        </div>

        <div className="flex flex-col gap-4 lg:w-72 shrink-0">
          <StatusCard
            groups={groups}
            groupIndex={groupIndex}
            slotIndex={slotIndex}
          />
          <LegendCard />
        </div>
      </div>

      {/* Config */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <BackgroundConfig value={background} onChange={setBackground} />
        </div>
        <PositionCard
          transform={transform}
          setAxis={setAxis}
          showGuides={showGuides}
          onToggleGuides={() => setShowGuides((v) => !v)}
          editMode={editMode}
          onToggleEdit={() => setEditMode((v) => !v)}
        />
        <TextCard
          textConfig={textConfig}
          onChange={setTextConfig}
          manualText={manualText}
          onManualTextChange={setManualText}
        />
      </div>
    </main>
  );
}
