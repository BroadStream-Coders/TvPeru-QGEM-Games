import { Image as ImageIcon, Maximize2 } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import {
  SelectField,
  AssetField,
  FieldIconButton,
} from "@engine/InspectorFields";
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
      <AssetField
        label="Source"
        name={component.fileName}
        kind={component.fileName?.split(".").pop()?.toUpperCase()}
        accent="image"
        accept="image/*"
        onPick={onPickFile}
        actions={
          <FieldIconButton
            icon={<Maximize2 size={13} />}
            title="Ajustar al tamaño de la imagen"
            onClick={fitToImage}
            disabled={!component.src}
          />
        }
      />
      <SelectField
        label="Fit"
        value={component.fit}
        onChange={(fit) => onChange({ ...component, fit })}
        options={[
          { value: "contain" as ImageFit, label: "Contain" },
          { value: "fill" as ImageFit, label: "Stretch" },
        ]}
      />
    </ComponentSection>
  );
}
