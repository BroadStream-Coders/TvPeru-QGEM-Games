"use client";

import { ReactNode, useState } from "react";
import { ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SectionAccent = "text" | "image" | "video" | "anim" | "neutral";

const ACCENT: Record<SectionAccent, string> = {
  text: "bg-type-text/15 text-type-text",
  image: "bg-type-image/15 text-type-image",
  video: "bg-type-video/15 text-type-video",
  anim: "bg-anim/15 text-anim",
  neutral: "bg-elev text-dim",
};

export function ComponentSection({
  title,
  icon,
  accent = "neutral",
  onRemove,
  headerExtra,
  defaultOpen = true,
  children,
}: {
  title: string;
  icon: ReactNode;
  accent?: SectionAccent;
  onRemove?: () => void;
  headerExtra?: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-line">
      <div className="flex items-center gap-2 border-b border-line bg-panel-2 px-3 py-1.5">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex size-3.5 shrink-0 items-center justify-center text-faint hover:text-ink"
        >
          {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <span
          className={cn(
            "flex size-[18px] shrink-0 items-center justify-center rounded",
            ACCENT[accent],
          )}
        >
          {icon}
        </span>
        <span className="flex-1 truncate text-xs font-semibold text-ink">
          {title}
        </span>
        {headerExtra}
        {onRemove && (
          <button
            onClick={onRemove}
            title="Eliminar componente"
            className="flex size-5 shrink-0 items-center justify-center rounded text-faint transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
      {open && (
        <div className="flex flex-col gap-2 px-3 py-2.5">{children}</div>
      )}
    </div>
  );
}
