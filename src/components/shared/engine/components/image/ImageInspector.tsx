import { Image as ImageIcon, Upload, Maximize2 } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { SelectField } from "@engine/InspectorFields";
import {
  ImageComponent,
  ImageFit,
} from "@engine/components/image/imageComponent";

export function ImageInspector({
  component,
  onChange,
  onRemove,
  onResize,
}: {
  component: ImageComponent;
  onChange: (next: ImageComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  const onPickFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () =>
      onChange({
        ...component,
        src: String(reader.result),
        fileName: file.name,
      });
    reader.readAsDataURL(file);
  };

  const fitToImage = () => {
    if (!component.src) return;
    const img = new window.Image();
    img.onload = () => onResize({ x: img.naturalWidth, y: img.naturalHeight });
    img.src = component.src;
  };

  return (
    <ComponentSection
      title="Image"
      icon={<ImageIcon size={13} />}
      accent="image"
      onRemove={onRemove}
    >
      <div
        className="aspect-video w-full rounded-md border border-line bg-[repeating-conic-gradient(#2b2f36_0_25%,transparent_0_50%)] bg-[length:16px_16px] bg-center bg-no-repeat"
        style={
          component.src
            ? {
                backgroundImage: `url(${component.src})`,
                backgroundSize: "contain",
              }
            : undefined
        }
      />
      <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md bg-acc px-2.5 py-1 text-2xs font-semibold text-white transition-colors hover:bg-[#5d99ff]">
        <Upload size={13} />
        Cargar desde equipo
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
      {component.fileName && (
        <span className="truncate text-2xs text-faint">
          {component.fileName}
        </span>
      )}
      <button
        onClick={fitToImage}
        disabled={!component.src}
        className="inline-flex w-fit items-center gap-1.5 rounded-md border border-line px-2.5 py-1 text-2xs font-semibold text-dim transition-colors hover:border-acc hover:text-ink disabled:cursor-not-allowed disabled:opacity-50"
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
    </ComponentSection>
  );
}
