import { Vibrate } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { NumberField } from "@engine/NumberField";
import { ShakeComponent } from "./shakeComponent";

export function ShakeInspector({
  component,
  onChange,
  onRemove,
}: {
  component: ShakeComponent;
  onChange: (next: ShakeComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <ComponentSection
      title="Shake"
      icon={<Vibrate size={13} />}
      accent="anim"
      onRemove={onRemove}
    >
      <NumberField
        label="Amplitude"
        value={component.amplitude}
        onChange={(amplitude) => onChange({ ...component, amplitude })}
      />
      <NumberField
        label="Shakes"
        value={component.shakes}
        onChange={(shakes) => onChange({ ...component, shakes })}
      />
      <NumberField
        label="Duration"
        value={component.duration}
        onChange={(duration) => onChange({ ...component, duration })}
      />
    </ComponentSection>
  );
}
