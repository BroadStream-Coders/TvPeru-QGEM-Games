import { Palette } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { ColorField } from "@engine/InspectorFields";
import { ColorComponent } from "@engine/components/color/colorComponent";

export function ColorInspector({
  component,
  onChange,
  onRemove,
}: {
  component: ColorComponent;
  onChange: (next: ColorComponent) => void;
  onRemove: () => void;
}) {
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
    </ComponentSection>
  );
}
