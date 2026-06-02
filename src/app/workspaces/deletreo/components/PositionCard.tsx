import { Frame, Move, Eye, EyeOff } from "lucide-react";
import { NumberField } from "@/components/shared/NumberField";
import { TransformValues, Vec2 } from "@/components/shared/Transform";

export function PositionCard({
  transform,
  setAxis,
  showGuides,
  onToggleGuides,
  editMode,
  onToggleEdit,
}: {
  transform: TransformValues;
  setAxis: (
    field: keyof TransformValues,
    axis: keyof Vec2,
  ) => (value: number) => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  editMode: boolean;
  onToggleEdit: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-slate-500">
          <Frame size={14} className="text-slate-400" />
          Posición
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleGuides}
            title={showGuides ? "Ocultar guías" : "Mostrar guías"}
            className={`flex items-center justify-center rounded-md p-1.5 transition-colors ${
              showGuides
                ? "bg-brand text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            {showGuides ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={onToggleEdit}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              editMode
                ? "bg-brand text-white"
                : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Move size={14} />
            Editar
          </button>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
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
      </div>
    </div>
  );
}
