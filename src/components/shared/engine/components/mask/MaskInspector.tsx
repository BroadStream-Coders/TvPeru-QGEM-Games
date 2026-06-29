import { Scissors } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { ToggleField } from "@engine/InspectorFields";
import { MaskComponent } from "@engine/components/mask/maskComponent";

export function MaskInspector({
  component,
  onChange,
  onRemove,
}: {
  component: MaskComponent;
  onChange: (next: MaskComponent) => void;
  onRemove: () => void;
}) {
  return (
    <ComponentSection
      title="Mask"
      icon={<Scissors size={13} />}
      onRemove={onRemove}
    >
      <ToggleField
        label="Show image"
        checked={component.showImage}
        onChange={(showImage) => onChange({ ...component, showImage })}
      />
    </ComponentSection>
  );
}
