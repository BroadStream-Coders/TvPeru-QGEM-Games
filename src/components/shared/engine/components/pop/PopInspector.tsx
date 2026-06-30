import { Maximize2 } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { NumberField } from "@engine/NumberField";
import { PopComponent } from "./popComponent";

export function PopInspector({
  component,
  onChange,
  onRemove,
}: {
  component: PopComponent;
  onChange: (next: PopComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <ComponentSection
      title="Pop"
      icon={<Maximize2 size={13} />}
      accent="anim"
      onRemove={onRemove}
    >
      <NumberField
        label="Scale"
        value={component.scale}
        onChange={(scale) => onChange({ ...component, scale })}
      />
      <NumberField
        label="Duration"
        value={component.duration}
        onChange={(duration) => onChange({ ...component, duration })}
      />
    </ComponentSection>
  );
}
