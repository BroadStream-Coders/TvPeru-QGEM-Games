"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { FileActions } from "./FileActions";

import { useWorkspaceHeader } from "@/hooks/use-workspace-header";

export function WorkspaceHeader() {
  const { title, icon, onLoad } = useWorkspaceHeader();

  if (!title) return null;

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-edge bg-head px-4 z-10 w-full">
      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-dim transition-all hover:bg-elev hover:text-ink active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver
        </Link>

        {icon && (
          <>
            <div className="h-4 w-px bg-line hidden sm:block" />
            <div className="flex items-center justify-center h-5 w-5 rounded bg-acc-bg text-acc ring-1 ring-acc/20">
              {icon}
            </div>
          </>
        )}

        <span className="text-sm font-semibold tracking-tight text-ink">
          {title}
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onLoad && <FileActions onLoad={onLoad} />}
      </div>
    </header>
  );
}
