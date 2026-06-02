import { SpellCheck } from "lucide-react";

export function StatusCard({
  groups,
  groupIndex,
  slotIndex,
}: {
  groups: string[][];
  groupIndex: number;
  slotIndex: number;
}) {
  const currentGroup = groups[groupIndex] ?? [];
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <span className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-slate-500">
        <SpellCheck size={14} className="text-slate-400" />
        Estado
      </span>
      <span className="text-sm font-semibold text-slate-700">
        {groups.length > 0
          ? `Grupo ${groupIndex + 1}/${groups.length} · Slot ${slotIndex + 1}/${currentGroup.length}`
          : "Sin datos"}
      </span>
    </div>
  );
}
