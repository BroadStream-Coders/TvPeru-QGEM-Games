import { Gamepad2, Eye } from "lucide-react";
import { ViewMode } from "@engine/SceneViewMode";

const TABS: { mode: ViewMode; label: string; icon: typeof Gamepad2 }[] = [
  { mode: "game", label: "Game", icon: Gamepad2 },
  { mode: "scene", label: "Scene", icon: Eye },
];

export function ViewModeTabs({
  mode,
  onChange,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}) {
  return (
    <div className="flex items-end gap-0.5 pl-2">
      {TABS.map(({ mode: m, label, icon: Icon }) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`flex items-center gap-1.5 rounded-t-md px-3 py-1 text-xs font-medium transition-colors ${
              active
                ? "bg-brand text-brand-foreground"
                : "bg-card text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <Icon size={13} />
            {label}
          </button>
        );
      })}
    </div>
  );
}
