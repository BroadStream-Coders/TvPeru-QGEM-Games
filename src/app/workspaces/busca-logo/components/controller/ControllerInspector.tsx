import { Gamepad2, Keyboard } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { CARD_LABELS } from "../../constants";
import { ControllerComponent } from "./controllerComponent";

const KEY_LEGEND: { keys: string; label: string }[] = [
  { keys: "Clic", label: "Seleccionar carta" },
  { keys: "Numpad 1-9", label: "Elegir tablero" },
  { keys: "N", label: "Tablero siguiente" },
  { keys: "E / B", label: "Voltear la carta al frente / al dorso" },
  { keys: "L", label: "Bloquear / desbloquear carta" },
  { keys: "C", label: "Limpiar selección y bloqueos" },
  { keys: "Shift+U / Shift+I", label: "Debug: voltear todas al frente / al dorso" },
];

export function ControllerInspector({
  component,
  onRemove,
}: {
  component: ControllerComponent;
  onRemove: () => void;
}) {
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
            Tablero {component.boardIndex + 1} · Selección:{" "}
            {CARD_LABELS[component.selected] ?? "—"}
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
