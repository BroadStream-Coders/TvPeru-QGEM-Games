import { Move } from "lucide-react";
import { cn } from "@/lib/utils";
import { ComponentSection } from "@engine/ComponentSection";
import { RectTransformValues, Vec2 } from "@engine/RectTransform";
import { NumberField } from "@engine/NumberField";

export function RectTransformInspector({
  transform,
  setAxis,
  editMode,
  onToggleEdit,
}: {
  transform: RectTransformValues;
  setAxis: (
    field: keyof RectTransformValues,
    axis: keyof Vec2,
  ) => (value: number) => void;
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
        <NumberField
          label="Pos X"
          value={transform.position.x}
          onChange={setAxis("position", "x")}
        />
        <NumberField
          label="Pos Y"
          value={transform.position.y}
          onChange={setAxis("position", "y")}
        />
        <NumberField
          label="Width"
          value={transform.size.x}
          onChange={setAxis("size", "x")}
        />
        <NumberField
          label="Height"
          value={transform.size.y}
          onChange={setAxis("size", "y")}
        />
    </ComponentSection>
  );
}
