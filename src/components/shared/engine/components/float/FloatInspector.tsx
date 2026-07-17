import { Waves } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { NumberField } from "@engine/NumberField";
import { FloatComponent } from "./floatComponent";

export function FloatInspector({
  component,
  onChange,
  onRemove,
}: {
  component: FloatComponent;
  onChange: (next: FloatComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <ComponentSection
      title="Float"
      icon={<Waves size={13} />}
      accent="anim"
      onRemove={onRemove}
    >
      <NumberField
        label="Amplitude"
        value={component.amplitude}
        onChange={(amplitude) => onChange({ ...component, amplitude })}
      />
      <NumberField
        label="Rotation"
        value={component.rotation}
        onChange={(rotation) => onChange({ ...component, rotation })}
      />
      <NumberField
        label="Period"
        value={component.period}
        onChange={(period) => onChange({ ...component, period })}
      />
      <NumberField
        label="Phase"
        value={component.phase}
        onChange={(phase) => onChange({ ...component, phase })}
      />
    </ComponentSection>
  );
}
