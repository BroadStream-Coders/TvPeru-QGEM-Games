import { SquareDashed } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { ColorField, FieldRow } from "@engine/InspectorFields";
import { BorderComponent } from "./borderComponent";

export function BorderInspector({
  component,
  onChange,
  onRemove,
}: {
  component: BorderComponent;
  onChange: (next: BorderComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <ComponentSection
      title="Border"
      icon={<SquareDashed size={13} />}
      onRemove={onRemove}
    >
      <ColorField
        label="Color"
        value={component.color}
        onChange={(color) => onChange({ ...component, color })}
      />

      <FieldRow label="Grosor">
        <input
          type="number"
          min={0}
          step={0.1}
          value={component.width}
          onChange={(e) =>
            onChange({ ...component, width: Number(e.target.value) })
          }
          className="h-7 w-full min-w-0 rounded-[5px] border border-line bg-bg px-2 text-right text-xs font-mono text-ink outline-none focus:border-acc"
        />
      </FieldRow>

      <FieldRow label="Radio">
        <input
          type="number"
          min={0}
          step={0.1}
          value={component.radius}
          onChange={(e) =>
            onChange({ ...component, radius: Number(e.target.value) })
          }
          className="h-7 w-full min-w-0 rounded-[5px] border border-line bg-bg px-2 text-right text-xs font-mono text-ink outline-none focus:border-acc"
        />
      </FieldRow>
    </ComponentSection>
  );
}
