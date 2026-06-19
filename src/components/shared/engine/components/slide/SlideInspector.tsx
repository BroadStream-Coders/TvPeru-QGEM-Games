import { MoveDown, Trash2 } from "lucide-react";
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
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-background/40 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <MoveDown size={13} className="text-muted-foreground" />
          Slide
        </span>
        <button
          onClick={onRemove}
          title="Eliminar componente"
          className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="flex flex-col gap-2 p-2.5">
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
      </div>
    </div>
  );
}
