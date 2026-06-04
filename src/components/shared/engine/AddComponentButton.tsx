"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export function AddComponentButton({
  options,
  onAdd,
}: {
  options: { type: string; label: string }[];
  onAdd: (type: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-border px-2.5 py-1.5 text-2xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
      >
        <Plus size={13} />
        Agregar componente
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 flex flex-col overflow-hidden rounded-md border border-border bg-card shadow-md">
          {options.map((option) => (
            <button
              key={option.type}
              onClick={() => {
                onAdd(option.type);
                setOpen(false);
              }}
              className="px-2.5 py-1.5 text-left text-xs text-foreground transition-colors hover:bg-accent"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
