import { MoveDown } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { NumberField } from "@engine/NumberField";
import { SlideComponent } from "./slideComponent";

export function SlideInspector({
  component,
  onChange,
  onRemove,
}: {
  component: SlideComponent;
  onChange: (next: SlideComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <ComponentSection
      title="Slide"
      icon={<MoveDown size={13} />}
      accent="anim"
      onRemove={onRemove}
    >
        <NumberField
          label="Speed"
          value={component.speed}
          onChange={(speed) => onChange({ ...component, speed })}
        />
        <NumberField
          label="Hide X"
          value={component.hiddenOffset.x}
          onChange={(x) =>
            onChange({ ...component, hiddenOffset: { ...component.hiddenOffset, x } })
          }
        />
        <NumberField
          label="Hide Y"
          value={component.hiddenOffset.y}
          onChange={(y) =>
            onChange({ ...component, hiddenOffset: { ...component.hiddenOffset, y } })
          }
        />
    </ComponentSection>
  );
}
