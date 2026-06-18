import { Calculator } from "lucide-react";

export function StatusCard({ loaded }: { loaded: boolean }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <span className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-slate-500">
        <Calculator size={14} className="text-slate-400" />
        Estado
      </span>
      <span className="text-sm font-semibold text-slate-700">
        {loaded ? "Datos cargados" : "Sin datos"}
      </span>
    </div>
  );
}
