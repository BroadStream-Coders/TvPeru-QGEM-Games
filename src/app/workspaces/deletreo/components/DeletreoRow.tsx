"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface DeletreoRowProps {
  index: number;
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
}

export function DeletreoRow({
  index,
  value,
  onChange,
  onRemove,
}: DeletreoRowProps) {
  const charCount = value.length;

  const getCountColor = () => {
    if (charCount === 0) return "text-muted-foreground/40";
    if (charCount > 20) return "text-brand font-bold";
    if (charCount > 15) return "text-amber-500";
    return "text-emerald-500";
  };

  return (
    <div className="flex items-center gap-2 group">
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-2xs font-mono text-muted-foreground/50 select-none">
        {index + 1}
      </div>

      <div className="relative flex-1">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Escribe aquí..."
          className="h-9 pr-9 rounded-lg bg-background border-border text-sm placeholder:text-muted-foreground/40 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/30"
        />
        <div
          className={`absolute right-3 top-1/2 -translate-y-1/2 text-2xs font-mono ${getCountColor()}`}
        >
          {charCount > 0 ? charCount : ""}
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="h-7 w-7 shrink-0 text-muted-foreground/40 hover:text-brand hover:bg-brand/10 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
