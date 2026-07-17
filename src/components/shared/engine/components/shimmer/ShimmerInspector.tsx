import { Sparkles } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { NumberField } from "@engine/NumberField";
import { ShimmerComponent } from "./shimmerComponent";

export function ShimmerInspector({
  component,
  onChange,
  onRemove,
}: {
  component: ShimmerComponent;
  onChange: (next: ShimmerComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <ComponentSection
      title="Shimmer"
      icon={<Sparkles size={13} />}
      accent="anim"
      onRemove={onRemove}
    >
      <NumberField
        label="Period"
        value={component.period}
        onChange={(period) => onChange({ ...component, period })}
      />
      <NumberField
        label="Sweep"
        value={component.sweep}
        onChange={(sweep) => onChange({ ...component, sweep })}
      />
      <NumberField
        label="Phase"
        value={component.phase}
        onChange={(phase) => onChange({ ...component, phase })}
      />
      <NumberField
        label="Intensity"
        value={component.intensity}
        onChange={(intensity) => onChange({ ...component, intensity })}
      />
      <NumberField
        label="Radius"
        value={component.radius}
        onChange={(radius) => onChange({ ...component, radius })}
      />
    </ComponentSection>
  );
}
