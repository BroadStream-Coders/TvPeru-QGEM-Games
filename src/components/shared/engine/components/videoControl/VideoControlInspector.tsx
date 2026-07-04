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
      <span className="w-[54px] shrink-0 text-2xs font-medium text-dim">
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
        className={`h-7 flex-1 rounded-[5px] border px-2 text-xs font-semibold outline-none transition-colors ${
          listening
            ? "border-acc bg-acc-bg text-ink"
            : "border-line bg-bg text-ink hover:border-line-2"
        }`}
      >
        {listening ? "Press a key…" : value.toUpperCase()}
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
      title="Video Control"
      icon={<Keyboard size={13} />}
      accent="video"
      onRemove={onRemove}
    >
      <KeyField
        label="Pause"
        value={component.pauseKey}
        onChange={(pauseKey) => onChange({ ...component, pauseKey })}
      />
      <KeyField
        label="Restart"
        value={component.restartKey}
        onChange={(restartKey) => onChange({ ...component, restartKey })}
      />
    </ComponentSection>
  );
}
