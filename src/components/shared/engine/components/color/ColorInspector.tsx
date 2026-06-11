import { Palette, Upload, Trash2, Maximize2, X } from "lucide-react";
import { ColorComponent } from "@engine/components/color/colorComponent";
import { ImageFit } from "@engine/components/image/imageComponent";

export function ColorInspector({
  component,
  onChange,
  onRemove,
  onResize,
}: {
  component: ColorComponent;
  onChange: (next: ColorComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  const onPickShape = (file: File) => {
    const reader = new FileReader();
    reader.onload = () =>
      onChange({
        ...component,
        shape: String(reader.result),
        shapeFileName: file.name,
      });
    reader.readAsDataURL(file);
  };

  const clearShape = () =>
    onChange({ ...component, shape: undefined, shapeFileName: undefined });

  const fitToShape = () => {
    if (!component.shape) return;
    const img = new window.Image();
    img.onload = () => onResize({ x: img.naturalWidth, y: img.naturalHeight });
    img.src = component.shape;
  };

  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-background/40 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Palette size={13} className="text-muted-foreground" />
          Color
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
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={component.value}
            onChange={(e) => onChange({ ...component, value: e.target.value })}
            className="h-8 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-input/30"
          />
          <input
            type="text"
            value={component.value}
            onChange={(e) => onChange({ ...component, value: e.target.value })}
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs font-mono text-foreground outline-none focus:border-ring"
          />
        </div>

        <span className="text-2xs font-mono uppercase tracking-wider text-muted-foreground">
          Forma (shape)
        </span>

        <div
          className="aspect-video w-full rounded-md border border-border bg-[repeating-conic-gradient(#e5e7eb_0_25%,transparent_0_50%)] bg-[length:16px_16px] bg-center bg-no-repeat"
          style={
            component.shape
              ? {
                  backgroundColor: component.value,
                  maskImage: `url(${component.shape})`,
                  WebkitMaskImage: `url(${component.shape})`,
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                }
              : undefined
          }
        />

        <div className="flex items-center gap-2">
          <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-brand-foreground transition-colors hover:opacity-90">
            <Upload size={13} />
            Cargar desde equipo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPickShape(file);
              }}
              className="hidden"
            />
          </label>
          {component.shape && (
            <button
              onClick={clearShape}
              title="Quitar forma"
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
            >
              <X size={13} />
              Quitar
            </button>
          )}
        </div>

        {component.shapeFileName && (
          <span className="truncate text-2xs text-muted-foreground">
            {component.shapeFileName}
          </span>
        )}

        {component.shape && (
          <>
            <button
              onClick={fitToShape}
              className="inline-flex w-fit items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
            >
              <Maximize2 size={13} />
              Ajustar al tamaño de la imagen
            </button>
            <label className="flex items-center gap-2">
              <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
                Ajuste
              </span>
              <select
                value={component.fit}
                onChange={(e) =>
                  onChange({ ...component, fit: e.target.value as ImageFit })
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
          </>
        )}
      </div>
    </div>
  );
}
