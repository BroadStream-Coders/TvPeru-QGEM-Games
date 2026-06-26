import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { GameObjectKind } from "@engine/gameObject";
import { KIND_GLYPH, KIND_COLOR } from "@engine/Hierarchy";

export function GameObjectInspector({
  name,
  onNameChange,
  active,
  onActiveChange,
  kind = "group",
}: {
  name: string;
  onNameChange: (value: string) => void;
  active: boolean;
  onActiveChange: (value: boolean) => void;
  kind?: GameObjectKind;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border border-line bg-panel-2 p-2">
      <button
        onClick={() => onActiveChange(!active)}
        title={active ? "Objeto activo" : "Objeto apagado"}
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[3px] border transition-colors",
          active
            ? "border-acc bg-acc-bg text-acc"
            : "border-line text-transparent hover:border-line-2",
        )}
      >
        <Check size={11} strokeWidth={3} />
      </button>
      <span
        className={cn(
          "w-3.5 shrink-0 text-center font-mono text-[13px] font-semibold leading-none",
          KIND_COLOR[kind],
        )}
      >
        {KIND_GLYPH[kind]}
      </span>
      <input
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Nombre"
        className="h-7 w-full min-w-0 rounded-[5px] border border-line bg-bg px-2 text-sm font-semibold text-ink outline-none focus:border-acc"
      />
    </div>
  );
}
