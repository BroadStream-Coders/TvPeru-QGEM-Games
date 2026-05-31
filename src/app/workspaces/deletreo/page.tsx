"use client";

import { useEffect, useCallback } from "react";
import { SpellCheck } from "lucide-react";
import { loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";

import { FullScreen } from "@/components/shared/FullScreen";

interface DeletreoGroup {
  words: string[];
}

interface DeletreoData {
  groups: DeletreoGroup[];
}

export default function DeletreoPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const handleLoad = useCallback(async (file: File) => {
    try {
      const isValid = (data: unknown): data is DeletreoData =>
        typeof data === "object" &&
        data !== null &&
        "groups" in data &&
        Array.isArray((data as DeletreoData).groups) &&
        (data as DeletreoData).groups.every((g) => Array.isArray(g.words));

      const data = await loadJsonFile<DeletreoData>(file, isValid);
      console.log(data);
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

  return (
    <main className="flex-1 p-6 overflow-hidden flex flex-col gap-6">
      <FullScreen className="bg-slate-950">
        <div className="w-full h-full flex flex-col items-center justify-center gap-8 relative text-white">
          {/* Fondo de prueba con cuadros de colores */}
          <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-20 pointer-events-none">
            <div className="bg-red-500"></div>
            <div className="bg-blue-500"></div>
            <div className="bg-green-500"></div>
            <div className="bg-yellow-500"></div>
          </div>

          <h1 className="text-[8cqi] font-black z-10 drop-shadow-lg tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
            DELETREO
          </h1>

          <div className="flex gap-4 z-10">
            {["A", "B", "C", "D"].map((letter) => (
              <div
                key={letter}
                className="w-[10cqi] h-[10cqi] bg-white text-black flex items-center justify-center text-[6cqi] font-bold rounded-xl shadow-2xl border-4 border-slate-300"
              >
                {letter}
              </div>
            ))}
          </div>

          <p className="z-10 text-[3cqi] font-medium text-slate-300 mt-10">
            Fondo por defecto. Ingresa a pantalla completa.
          </p>
        </div>
      </FullScreen>

      {/* Controles temporales externos */}
      <div className="w-full border border-slate-200 rounded-xl p-4 bg-slate-50 flex gap-4 items-center">
        <h3 className="font-bold text-slate-700">Controles Temporales:</h3>
        <button className="px-4 py-2 bg-slate-800 text-white rounded hover:bg-slate-700 transition-colors">
          Cambiar Letra
        </button>
      </div>
    </main>
  );
}
