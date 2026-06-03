import { Gamepad2, Eye } from "lucide-react";

export type ViewMode = "game" | "escena";

const TABS: { mode: ViewMode; label: string; icon: typeof Gamepad2 }[] = [
  { mode: "game", label: "Game", icon: Gamepad2 },
  { mode: "escena", label: "Escena", icon: Eye },
];

export function ViewModeTabs({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex items-end gap-1 pl-3">
      {TABS.map(({ mode: m, label, icon: Icon }) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`flex items-center gap-1.5 rounded-t-lg px-4 py-1.5 text-xs font-semibold transition-colors ${
              active
                ? "bg-brand text-white"
                : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
