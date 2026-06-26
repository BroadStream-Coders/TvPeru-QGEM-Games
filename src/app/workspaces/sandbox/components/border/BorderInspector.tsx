import { SquareDashed } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
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
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={component.color}
            onChange={(e) => onChange({ ...component, color: e.target.value })}
            className="h-8 w-12 shrink-0 cursor-pointer rounded-md border border-input bg-input/30"
          />
          <input
            type="text"
            value={component.color}
            onChange={(e) => onChange({ ...component, color: e.target.value })}
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs font-mono text-foreground outline-none focus:border-ring"
          />
        </div>

        <label className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Grosor
          </span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={component.width}
            onChange={(e) =>
              onChange({ ...component, width: Number(e.target.value) })
            }
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs font-mono text-foreground outline-none focus:border-ring"
          />
        </label>

        <label className="flex items-center gap-2">
          <span className="w-16 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Radio
          </span>
          <input
            type="number"
            min={0}
            step={0.1}
            value={component.radius}
            onChange={(e) =>
              onChange({ ...component, radius: Number(e.target.value) })
            }
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs font-mono text-foreground outline-none focus:border-ring"
          />
        </label>
    </ComponentSection>
  );
}
