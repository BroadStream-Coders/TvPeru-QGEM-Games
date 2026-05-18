"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FileActions } from "./FileActions";

import { useWorkspaceHeader } from "@/hooks/use-workspace-header";

export function WorkspaceHeader() {
  const { title, icon, format, onSave, onLoad } = useWorkspaceHeader();

  if (!title) return null;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-background px-4 z-10 w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground transition-all hover:bg-accent hover:text-foreground active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Link>

        {icon && (
          <>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center justify-center h-5 w-5 rounded bg-brand/20 text-brand ring-1 ring-brand/10">
              {icon}
            </div>
          </>
        )}

        <span className="text-sm font-semibold tracking-tight">{title}</span>
      </div>

      <div className="flex items-center gap-2">
        {onSave && onLoad && format && (
          <FileActions format={format} onSave={onSave} onLoad={onLoad} />
        )}
      </div>
    </header>
  );
}
