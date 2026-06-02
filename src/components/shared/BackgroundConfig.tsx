"use client";

import { useState } from "react";
import { ImageIcon, Palette, Video } from "lucide-react";
import type { FullScreenBackground } from "@/components/shared/FullScreen";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BackgroundType = FullScreenBackground["type"];

export const DEFAULT_BACKGROUND: FullScreenBackground = {
  type: "color",
  value: "#000000",
};

function defaultFor(type: BackgroundType): FullScreenBackground {
  if (type === "video") return { type: "video", value: "" };
  if (type === "image") return { type: "image", value: "" };
  return { type: "color", value: "#000000" };
}

export function BackgroundConfig({
  value,
  onChange,
}: {
  value: FullScreenBackground;
  onChange: (value: FullScreenBackground) => void;
}) {
  const [fileName, setFileName] = useState<string | null>(null);

  const onPickFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name);
      onChange({ type: "image", value: String(reader.result) });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-3">
      <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
        Tipo de fondo
      </span>

      <Select
        value={value.type}
        onValueChange={(t) => {
          setFileName(null);
          onChange(defaultFor(t as BackgroundType));
        }}
      >
        <SelectTrigger className="w-full border-slate-300 bg-white text-slate-800 shadow-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="color">
            <span className="flex items-center gap-2">
              <Palette size={14} className="text-slate-400" />
              Color
            </span>
          </SelectItem>
          <SelectItem value="image">
            <span className="flex items-center gap-2">
              <ImageIcon size={14} className="text-slate-400" />
              Imagen
            </span>
          </SelectItem>
          <SelectItem value="video">
            <span className="flex items-center gap-2">
              <Video size={14} className="text-slate-400" />
              Video
            </span>
          </SelectItem>
        </SelectContent>
      </Select>

      {value.type === "color" && (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={value.value}
            onChange={(e) => onChange({ type: "color", value: e.target.value })}
            className="h-9 w-16 cursor-pointer rounded-md border border-slate-300 bg-white"
          />
          <input
            type="text"
            value={value.value}
            onChange={(e) => onChange({ type: "color", value: e.target.value })}
            className="w-28 rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-mono text-slate-800 focus:border-slate-500 focus:outline-none"
          />
        </div>
      )}

      {value.type === "video" && (
        <input
          type="text"
          value={value.value}
          onChange={(e) => onChange({ type: "video", value: e.target.value })}
          placeholder="https://…"
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
        />
      )}

      {value.type === "image" && (
        <div className="flex flex-col gap-2">
          <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">
            <ImageIcon size={14} />
            Elegir imagen
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPickFile(file);
              }}
              className="hidden"
            />
          </label>
          {fileName && (
            <span className="truncate text-xs text-slate-500">{fileName}</span>
          )}
        </div>
      )}
    </div>
  );
}
