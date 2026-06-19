import { Gamepad2, Upload, Trash2, Keyboard } from "lucide-react";
import { loadJsonFile } from "@/helpers/persistence";
import {
  ControllerComponent,
  DeletreoData,
  isDeletreoData,
} from "./controllerComponent";

const KEY_LEGEND: { keys: string; label: string }[] = [
  { keys: "Numpad 0-9", label: "Elegir grupo" },
  { keys: "0-9", label: "Elegir slot (Shift +10 · Alt +20)" },
  { keys: "N / B", label: "Slot siguiente / anterior" },
  { keys: "M", label: "Mostrar respuesta" },
  { keys: "F", label: "Marcar error" },
  { keys: "E", label: "Interacción" },
  { keys: "↑ / ↓", label: "Mostrar / ocultar cuadro" },
];

export function ControllerInspector({
  component,
  onChange,
  onRemove,
}: {
  component: ControllerComponent;
  onChange: (next: ControllerComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  const onPick = async (file: File) => {
    try {
      const data = await loadJsonFile<DeletreoData>(file, isDeletreoData);
      onChange({
        ...component,
        groups: data.groups,
        groupIndex: 0,
        slotIndex: 0,
        fileName: file.name,
      });
    } catch {
      console.error("JSON inválido para Deletreo.");
    }
  };

  const groupCount = component.groups.length;
  const slotCount = component.groups.reduce((n, g) => n + g.words.length, 0);
  const slotsInGroup = component.groups[component.groupIndex]?.words.length ?? 0;

  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-background/40 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Gamepad2 size={13} className="text-muted-foreground" />
          Controller
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
        <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border py-1.5 text-xs font-medium text-foreground transition-colors hover:border-brand hover:bg-background/40">
          <Upload size={13} />
          Cargar JSON
          <input
            type="file"
            accept="application/json,.json"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPick(file);
              e.target.value = "";
            }}
            className="hidden"
          />
        </label>

        {component.fileName ? (
          <div className="flex flex-col gap-1 rounded-md bg-background/40 p-2 text-2xs text-muted-foreground">
            <span className="truncate text-foreground">
              {component.fileName}
            </span>
            <span>Grupos: {groupCount}</span>
            <span>Slots: {slotCount}</span>
            <span className="mt-1 text-foreground">
              Grupo {groupCount ? component.groupIndex + 1 : 0}/{groupCount} ·
              Slot {slotsInGroup ? component.slotIndex + 1 : 0}/{slotsInGroup}
            </span>
          </div>
        ) : (
          <p className="text-2xs text-muted-foreground">Sin datos cargados.</p>
        )}

        <div className="flex flex-col gap-1.5 rounded-md bg-background/40 p-2">
          <span className="flex items-center gap-1.5 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            <Keyboard size={12} />
            Teclas
          </span>
          <ul className="flex flex-col gap-1 text-2xs text-muted-foreground">
            {KEY_LEGEND.map((k) => (
              <li key={k.keys} className="flex items-center gap-2">
                <kbd className="min-w-16 rounded border border-border bg-background px-1.5 py-0.5 text-center font-mono text-3xs text-foreground">
                  {k.keys}
                </kbd>
                <span>{k.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
