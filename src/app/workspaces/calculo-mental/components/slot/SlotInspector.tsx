import { Square, Trash2 } from "lucide-react";
import { SlotComponent } from "./slotComponent";

const STATUS_LABEL: Record<SlotComponent["status"], string> = {
  none: "—",
  correct: "Correcto",
  incorrect: "Incorrecto",
};

export function SlotInspector({
  component,
  onRemove,
}: {
  component: SlotComponent;
  onChange: (next: SlotComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-background/40 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Square size={13} className="text-muted-foreground" />
          Slot
        </span>
        <button
          onClick={onRemove}
          title="Eliminar componente"
          className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="flex flex-col gap-1 p-2.5 text-2xs text-muted-foreground">
        <span>
          Pregunta:{" "}
          <span className="text-foreground">{component.question || "—"}</span>
          {component.showQuestion ? "" : " (oculta)"}
        </span>
        <span>
          Respuesta:{" "}
          <span className="text-foreground">{component.answer || "—"}</span>
          {component.showAnswer ? "" : " (oculta)"}
        </span>
        <span>
          Estado:{" "}
          <span className="text-foreground">
            {STATUS_LABEL[component.status]}
          </span>
        </span>
      </div>
    </div>
  );
}
