"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { SpellCheck, Settings, Frame, Move, Eye, EyeOff } from "lucide-react";
import { loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";

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

  const [words, setWords] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  const [background, setBackground] = useState<FullScreenBackground>({
    type: "color",
    value: "#00B140",
  });
  const [editMode, setEditMode] = useState(false);
  const [showGuides, setShowGuides] = useState(false);

  const [transform, setTransform] = useState<TransformValues>({
    position: { x: DESIGN_WIDTH / 2, y: DESIGN_HEIGHT / 2 },
    size: { x: 1400, y: 244 },
    pivot: { x: 0.5, y: 0.5 },
  });

  const setAxis =
    (field: keyof TransformValues, axis: keyof Vec2) => (value: number) =>
      setTransform((t) => ({ ...t, [field]: { ...t[field], [axis]: value } }));

  const stageRef = useRef<HTMLDivElement>(null);
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

  const endGesture = useCallback(() => {
    gestureRef.current = null;
    window.removeEventListener("pointermove", onGestureMove);
    window.removeEventListener("pointerup", endGesture);
  }, [onGestureMove]);

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
      window.addEventListener("pointermove", onGestureMove);
      window.addEventListener("pointerup", endGesture);
    },
    [onGestureMove, endGesture],
  );

  useEffect(() => {
    return () => {
      window.removeEventListener("pointermove", onGestureMove);
      window.removeEventListener("pointerup", endGesture);
    };
  }, [onGestureMove, endGesture]);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const isValid = (data: unknown): data is DeletreoData =>
        typeof data === "object" &&
        data !== null &&
        "groups" in data &&
        Array.isArray((data as DeletreoData).groups) &&
        (data as DeletreoData).groups.every((g) => Array.isArray(g.words));

      const data = await loadJsonFile<DeletreoData>(file, isValid);
      setWords(data.groups.flatMap((g) => g.words));
      setIndex(0);
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

  const word = words[index] ?? "DELETREO";

  const nextWord = () => {
    if (words.length === 0) return;
    setIndex((i) => (i + 1) % words.length);
  };

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
            <div className="w-full h-full flex items-center justify-center text-[6cqi] font-black uppercase text-white tracking-[1.5cqi]">
              {word}
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
          {/* Palabra */}
          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-slate-500">
              <SpellCheck size={14} className="text-slate-400" />
              Palabra
            </span>
            <button
              onClick={nextWord}
              className="w-fit rounded-md bg-slate-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Cambiar palabra
            </button>
            <span className="text-sm text-slate-500">
              {words.length > 0
                ? `${index + 1} / ${words.length}`
                : "Sin datos"}
            </span>
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
        </div>
      </div>
    </main>
  );
}
