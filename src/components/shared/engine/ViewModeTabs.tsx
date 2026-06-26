import { Gamepad2, Eye, Maximize } from "lucide-react";
import { cn } from "@/lib/utils";
import { ViewMode } from "@engine/SceneViewMode";

const TABS: { mode: ViewMode; label: string; icon: typeof Gamepad2 }[] = [
  { mode: "scene", label: "Scene", icon: Eye },
  { mode: "game", label: "Game", icon: Gamepad2 },
];

export function ViewModeTabs({
  mode,
  onChange,
  onFullscreen,
}: {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
  onFullscreen?: () => void;
}) {
  return (
    <div className="flex h-[30px] items-stretch gap-1 border-b border-line bg-head pl-1 pr-1.5">
      {TABS.map(({ mode: m, label, icon: Icon }) => {
        const active = mode === m;
        return (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={cn(
              "flex items-center gap-1.5 border-b-2 px-2.5 text-xs font-medium transition-colors",
              active
                ? "border-acc text-ink"
                : "border-transparent text-dim hover:text-ink",
            )}
          >
            <Icon size={13} />
            {label}
          </button>
        );
      })}
      <span className="my-auto h-4 w-px bg-line" />
      <span className="my-auto font-mono text-2xs text-faint">1920 × 1080</span>
      <span className="my-auto font-mono text-2xs text-faint">16:9</span>
      <div className="flex-1" />
      {onFullscreen && (
        <button
          onClick={onFullscreen}
          className="my-auto flex items-center gap-1.5 rounded-[5px] bg-acc px-2.5 py-1 text-2xs font-semibold text-white transition-colors hover:bg-[#5d99ff]"
          title="Pantalla completa"
        >
          <Maximize size={12} />
          Fullscreen
        </button>
      )}
    </div>
  );
}
