"use client";

import { useEffect, useCallback, useState } from "react";
import { SpellCheck } from "lucide-react";
import { loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";

import { FullScreen } from "@/components/shared/FullScreen";
import {
  Transform,
  TransformValues,
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
} from "@/components/shared/Transform";

interface DeletreoGroup {
  words: string[];
}

interface DeletreoData {
  groups: DeletreoGroup[];
}

function ControlRow({
  label,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-3">
      <span className="w-16 text-xs font-mono text-slate-600">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="flex-1 accent-slate-800"
      />
      <span className="w-14 text-right text-xs font-mono text-slate-800">
        {value}
      </span>
    </label>
  );
}

export default function DeletreoPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [words, setWords] = useState<string[]>([]);
  const [index, setIndex] = useState(0);

  const [transform, setTransform] = useState<TransformValues>({
    position: { x: DESIGN_WIDTH / 2, y: DESIGN_HEIGHT / 2 },
    size: { x: 1200, y: 300 },
    pivot: { x: 0.5, y: 0.5 },
  });

  const setAxis =
    (field: keyof TransformValues, axis: "x" | "y") => (value: number) =>
      setTransform((t) => ({ ...t, [field]: { ...t[field], [axis]: value } }));

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
      <FullScreen background={{ type: "color", value: "#00B140" }}>
        <Transform
          position={transform.position}
          size={transform.size}
          pivot={transform.pivot}
          className="border-2 border-dashed border-white/40"
        >
          <div className="w-full h-full flex items-center justify-center text-[10cqi] font-black uppercase text-white tracking-[2cqi]">
            {word}
          </div>
        </Transform>
      </FullScreen>

      {/* Controles temporales externos */}
      <div className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <h3 className="font-bold text-slate-700">Palabra:</h3>
          <button
            onClick={nextWord}
            className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors"
          >
            Cambiar Palabra
          </button>
          <span className="text-sm text-slate-500">
            {words.length > 0 ? `${index + 1} / ${words.length}` : "Sin datos"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
          <ControlRow label="Pos X" min={0} max={DESIGN_WIDTH} step={1} value={transform.position.x} onChange={setAxis("position", "x")} />
          <ControlRow label="Pos Y" min={0} max={DESIGN_HEIGHT} step={1} value={transform.position.y} onChange={setAxis("position", "y")} />
          <ControlRow label="Width" min={0} max={DESIGN_WIDTH} step={1} value={transform.size.x} onChange={setAxis("size", "x")} />
          <ControlRow label="Height" min={0} max={DESIGN_HEIGHT} step={1} value={transform.size.y} onChange={setAxis("size", "y")} />
          <ControlRow label="Pivot X" min={0} max={1} step={0.05} value={transform.pivot.x} onChange={setAxis("pivot", "x")} />
          <ControlRow label="Pivot Y" min={0} max={1} step={0.05} value={transform.pivot.y} onChange={setAxis("pivot", "y")} />
        </div>
      </div>
    </main>
  );
}
