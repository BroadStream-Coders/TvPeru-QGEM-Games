import { Video as VideoIcon, Maximize2 } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import {
  SelectField,
  FieldIconButton,
  ToggleField,
  AssetSelectField,
} from "@engine/InspectorFields";
import {
  VideoComponent,
  VideoFit,
} from "@engine/components/video/videoComponent";
import { useAssets } from "@engine/assetsContext";

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
  const { assets } = useAssets();
  const url = component.assetKey ? assets[component.assetKey]?.url : undefined;

  const fitToVideo = () => {
    if (!url) return;
    const v = document.createElement("video");
    v.onloadedmetadata = () => onResize({ x: v.videoWidth, y: v.videoHeight });
    v.src = url;
  };

  return (
    <ComponentSection
      title="Video"
      icon={<VideoIcon size={13} />}
      accent="video"
      onRemove={onRemove}
    >
      <AssetSelectField
        label="Asset"
        kind="video"
        value={component.assetKey ?? ""}
        onChange={(key) =>
          onChange({ ...component, assetKey: key || undefined })
        }
        actions={
          <FieldIconButton
            icon={<Maximize2 size={13} />}
            title="Fit to video size"
            onClick={fitToVideo}
            disabled={!url}
          />
        }
      />

      <SelectField
        label="Fit"
        value={component.fit}
        onChange={(fit) => onChange({ ...component, fit })}
        options={[
          { value: "contain" as VideoFit, label: "Contain" },
          { value: "fill" as VideoFit, label: "Stretch" },
        ]}
      />

      <ToggleField
        label="Sound"
        checked={!component.muted}
        onChange={(on) => onChange({ ...component, muted: !on })}
      />
      <ToggleField
        label="Loop"
        checked={component.loop}
        onChange={(loop) => onChange({ ...component, loop })}
      />
    </ComponentSection>
  );
}
