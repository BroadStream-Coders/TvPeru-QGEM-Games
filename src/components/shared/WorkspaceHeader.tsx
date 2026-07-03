"use client";

import Link from "next/link";
import { ArrowLeft, Play, Undo2, Redo2 } from "lucide-react";
import { FileActions } from "./FileActions";
import { AuthButton } from "./AuthButton";

import { useWorkspaceHeader } from "@/hooks/use-workspace-header";

// Grupos presentes pero ocultos por ahora — poner en true para mostrarlos.
const SHOW = { menus: false, history: false } as const;
const MENUS = ["File", "Edit", "Object", "Component", "Window", "Help"];

export function WorkspaceHeader() {
  const { title, icon, onLoad, onPlay } = useWorkspaceHeader();

  if (!title) return null;

  return (
    <header className="z-10 flex h-[34px] w-full shrink-0 items-center gap-0.5 border-b border-edge bg-gradient-to-b from-head to-[#202327] px-2 text-[12.5px]">
      {/* Volver — icono discreto, antes del brand */}
      <Link
        href="/"
        title="Volver"
        className="flex h-6 w-6 items-center justify-center rounded-md text-faint transition-colors hover:bg-elev hover:text-dim"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
      </Link>

      {/* A · brand */}
      <div className="mr-1 flex items-center gap-2 border-r border-line pr-3">
        {icon && (
          <div className="flex h-[18px] w-[18px] items-center justify-center rounded bg-acc-bg text-[11px] text-acc ring-1 ring-acc/15">
            {icon}
          </div>
        )}
        <span className="font-semibold tracking-[.2px] text-ink">{title}</span>
      </div>

      {/* B · menus (oculto) */}
      {SHOW.menus &&
        MENUS.map((m) => (
          <div
            key={m}
            className="cursor-default rounded-[5px] px-2.5 py-1 text-dim transition-colors hover:bg-elev hover:text-ink"
          >
            {m}
          </div>
        ))}

      <div className="flex-1" />

      {/* C · transport */}
      <div className="flex items-center gap-1.5">
        {onPlay && (
          <button
            onClick={onPlay}
            title="Pantalla completa"
            className="flex h-6 w-7 items-center justify-center rounded-md bg-acc text-white shadow-sm transition-colors hover:bg-acc-hover"
          >
            <Play className="h-3 w-3 fill-current" />
          </button>
        )}
        {onLoad && <FileActions onLoad={onLoad} />}
      </div>

      <div className="flex-1" />

      {/* E · history (oculto) */}
      {SHOW.history && (
        <div className="flex gap-0.5">
          <button
            title="Deshacer"
            className="flex h-[22px] w-[26px] items-center justify-center rounded-[5px] text-dim transition-colors hover:bg-elev hover:text-ink"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            title="Rehacer"
            className="flex h-[22px] w-[26px] items-center justify-center rounded-[5px] text-dim transition-colors hover:bg-elev hover:text-ink"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* separador + F · account */}
      <div className="mx-2 h-[18px] w-px bg-line" />
      <AuthButton />
    </header>
  );
}
