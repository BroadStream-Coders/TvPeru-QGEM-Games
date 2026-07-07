"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Play, Undo2, Redo2, Download } from "lucide-react";
import { Menubar } from "radix-ui";
import { FileActions } from "./FileActions";
import { AuthButton } from "./AuthButton";

import { useWorkspaceHeader } from "@/hooks/use-workspace-header";

interface MenuItem {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
}
interface Menu {
  label: string;
  items: MenuItem[];
}

export function WorkspaceHeader() {
  const { title, icon, onLoad, onPlay, onExport, onUndo, onRedo, canUndo, canRedo } =
    useWorkspaceHeader();

  if (!title) return null;

  const menus: Menu[] = [];
  const fileItems: MenuItem[] = [];
  if (onExport)
    fileItems.push({
      label: "Export",
      icon: <Download />,
      onSelect: onExport,
    });
  if (fileItems.length) menus.push({ label: "File", items: fileItems });

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

      {/* B · menus */}
      {menus.length > 0 && (
        <Menubar.Root className="flex items-center gap-0.5">
          {menus.map((menu) => (
            <Menubar.Menu key={menu.label}>
              <Menubar.Trigger className="cursor-default rounded-[5px] px-2.5 py-1 text-dim outline-none transition-colors hover:bg-elev hover:text-ink data-open:bg-elev data-open:text-ink">
                {menu.label}
              </Menubar.Trigger>
              <Menubar.Portal>
                <Menubar.Content
                  align="start"
                  sideOffset={4}
                  className="z-50 min-w-44 origin-(--radix-menubar-content-transform-origin) overflow-hidden rounded-lg border border-line bg-panel p-1 text-ink shadow-md duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95"
                >
                  {menu.items.map((item) => (
                    <Menubar.Item
                      key={item.label}
                      onSelect={item.onSelect}
                      className="relative flex w-full cursor-default items-center gap-1.5 rounded-md px-1.5 py-1 text-xs outline-hidden select-none focus:bg-elev focus:text-ink [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5"
                    >
                      {item.icon}
                      {item.label}
                    </Menubar.Item>
                  ))}
                </Menubar.Content>
              </Menubar.Portal>
            </Menubar.Menu>
          ))}
        </Menubar.Root>
      )}

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

      {/* E · history */}
      {onUndo && onRedo && (
        <div className="flex gap-0.5">
          <button
            title="Deshacer"
            onClick={() => onUndo()}
            disabled={!canUndo}
            className="flex h-[22px] w-[26px] items-center justify-center rounded-[5px] text-dim transition-colors hover:bg-elev hover:text-ink disabled:pointer-events-none disabled:opacity-40"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            title="Rehacer"
            onClick={() => onRedo()}
            disabled={!canRedo}
            className="flex h-[22px] w-[26px] items-center justify-center rounded-[5px] text-dim transition-colors hover:bg-elev hover:text-ink disabled:pointer-events-none disabled:opacity-40"
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
