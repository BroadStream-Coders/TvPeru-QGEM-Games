import { Gamepad2, Keyboard } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { ControllerComponent } from "./controllerComponent";

const KEY_LEGEND: { keys: string; label: string }[] = [
  { keys: "0-9", label: "Elegir pregunta (Shift +10 · Alt +20)" },
  { keys: "N / B", label: "Pregunta siguiente / anterior" },
  { keys: "Num 0-9", label: "Elegir grupo" },
  { keys: "E", label: "Mostrar marco de pregunta" },
  { keys: "C", label: "Ocultar marco de pregunta" },
  { keys: "M", label: "Mostrar respuesta" },
  { keys: "F", label: "Respuesta con error" },
  { keys: "← / →", label: "Seleccionar jugador izq. / der." },
  { keys: "↑ / ↓", label: "Mostrar / ocultar ambos banners" },
  { keys: "Num + / −", label: "Sumar / quitar vida al seleccionado" },
];

export function ControllerInspector({
  component,
  onRemove,
}: {
  component: ControllerComponent;
  onRemove: () => void;
}) {
  const groupCount = component.groups.length;
  const slotCount = component.groups[component.groupIndex]?.slots.length ?? 0;
  const player = component.players[component.selectedPlayer];

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
            Grupo {groupCount ? component.groupIndex + 1 : 0}/{groupCount} ·
            Pregunta {slotCount ? component.slotIndex + 1 : 0}/{slotCount}
          </span>
          <span className="text-ink">
            Jugador: {player?.playerName ?? "—"} · Vidas:{" "}
            {component.lives.join(" / ") || "—"}
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
