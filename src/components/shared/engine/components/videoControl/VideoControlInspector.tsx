"use client";

import { useState } from "react";
import { Keyboard } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
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
    <ComponentSection
      title="Control de video"
      icon={<Keyboard size={13} />}
      accent="video"
      onRemove={onRemove}
    >
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
    </ComponentSection>
  );
}
