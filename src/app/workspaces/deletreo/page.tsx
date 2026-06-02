"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import {
  SpellCheck,
  Settings,
  Frame,
  Move,
  Eye,
  EyeOff,
  Type,
} from "lucide-react";
import { loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useGameKeys } from "@/hooks/use-game-keys";
import { jetBrainsMono } from "@/lib/fonts";

const CORRECT_ANSWER_SRC = "/audio/correct_answer.mp3";

import mainFrame from "./graphics/mainFrame.png";

import {
  FullScreen,
  FullScreenBackground,
} from "@/components/shared/FullScreen";
import { BackgroundConfig } from "@/components/shared/BackgroundConfig";
import {
  Transform,
  TransformValues,
  Vec2,
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
} from "@/components/shared/Transform";

interface DeletreoGroup {
  words: string[];
}

interface DeletreoData {
  groups: DeletreoGroup[];
}

function NumberField({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-mono text-slate-800 focus:border-slate-500 focus:outline-none"
      />
    </label>
  );
}

const KEY_LEGEND: { keys: string; label: string }[] = [
  { keys: "Num 0-9", label: "Elegir grupo" },
  { keys: "0-9", label: "Elegir slot (Shift +10)" },
  { keys: "N / B", label: "Slot siguiente / anterior" },
  { keys: "M", label: "Mostrar respuesta" },
  { keys: "F", label: "Marcar error" },
  { keys: "E", label: "Interacción" },
];

type Handle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

