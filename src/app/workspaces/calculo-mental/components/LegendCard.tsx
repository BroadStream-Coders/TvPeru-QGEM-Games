import { Keyboard } from "lucide-react";

export function LegendCard() {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <span className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-slate-500">
        <Keyboard size={14} className="text-slate-400" />
        Teclas
      </span>
      <p className="text-xs text-slate-500">Controles por definir.</p>
    </div>
  );
}
