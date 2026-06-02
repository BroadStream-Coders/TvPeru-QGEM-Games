export function NumberField({
  label,
  value,
  step = 1,
  onChange,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
        {label}
      </span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (!Number.isNaN(n)) onChange(n);
        }}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm font-mono text-slate-800 focus:border-slate-500 focus:outline-none"
      />
    </label>
  );
}
