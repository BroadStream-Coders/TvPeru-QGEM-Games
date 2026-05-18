"use client";

import { Plus } from "lucide-react";

interface AddColumnButtonProps {
  label: string;
  sublabel?: string;
  onClick: () => void;
  width?: string;
}

export function AddColumnButton({
  label,
  sublabel,
  onClick,
  width = "w-[180px]",
}: AddColumnButtonProps) {
  return (
    <div className={`h-full ${width} shrink-0`}>
      <button
        onClick={onClick}
        className="group flex h-full w-full flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border/60 bg-muted/5 text-muted-foreground transition-all hover:border-brand/40 hover:bg-muted/10 hover:text-foreground"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-current transition-all group-hover:scale-110 group-hover:bg-brand group-hover:text-brand-foreground group-hover:border-transparent">
          <Plus className="h-4 w-4" />
        </div>
        <div className="text-center">
          <span className="block text-xs font-bold uppercase tracking-wider">
            {label}
          </span>
          {sublabel && (
            <span className="text-2xs text-muted-foreground/50 font-medium">
              {sublabel}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}
