import { Sparkle } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { NumberField } from "@engine/NumberField";
import { ToggleField } from "@engine/InspectorFields";
import { SparklesComponent } from "./sparklesComponent";

export function SparklesInspector({
  component,
  onChange,
  onRemove,
}: {
  component: SparklesComponent;
  onChange: (next: SparklesComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <ComponentSection
      title="Sparkles"
      icon={<Sparkle size={13} />}
      accent="anim"
      onRemove={onRemove}
    >
      <ToggleField
        label="Enabled"
        checked={component.enabled}
        onChange={(enabled) => onChange({ ...component, enabled })}
      />
      <NumberField
        label="Rate"
        value={component.rate}
        onChange={(rate) => onChange({ ...component, rate })}
      />
      <NumberField
        label="Size"
        value={component.size}
        onChange={(size) => onChange({ ...component, size })}
      />
      <NumberField
        label="Duration"
        value={component.duration}
        onChange={(duration) => onChange({ ...component, duration })}
      />
    </ComponentSection>
  );
}
