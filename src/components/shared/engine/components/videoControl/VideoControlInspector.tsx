"use client";

import { useState } from "react";
import { Keyboard, Trash2 } from "lucide-react";
import { VideoControlComponent } from "@engine/components/videoControl/videoControlComponent";

function KeyField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (key: string) => void;
}) {
  const [listening, setListening] = useState(false);

  return (
    <label className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <button
        onClick={() => setListening(true)}
        onBlur={() => setListening(false)}
        onKeyDown={(e) => {
          if (!listening) return;
          if (e.key === "Tab") return;
          e.preventDefault();
          if (e.key === "Escape") {
            setListening(false);
            return;
          }
          onChange(e.key.toLowerCase());
          setListening(false);
        }}
        className={`h-7 flex-1 rounded-md border px-2 text-xs font-semibold outline-none transition-colors ${
          listening
            ? "border-brand bg-brand/10 text-foreground"
            : "border-input bg-input/30 text-foreground hover:border-ring"
        }`}
      >
        {listening ? "Presiona una tecla…" : value.toUpperCase()}
      </button>
    </label>
  );
}

export function VideoControlInspector({
  component,
  onChange,
  onRemove,
}: {
  component: VideoControlComponent;
  onChange: (next: VideoControlComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-background/40 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Keyboard size={13} className="text-muted-foreground" />
          Control de video
        </span>
        <button
          onClick={onRemove}
          title="Eliminar componente"
          className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="flex flex-col gap-2 p-2.5">
        <KeyField
          label="Pausa"
          value={component.pauseKey}
          onChange={(pauseKey) => onChange({ ...component, pauseKey })}
        />
        <KeyField
          label="Reinicio"
          value={component.restartKey}
          onChange={(restartKey) => onChange({ ...component, restartKey })}
        />
      </div>
    </div>
  );
}
