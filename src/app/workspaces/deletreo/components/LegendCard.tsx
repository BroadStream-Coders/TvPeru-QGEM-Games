import { Keyboard } from "lucide-react";

const KEY_LEGEND: { keys: string; label: string }[] = [
  { keys: "Num 0-9", label: "Elegir grupo" },
  { keys: "0-9", label: "Elegir slot (Shift +10 · Alt +20)" },
  { keys: "N / B", label: "Slot siguiente / anterior" },
  { keys: "M", label: "Mostrar respuesta" },
  { keys: "F", label: "Marcar error" },
  { keys: "E", label: "Interacción" },
  { keys: "↑ / ↓", label: "Mostrar / ocultar cuadro" },
];

export function LegendCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <span className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-slate-500">
        <Keyboard size={14} className="text-slate-400" />
        Teclas
      </span>
      <ul className="flex flex-col gap-1 text-xs text-slate-600">
        {KEY_LEGEND.map((k) => (
          <li key={k.keys} className="flex items-center gap-2">
            <kbd className="min-w-10 rounded border border-slate-300 bg-white px-1.5 py-0.5 text-center font-mono text-2xs text-slate-700">
              {k.keys}
            </kbd>
            <span>{k.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
