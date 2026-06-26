import { Square } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
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
    <ComponentSection
      title="Slot"
      icon={<Square size={13} />}
      onRemove={onRemove}
    >
      <div className="flex flex-col gap-1 text-2xs text-muted-foreground">
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
    </ComponentSection>
  );
}
