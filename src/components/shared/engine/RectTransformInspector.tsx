import { Move } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComponentSection } from "@engine/ComponentSection";
import { RectTransformValues, Vec2, Vec2Field } from "@engine/RectTransform";
import { AxisField, FieldRow, AxisInput } from "@engine/InspectorFields";

export function RectTransformInspector({
  transform,
  setAxis,
  setRotation,
  editMode,
  onToggleEdit,
}: {
  transform: RectTransformValues;
  setAxis: (field: Vec2Field, axis: keyof Vec2) => (value: number) => void;
  setRotation: (value: number) => void;
  editMode: boolean;
  onToggleEdit: () => void;
}) {
  return (
    <ComponentSection
      title="Rect Transform"
      icon={<Move size={13} />}
      headerExtra={
        <button
          onClick={onToggleEdit}
          title={editMode ? "Desactivar edición en canvas" : "Editar en canvas"}
          className={cn(
            "rounded px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider transition-colors",
            editMode
              ? "bg-acc text-white"
              : "border border-line text-dim hover:bg-elev hover:text-ink",
          )}
        >
          Editar
        </button>
      }
    >
      <AxisField
        label="Position"
        axes={[
          {
            axis: "X",
            value: transform.position.x,
            onChange: setAxis("position", "x"),
          },
          {
            axis: "Y",
            value: transform.position.y,
            onChange: setAxis("position", "y"),
          },
        ]}
      />
      <AxisField
        label="Size"
        axes={[
          {
            axis: "W",
            value: transform.size.x,
            onChange: setAxis("size", "x"),
          },
          {
            axis: "H",
            value: transform.size.y,
            onChange: setAxis("size", "y"),
          },
        ]}
      />
      <FieldRow label="Rotation">
        <AxisInput
          axis="Z"
          value={transform.rotation ?? 0}
          onChange={setRotation}
        />
      </FieldRow>
    </ComponentSection>
  );
}
