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
    <div className="relative mx-auto w-4/5">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-center gap-1.5 rounded-md border border-line-2 bg-elev px-2.5 py-1.5 text-2xs font-semibold text-dim transition-colors hover:border-acc hover:bg-elev-2 hover:text-ink"
      >
        <Plus size={13} className="text-acc" />
        Agregar componente
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-full z-20 mt-1 flex flex-col overflow-hidden rounded-md border border-line bg-panel shadow-md">
          {options.map((option) => (
            <button
              key={option.type}
              onClick={() => {
                onAdd(option.type);
                setOpen(false);
              }}
              className="px-2.5 py-1.5 text-left text-xs text-ink transition-colors hover:bg-elev"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
