import { Type } from "lucide-react";
import { NumberField } from "@/components/shared/NumberField";
import { SpellTextConfig } from "./SpellFrame";

export function TextCard({
  textConfig,
  onChange,
  manualText,
  onManualTextChange,
}: {
  textConfig: SpellTextConfig;
  onChange: (next: SpellTextConfig) => void;
  manualText: string;
  onManualTextChange: (value: string) => void;
}) {
  const setOffset = (axis: keyof SpellTextConfig["offset"]) => (value: number) =>
    onChange({ ...textConfig, offset: { ...textConfig.offset, [axis]: value } });

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <span className="flex items-center gap-2 text-2xs font-mono uppercase tracking-wider text-slate-500">
        <Type size={14} className="text-slate-400" />
        Texto
      </span>
      <label className="flex flex-col gap-1">
        <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
          Texto manual (debug)
        </span>
        <input
          type="text"
          value={manualText}
          onChange={(e) => onManualTextChange(e.target.value)}
          placeholder="Vacío usa la palabra cargada"
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
        />
      </label>
      <div className="grid grid-cols-3 gap-3">
        <NumberField
          label="Tamaño"
          value={textConfig.fontSize}
          onChange={(fontSize) => onChange({ ...textConfig, fontSize })}
        />
        <NumberField
          label="Espaciado"
          value={textConfig.letterSpacing}
          onChange={(letterSpacing) => onChange({ ...textConfig, letterSpacing })}
        />
        <NumberField
          label="Subrayado ↕"
          value={textConfig.underlineGap}
          onChange={(underlineGap) => onChange({ ...textConfig, underlineGap })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Offset X"
          value={textConfig.offset.x}
          onChange={setOffset("x")}
        />
        <NumberField
          label="Offset Y"
          value={textConfig.offset.y}
          onChange={setOffset("y")}
        />
      </div>
    </div>
  );
}
