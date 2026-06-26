import { useState } from "react";
import { Video as VideoIcon, Upload, Maximize2, Link, Keyboard } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { SelectField, ToggleField } from "@engine/InspectorFields";
import { cn } from "@/lib/utils";
import {
  VideoComponent,
  VideoFit,
  VideoSource,
} from "@engine/components/video/videoComponent";

export function VideoInspector({
  component,
  onChange,
  onRemove,
  onResize,
  onAddComponent,
}: {
  component: VideoComponent;
  onChange: (next: VideoComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
  onAddComponent?: (type: string) => void;
}) {
  const [urlDraft, setUrlDraft] = useState(
    component.source === "url" ? component.src : "",
  );

  const setSource = (source: VideoSource) => {
    if (source === component.source) return;
    if (component.source === "file" && component.src.startsWith("blob:")) {
      URL.revokeObjectURL(component.src);
    }
    onChange({ ...component, source, src: "", fileName: undefined });
  };

  const onPickFile = (file: File) => {
    if (component.source === "file" && component.src.startsWith("blob:")) {
      URL.revokeObjectURL(component.src);
    }
    onChange({
      ...component,
      source: "file",
      src: URL.createObjectURL(file),
      fileName: file.name,
    });
  };

  const applyUrl = () => {
    onChange({
      ...component,
      source: "url",
      src: urlDraft,
      fileName: undefined,
    });
  };

  const fitToVideo = () => {
    if (!component.src) return;
    const v = document.createElement("video");
    v.onloadedmetadata = () => onResize({ x: v.videoWidth, y: v.videoHeight });
    v.src = component.src;
  };

  return (
    <ComponentSection
      title="Video"
      icon={<VideoIcon size={13} />}
      accent="video"
      onRemove={onRemove}
    >
      <div className="aspect-video w-full overflow-hidden rounded-md border border-line bg-[repeating-conic-gradient(#2b2f36_0_25%,transparent_0_50%)] bg-[length:16px_16px]">
        {component.src && (
          <video
            src={component.src}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-contain"
          />
        )}
      </div>

      <div className="flex gap-1">
        {(["file", "url"] as const).map((src) => (
          <button
            key={src}
            onClick={() => setSource(src)}
            className={cn(
              "flex-1 rounded-[5px] border px-2 py-1 text-2xs font-semibold uppercase tracking-wider transition-colors",
              component.source === src
                ? "border-acc bg-acc-bg text-ink"
                : "border-line text-dim hover:text-ink",
            )}
          >
            {src === "file" ? "Equipo" : "Link"}
          </button>
        ))}
      </div>

      {component.source === "file" ? (
        <>
          <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md bg-acc px-2.5 py-1 text-2xs font-semibold text-white transition-colors hover:bg-[#5d99ff]">
            <Upload size={13} />
            Cargar desde equipo
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPickFile(file);
              }}
              className="hidden"
            />
          </label>
          {component.fileName && (
            <span className="truncate text-2xs text-faint">
              {component.fileName}
            </span>
          )}
        </>
      ) : (
        <div className="flex gap-1">
          <input
            type="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onBlur={applyUrl}
            onKeyDown={(e) => e.key === "Enter" && applyUrl()}
            placeholder="https://…"
            className="h-7 w-full min-w-0 rounded-[5px] border border-line bg-bg px-2 text-xs text-ink outline-none focus:border-acc"
          />
          <button
            onClick={applyUrl}
            title="Aplicar URL"
            className="flex size-7 shrink-0 items-center justify-center rounded-[5px] border border-line text-dim transition-colors hover:border-acc hover:text-ink"
          >
            <Link size={13} />
          </button>
        </div>
      )}

      <button
        onClick={fitToVideo}
        disabled={!component.src}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-2xs font-semibold text-dim transition-colors hover:border-acc hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Maximize2 size={13} />
        Ajustar al tamaño del video
      </button>

      <SelectField
        label="Ajuste"
        value={component.fit}
        onChange={(fit) => onChange({ ...component, fit })}
        options={[
          { value: "contain" as VideoFit, label: "Contener" },
          { value: "cover" as VideoFit, label: "Cubrir" },
          { value: "fill" as VideoFit, label: "Estirar" },
        ]}
      />

      <ToggleField
        label="Sonido"
        checked={!component.muted}
        onChange={(on) => onChange({ ...component, muted: !on })}
      />
      <ToggleField
        label="Loop"
        checked={component.loop}
        onChange={(loop) => onChange({ ...component, loop })}
      />

      {onAddComponent && (
        <button
          onClick={() => onAddComponent("videoControl")}
          className="inline-flex w-fit items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-2xs font-semibold text-dim transition-colors hover:border-acc hover:text-ink"
        >
          <Keyboard size={13} />
          Agregar control de video
        </button>
      )}
    </ComponentSection>
  );
}