const HANDLES: { h: Handle; pos: string; cursor: string }[] = [
  { h: "nw", pos: "left-0 top-0", cursor: "cursor-nwse-resize" },
  { h: "n", pos: "left-1/2 top-0", cursor: "cursor-ns-resize" },
  { h: "ne", pos: "left-full top-0", cursor: "cursor-nesw-resize" },
  { h: "e", pos: "left-full top-1/2", cursor: "cursor-ew-resize" },
  { h: "se", pos: "left-full top-full", cursor: "cursor-nwse-resize" },
  { h: "s", pos: "left-1/2 top-full", cursor: "cursor-ns-resize" },
  { h: "sw", pos: "left-0 top-full", cursor: "cursor-nesw-resize" },
  { h: "w", pos: "left-0 top-1/2", cursor: "cursor-ew-resize" },
];

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
  const correctAudioRef = useRef<HTMLAudioElement | null>(null);

  const playCorrect = () => {
    if (!correctAudioRef.current) {
      correctAudioRef.current = new Audio(CORRECT_ANSWER_SRC);
    }
    correctAudioRef.current.currentTime = 0;
    correctAudioRef.current.play().catch(() => {});
  };

  const setOffset = (axis: keyof Vec2) => (value: number) =>
    setTextConfig((c) => ({ ...c, offset: { ...c.offset, [axis]: value } }));

  const setAxis =
    (field: keyof TransformValues, axis: keyof Vec2) => (value: number) =>
      setTransform((t) => ({ ...t, [field]: { ...t[field], [axis]: value } }));

  const stageRef = useRef<HTMLDivElement>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const gestureRef = useRef<{
    handle: Handle | "move";
    clientX: number;
    clientY: number;
    left: number;
    top: number;
    right: number;
    bottom: number;
    pivot: Vec2;
  } | null>(null);

  const onGestureMove = useCallback((e: PointerEvent) => {
    const g = gestureRef.current;
    const stage = stageRef.current;
    if (!g || !stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const dx = ((e.clientX - g.clientX) * DESIGN_WIDTH) / rect.width;
    const dy = ((e.clientY - g.clientY) * DESIGN_HEIGHT) / rect.height;

    let left = g.left;
    let top = g.top;
    let right = g.right;
    let bottom = g.bottom;

    if (g.handle === "move") {
      left += dx;
      right += dx;
      top += dy;
      bottom += dy;
    } else {
      if (g.handle.includes("w")) left = g.left + dx;
      if (g.handle.includes("e")) right = g.right + dx;
      if (g.handle.includes("n")) top = g.top + dy;
      if (g.handle.includes("s")) bottom = g.bottom + dy;
      const MIN = 20;
      if (right - left < MIN) {
        if (g.handle.includes("w")) left = right - MIN;
        else right = left + MIN;
      }
      if (bottom - top < MIN) {
        if (g.handle.includes("n")) top = bottom - MIN;
        else bottom = top + MIN;
      }
    }

    const w = right - left;
    const h = bottom - top;
    setTransform((t) => ({
      ...t,
      position: {
        x: Math.round(left + g.pivot.x * w),
        y: Math.round(top + g.pivot.y * h),
      },
      size: { x: Math.round(w), y: Math.round(h) },
    }));
  }, []);

  const beginGesture = useCallback(
    (handle: Handle | "move", e: React.PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setTransform((t) => {
        const left = t.position.x - t.pivot.x * t.size.x;
        const top = t.position.y - t.pivot.y * t.size.y;
        gestureRef.current = {
          handle,
          clientX: e.clientX,
          clientY: e.clientY,
          left,
          top,
          right: left + t.size.x,
          bottom: top + t.size.y,
          pivot: { ...t.pivot },
        };
        return t;
      });
      const endGesture = () => {
        gestureRef.current = null;
        window.removeEventListener("pointermove", onGestureMove);
        window.removeEventListener("pointerup", endGesture);
        cleanupRef.current = null;
      };
      cleanupRef.current = endGesture;
      window.addEventListener("pointermove", onGestureMove);
      window.addEventListener("pointerup", endGesture);
    },
    [onGestureMove],
  );

  useEffect(() => {
    return () => cleanupRef.current?.();
  }, []);

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
  const word = currentGroup[slotIndex] ?? "";

  const selectGroup = (n: number) => {
    if (n < 0 || n >= groups.length) return;
    setGroupIndex(n);
    setSlotIndex(0);
    setSpellStep(0);
  };

  const selectSlot = (n: number) => {
    if (n < 0 || n >= currentGroup.length) return;
    setSlotIndex(n);
    setSpellStep(0);
  };

  const nextSlot = () => {
    setSlotIndex((i) => Math.min(i + 1, currentGroup.length - 1));
    setSpellStep(0);
  };

  const prevSlot = () => {
    setSlotIndex((i) => Math.max(i - 1, 0));
    setSpellStep(0);
  };

  useGameKeys({
    onNumber: selectSlot,
    onNavigate: selectGroup,
    onNext: nextSlot,
    onBack: prevSlot,
    onShowAnswer: () => {
      setSpellStep(word.length);
      playCorrect();
    },
    onMarkError: () => console.log("[deletreo] marcar error (F)"),
    onInteract: () => setSpellStep((s) => Math.min(s + 1, word.length)),
  });

  return (
    <main className="flex-1 p-6 overflow-auto flex flex-col gap-6">
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
            style={{
              backgroundImage: `url(${mainFrame.src})`,
              backgroundSize: "100% 100%",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div
              className={`${jetBrainsMono.className} w-full h-full flex items-center justify-center font-black uppercase leading-none text-white`}
              style={{
                fontSize: `${(textConfig.fontSize / DESIGN_WIDTH) * 100}cqw`,
                gap: `${(textConfig.letterSpacing / DESIGN_WIDTH) * 100}cqw`,
                transform: `translate(${(textConfig.offset.x / DESIGN_WIDTH) * 100}cqw, ${(textConfig.offset.y / DESIGN_HEIGHT) * 100}cqh)`,
              }}
            >
              {word.split("").map((char, i) => (
                <span
                  key={i}
                  className="inline-flex flex-col items-center leading-none"
                >
                  <span className="leading-none">{char}</span>
                  <span
                    className="bg-current"
                    style={{
                      marginTop: `${textConfig.underlineGap / 100}em`,
                      width: "0.7em",
                      height: "0.09em",
                      opacity: i < spellStep ? 1 : 0,
                    }}
                  />
                </span>
              ))}
            </div>
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

      {/* Config */}
      <div className="border border-slate-200 rounded-xl bg-slate-50">
        <div className="border-b border-slate-200 px-4 py-3">
          <h3 className="flex items-center gap-2 font-bold text-slate-700">
            <Settings size={16} className="text-slate-400" />
            Config
          </h3>
        </div>

        <div className="p-4 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado */}
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-slate-500">
              <SpellCheck size={14} className="text-slate-400" />
              Estado
            </span>
            <span className="text-sm font-semibold text-slate-700">
              {groups.length > 0
                ? `Grupo ${groupIndex + 1}/${groups.length} · Slot ${slotIndex + 1}/${currentGroup.length}`
                : "Sin datos"}
            </span>

            <span className="mt-1 text-2xs font-mono uppercase tracking-wider text-slate-500">
              Teclas
            </span>
            <ul className="flex flex-col gap-1 text-xs text-slate-600">
              {KEY_LEGEND.map((k) => (
                <li key={k.keys} className="flex items-center gap-2">
                  <kbd className="min-w-10 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center font-mono text-2xs text-slate-700">
                    {k.keys}
                  </kbd>
                  <span>{k.label}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fondo */}
          <BackgroundConfig value={background} onChange={setBackground} />

          {/* Posición */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-slate-500">
                <Frame size={14} className="text-slate-400" />
                Posición
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowGuides((v) => !v)}
                  title={showGuides ? "Ocultar guías" : "Mostrar guías"}
                  className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
                    showGuides
                      ? "bg-brand text-white"
                      : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {showGuides ? <Eye size={14} /> : <EyeOff size={14} />}
                </button>
                <button
                  onClick={() => setEditMode((v) => !v)}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                    editMode
                      ? "bg-brand text-white"
                      : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Move size={14} />
                  Editar
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Pos X"
                value={transform.position.x}
                onChange={setAxis("position", "x")}
              />
              <NumberField
                label="Pos Y"
                value={transform.position.y}
                onChange={setAxis("position", "y")}
              />
              <NumberField
                label="Width"
                value={transform.size.x}
                onChange={setAxis("size", "x")}
              />
              <NumberField
                label="Height"
                value={transform.size.y}
                onChange={setAxis("size", "y")}
              />
            </div>
          </div>

          {/* Texto */}
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-slate-500">
              <Type size={14} className="text-slate-400" />
              Texto
            </span>
            <div className="grid grid-cols-2 gap-3">
              <NumberField
                label="Tamaño"
                value={textConfig.fontSize}
                onChange={(fontSize) =>
                  setTextConfig((c) => ({ ...c, fontSize }))
                }
              />
              <NumberField
                label="Espaciado"
                value={textConfig.letterSpacing}
                onChange={(letterSpacing) =>
                  setTextConfig((c) => ({ ...c, letterSpacing }))
                }
              />
              <NumberField
                label="Offset X"
                value={textConfig.offset.x}
                onChange={setOffset("x")}
              />
              <NumberField
                label="Offset Y"
                value={textConfig.offset.y}
                onChange={setOffset("y")}
              />
              <NumberField
                label="Subrayado ↕"
                value={textConfig.underlineGap}
                onChange={(underlineGap) =>
                  setTextConfig((c) => ({ ...c, underlineGap }))
                }
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
