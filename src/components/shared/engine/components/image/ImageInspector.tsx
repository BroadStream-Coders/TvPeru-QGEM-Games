import { Image as ImageIcon, Maximize2 } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import {
  SelectField,
  FieldIconButton,
  AssetSelectField,
} from "@engine/InspectorFields";
import {
  ImageComponent,
  ImageFit,
} from "@engine/components/image/imageComponent";
import { useAssets } from "@engine/assetsContext";

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
  const { assets } = useAssets();
  const url = component.assetKey ? assets[component.assetKey]?.url : undefined;

  const fitToImage = () => {
    if (!url) return;
    const img = new window.Image();
    img.onload = () => onResize({ x: img.naturalWidth, y: img.naturalHeight });
    img.src = url;
  };

  return (
    <ComponentSection
      title="Image"
      icon={<ImageIcon size={13} />}
      accent="image"
      onRemove={onRemove}
    >
      <AssetSelectField
        label="Asset"
        kind="image"
        value={component.assetKey ?? ""}
        onChange={(key) =>
          onChange({ ...component, assetKey: key || undefined })
        }
        actions={
          <FieldIconButton
            icon={<Maximize2 size={13} />}
            title="Fit to image size"
            onClick={fitToImage}
            disabled={!url}
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
