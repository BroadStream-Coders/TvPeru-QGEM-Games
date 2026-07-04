import { Gamepad2, Keyboard } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { ComponentRefField, AssetSelectField } from "@engine/InspectorFields";
import { DeletreoComponent } from "./deletreoComponent";

const KEY_LEGEND: { keys: string; label: string }[] = [
  { keys: "Numpad 0-9", label: "Elegir grupo" },
  { keys: "0-9", label: "Elegir slot (Shift +10 · Alt +20)" },
  { keys: "N / B", label: "Slot siguiente / anterior" },
  { keys: "M", label: "Mostrar respuesta" },
  { keys: "F", label: "Marcar error" },
  { keys: "E", label: "Interacción" },
  { keys: "↑ / ↓", label: "Mostrar / ocultar cuadro" },
];

export function DeletreoInspector({
  component,
  onChange,
  onRemove,
}: {
  component: DeletreoComponent;
  onChange: (next: DeletreoComponent) => void;
  onRemove: () => void;
}) {
  const groupCount = component.groups.length;
  const slotCount = component.groups.reduce((n, g) => n + g.words.length, 0);
  const slotsInGroup =
    component.groups[component.groupIndex]?.words.length ?? 0;

  return (
    <ComponentSection
      title="Deletreo"
      icon={<Gamepad2 size={13} />}
      onRemove={onRemove}
    >
      <ComponentRefField
        label="Image"
        targetType="image"
        value={component.image}
        onChange={(image) => onChange({ ...component, image })}
      />
      <AssetSelectField
        label="Normal"
        kind="image"
        value={component.normalFrame ?? ""}
        onChange={(key) =>
          onChange({ ...component, normalFrame: key || undefined })
        }
      />
      <AssetSelectField
        label="Error"
        kind="image"
        value={component.errorFrame ?? ""}
        onChange={(key) =>
          onChange({ ...component, errorFrame: key || undefined })
        }
      />

      {component.fileName ? (
        <div className="flex flex-col gap-1 rounded-md bg-elev p-2 text-2xs text-dim">
          <span className="truncate text-ink">{component.fileName}</span>
          <span>Grupos: {groupCount}</span>
          <span>Slots: {slotCount}</span>
          <span className="mt-1 text-ink">
            Grupo {groupCount ? component.groupIndex + 1 : 0}/{groupCount} · Slot{" "}
            {slotsInGroup ? component.slotIndex + 1 : 0}/{slotsInGroup}
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
