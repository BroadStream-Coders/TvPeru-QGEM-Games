import { Gamepad2, Upload, Keyboard } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { loadJsonFile } from "@/helpers/persistence";
import {
  ControllerComponent,
  CalcData,
  isCalcData,
} from "./controllerComponent";

const KEY_LEGEND: { keys: string; label: string }[] = [
  { keys: "Numpad 0-9", label: "Elegir grupo" },
  { keys: "0-9", label: "Elegir tablero (Shift +10 · Alt +20)" },
  { keys: "N / B", label: "Tablero siguiente / anterior" },
  { keys: "→", label: "Revelar siguiente pregunta" },
  { keys: "←", label: "Retroceder slot" },
  { keys: "M", label: "Mostrar respuesta (correcto)" },
  { keys: "F", label: "Marcar error" },
  { keys: "C", label: "Limpiar marca" },
  { keys: "↑ / ↓", label: "Entrada / Salida de todos los slots" },
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
      const data = await loadJsonFile<CalcData>(file, isCalcData);
      onChange({
        ...component,
        groups: data.groups,
        groupIndex: 0,
        boardIndex: 0,
        cursor: -1,
        fileName: file.name,
      });
    } catch {
      console.error("JSON inválido para Cálculo Mental.");
    }
  };

  const groupCount = component.groups.length;
  const boardsInGroup =
    component.groups[component.groupIndex]?.boards.length ?? 0;

  return (
    <ComponentSection
      title="Controller"
      icon={<Gamepad2 size={13} />}
      onRemove={onRemove}
    >
      <label className="flex cursor-pointer items-center justify-center gap-1.5 rounded-md border border-line py-1.5 text-xs font-medium text-ink transition-colors hover:border-acc hover:bg-elev">
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
        <div className="flex flex-col gap-1 rounded-md bg-elev p-2 text-2xs text-dim">
          <span className="truncate text-ink">{component.fileName}</span>
          <span className="mt-1 text-ink">
            Grupo {groupCount ? component.groupIndex + 1 : 0}/{groupCount} ·
            Tablero {boardsInGroup ? component.boardIndex + 1 : 0}/
            {boardsInGroup}
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
