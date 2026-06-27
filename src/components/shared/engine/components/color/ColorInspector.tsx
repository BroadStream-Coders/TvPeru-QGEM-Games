import { Palette, Upload, Maximize2, X } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { ColorField, SelectField } from "@engine/InspectorFields";
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
    <ComponentSection
      title="Color"
      icon={<Palette size={13} />}
      onRemove={onRemove}
    >
      <ColorField
        value={component.value}
        onChange={(value) => onChange({ ...component, value })}
      />

      <span className="text-2xs font-medium uppercase tracking-wider text-faint">
        Forma (shape)
      </span>

      <div
        className="aspect-video w-full rounded-md border border-line bg-[repeating-conic-gradient(#2b2f36_0_25%,transparent_0_50%)] bg-[length:16px_16px] bg-center bg-no-repeat"
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
        <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md bg-acc px-2.5 py-1 text-2xs font-semibold text-white transition-colors hover:bg-acc-hover">
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
            className="inline-flex items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-2xs font-semibold text-dim transition-colors hover:border-destructive hover:text-destructive"
          >
            <X size={13} />
            Quitar
          </button>
        )}
      </div>

      {component.shapeFileName && (
        <span className="truncate text-2xs text-faint">
          {component.shapeFileName}
        </span>
      )}

      {component.shape && (
        <>
          <button
            onClick={fitToShape}
            className="inline-flex w-fit items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-2xs font-semibold text-dim transition-colors hover:border-acc hover:text-ink"
          >
            <Maximize2 size={13} />
            Ajustar al tamaño de la imagen
          </button>
          <SelectField
            label="Ajuste"
            value={component.fit}
            onChange={(fit) => onChange({ ...component, fit })}
            options={[
              { value: "contain" as ImageFit, label: "Contener" },
              { value: "cover" as ImageFit, label: "Cubrir" },
              { value: "fill" as ImageFit, label: "Estirar" },
            ]}
          />
        </>
      )}
    </ComponentSection>
  );
}
