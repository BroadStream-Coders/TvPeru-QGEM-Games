import { Gamepad2, Keyboard } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { ControllerComponent } from "./controllerComponent";

const OPTION_KEYS = ["Q", "W", "E", "R"];

const KEY_LEGEND: { keys: string; label: string }[] = [
  { keys: "0-9", label: "Elegir ronda (Shift +10 · Alt +20)" },
  { keys: "N / B", label: "Ronda siguiente / anterior" },
  { keys: "Q/W/E/R", label: "Seleccionar opción 1-4" },
  { keys: "V", label: "Validar selección" },
  { keys: "M", label: "Mostrar respuesta correcta" },
];

export function ControllerInspector({
  component,
  onRemove,
}: {
  component: ControllerComponent;
  onRemove: () => void;
}) {
  const roundCount = component.rounds.length;

  return (
    <ComponentSection
      title="Controller"
      icon={<Gamepad2 size={13} />}
      onRemove={onRemove}
    >
      {component.fileName ? (
        <div className="flex flex-col gap-1 rounded-md bg-elev p-2 text-2xs text-dim">
          <span className="truncate text-ink">{component.fileName}</span>
          <span className="mt-1 text-ink">
            Ronda {roundCount ? component.roundIndex + 1 : 0}/{roundCount} ·
            Selección:{" "}
            {component.selected >= 0 ? OPTION_KEYS[component.selected] : "—"}
          </span>
        </div>
      ) : (
        <p className="text-2xs text-faint">Sin datos cargados.</p>
      )}

      <div className="flex flex-col gap-1.5 rounded-md bg-elev p-2">
        <span className="flex items-center gap-1.5 text-2xs font-medium uppercase tracking-wider text-dim">
          <Keyboard size={12} />
          Teclas
        </span>
        <ul className="flex flex-col gap-1 text-2xs text-dim">
          {KEY_LEGEND.map((k) => (
            <li key={k.keys} className="flex items-center gap-2">
              <kbd className="min-w-16 rounded border border-line bg-bg px-1.5 py-0.5 text-center font-mono text-3xs text-ink">
                {k.keys}
              </kbd>
              <span>{k.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </ComponentSection>
  );
}
