import { Palette, Trash2 } from "lucide-react";
import { ColorComponent } from "@/components/shared/engine/components/color/colorComponent";

export function ColorInspector({
  component,
  onChange,
  onRemove,
}: {
  component: ColorComponent;
  onChange: (next: ColorComponent) => void;
  onRemove: () => void;
}) {
  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-background/40 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Palette size={13} className="text-muted-foreground" />
          Color
        </span>
        <button
          onClick={onRemove}
          title="Eliminar componente"
          className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="flex items-center gap-2 p-2.5">
        <input
          type="color"
          value={component.value}
          onChange={(e) => onChange({ ...component, value: e.target.value })}
          className="h-8 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-input/30"
        />
        <input
          type="text"
          value={component.value}
          onChange={(e) => onChange({ ...component, value: e.target.value })}
          className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs font-mono text-foreground outline-none focus:border-ring"
        />
      </div>
    </div>
  );
}
