import { FlipHorizontal2 } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { NumberField } from "@engine/NumberField";
import { FlipComponent } from "./flipComponent";

export function FlipInspector({
  component,
  onChange,
  onRemove,
}: {
  component: FlipComponent;
  onChange: (next: FlipComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <ComponentSection
      title="Flip"
      icon={<FlipHorizontal2 size={13} />}
      accent="anim"
      onRemove={onRemove}
    >
      <NumberField
        label="Hide Duration"
        value={component.hideDuration}
        onChange={(hideDuration) => onChange({ ...component, hideDuration })}
      />
      <NumberField
        label="Show Duration"
        value={component.showDuration}
        onChange={(showDuration) => onChange({ ...component, showDuration })}
      />
      <NumberField
        label="Perspective"
        value={component.perspective}
        onChange={(perspective) => onChange({ ...component, perspective })}
      />
    </ComponentSection>
  );
}
