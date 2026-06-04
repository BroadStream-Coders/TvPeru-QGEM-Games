import { useState } from "react";
import {
  Video as VideoIcon,
  Upload,
  Trash2,
  Maximize2,
  Link,
} from "lucide-react";
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
}: {
  component: VideoComponent;
  onChange: (next: VideoComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
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
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-background/40 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <VideoIcon size={13} className="text-muted-foreground" />
          Video
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
        <div className="aspect-video w-full overflow-hidden rounded-md border border-border bg-[repeating-conic-gradient(#e5e7eb_0_25%,transparent_0_50%)] bg-[length:16px_16px]">
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
          <button
            onClick={() => setSource("file")}
            className={`flex-1 rounded-md border px-2 py-1 text-2xs font-semibold uppercase tracking-wider transition-colors ${
              component.source === "file"
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Equipo
          </button>
          <button
            onClick={() => setSource("url")}
            className={`flex-1 rounded-md border px-2 py-1 text-2xs font-semibold uppercase tracking-wider transition-colors ${
              component.source === "url"
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            Link
          </button>
        </div>

        {component.source === "file" ? (
          <>
            <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-brand-foreground transition-colors hover:opacity-90">
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
              <span className="truncate text-2xs text-muted-foreground">
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
              className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs text-foreground outline-none focus:border-ring"
            />
            <button
              onClick={applyUrl}
              title="Aplicar URL"
              className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
            >
              <Link size={13} />
            </button>
          </div>
        )}

        <button
          onClick={fitToVideo}
          disabled={!component.src}
          className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-brand hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Maximize2 size={13} />
          Ajustar al tamaño del video
        </button>

        <label className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Ajuste
          </span>
          <select
            value={component.fit}
            onChange={(e) =>
              onChange({ ...component, fit: e.target.value as VideoFit })
            }
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs text-foreground outline-none focus:border-ring"
          >
            <option value="contain" className="bg-card text-foreground">
              Contener
            </option>
            <option value="cover" className="bg-card text-foreground">
              Cubrir
            </option>
            <option value="fill" className="bg-card text-foreground">
              Estirar
            </option>
          </select>
        </label>
      </div>
    </div>
  );
}
