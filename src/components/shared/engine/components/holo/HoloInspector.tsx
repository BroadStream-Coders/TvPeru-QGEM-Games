import { Gem } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { NumberField } from "@engine/NumberField";
import { ToggleField } from "@engine/InspectorFields";
import { HoloComponent } from "./holoComponent";

export function HoloInspector({
  component,
  onChange,
  onRemove,
}: {
  component: HoloComponent;
  onChange: (next: HoloComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <ComponentSection
      title="Holo"
      icon={<Gem size={13} />}
      accent="anim"
      onRemove={onRemove}
    >
      <ToggleField
        label="Enabled"
        checked={component.enabled}
        onChange={(enabled) => onChange({ ...component, enabled })}
      />
      <NumberField
        label="Period"
        value={component.period}
        onChange={(period) => onChange({ ...component, period })}
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
