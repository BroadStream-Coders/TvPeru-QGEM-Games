import { MoveUp, Trash2 } from "lucide-react";
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
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-background/40 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <MoveUp size={13} className="text-muted-foreground" />
          Bounce
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
      </div>
    </div>
  );
}
