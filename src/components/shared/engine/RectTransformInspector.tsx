import { Move } from "lucide-react";
import { RectTransformValues, Vec2 } from "@engine/RectTransform";

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 py-1 text-xs font-mono text-foreground outline-none focus:border-ring"
      />
    </label>
  );
}

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
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-background/40 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Move size={13} className="text-muted-foreground" />
          Rect Transform
        </span>
        <button
          onClick={onToggleEdit}
          title={editMode ? "Desactivar edición en canvas" : "Editar en canvas"}
          className={`rounded-md px-2 py-0.5 text-2xs font-semibold uppercase tracking-wider transition-colors ${
            editMode
              ? "bg-brand text-brand-foreground"
              : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          Editar
        </button>
      </div>
      <div className="grid grid-cols-1 gap-2 p-2.5">
        <Field
          label="Pos X"
          value={transform.position.x}
          onChange={setAxis("position", "x")}
        />
        <Field
          label="Pos Y"
          value={transform.position.y}
          onChange={setAxis("position", "y")}
        />
        <Field
          label="Width"
          value={transform.size.x}
          onChange={setAxis("size", "x")}
        />
        <Field
          label="Height"
          value={transform.size.y}
          onChange={setAxis("size", "y")}
        />
      </div>
    </div>
  );
}
