import { MoveUp } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { NumberField } from "@engine/NumberField";
import { BounceComponent } from "./bounceComponent";

export function BounceInspector({
  component,
  onChange,
  onRemove,
}: {
  component: BounceComponent;
  onChange: (next: BounceComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <ComponentSection
      title="Bounce"
      icon={<MoveUp size={13} />}
      accent="anim"
      onRemove={onRemove}
    >
        <NumberField
          label="Speed"
          value={component.travelSpeed}
          onChange={(travelSpeed) => onChange({ ...component, travelSpeed })}
        />
        <NumberField
          label="Amplitude"
          value={component.bounceAmplitude}
          onChange={(bounceAmplitude) =>
            onChange({ ...component, bounceAmplitude })
          }
        />
        <NumberField
          label="Duration"
          value={component.bounceDuration}
          onChange={(bounceDuration) =>
            onChange({ ...component, bounceDuration })
          }
        />
    </ComponentSection>
  );
}
