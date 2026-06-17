import {
  Image as ImageIcon,
  Video,
  Music,
  Type,
  Check,
  Loader2,
  X,
  Package,
} from "lucide-react";
import type { AssetKind } from "@/helpers/asset-preloader";
import type { AssetStatus } from "@/hooks/use-asset-preloader";

const KIND_ICON: Record<AssetKind, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  font: Type,
};

function StatusIcon({ status }: { status: AssetStatus }) {
  if (status === "ready") return <Check size={14} className="text-emerald-500" />;
  if (status === "error") return <X size={14} className="text-rose-500" />;
  return <Loader2 size={14} className="animate-spin text-slate-400" />;
}

export function AssetLoaderCard({
  statuses,
  progress,
  kinds,
}: {
  statuses: Record<string, AssetStatus>;
  progress: { loaded: number; total: number };
  kinds?: Record<string, AssetKind>;
}) {
  const keys = Object.keys(statuses);
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <span className="flex items-center justify-between text-2xs font-mono uppercase tracking-wider text-slate-500">
        <span className="flex items-center gap-2">
          <Package size={14} className="text-slate-400" />
          Assets
        </span>
        <span className="tabular-nums">
          {progress.loaded}/{progress.total}
        </span>
      </span>
      <ul className="flex flex-col gap-1.5">
        {keys.map((key) => {
          const Icon = kinds?.[key] ? KIND_ICON[kinds[key]] : Package;
          return (
            <li
              key={key}
              className="flex items-center justify-between gap-2 text-2xs text-slate-600"
            >
              <span className="flex items-center gap-2">
                <Icon size={14} className="text-slate-400" />
                {key}
              </span>
              <StatusIcon status={statuses[key]} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
