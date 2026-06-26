"use client";

import { ReactNode } from "react";
import {
  Image as ImageIcon,
  Video,
  Music,
  Type,
  Package,
  Check,
  Loader2,
  X,
} from "lucide-react";
import type { AssetKind } from "@/helpers/asset-preloader";

type AssetStatus = "loading" | "ready" | "error";

const KIND_ICON: Record<AssetKind, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  font: Type,
};

function StatusBadge({ status }: { status: AssetStatus }) {
  if (status === "ready") return <Check size={12} className="text-success" />;
  if (status === "error") return <X size={12} className="text-destructive" />;
  return <Loader2 size={12} className="animate-spin text-faint" />;
}

export function AssetsBar({
  count,
  children,
}: {
  count?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <div className="flex h-44 shrink-0 flex-col border-t border-edge bg-panel">
      <div className="flex h-[30px] shrink-0 items-center gap-2 border-b border-line bg-head px-3">
        <span className="text-caption font-semibold uppercase tracking-[0.6px] text-dim">
          Assets
        </span>
        {count !== undefined && (
          <span className="font-mono text-2xs text-faint">{count}</span>
        )}
      </div>
      <div className="scrl flex-1 overflow-auto p-3">
        {children ? (
          <div className="flex gap-3">{children}</div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <p className="text-2xs text-faint">Ninguno cargado.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function AssetTile({
  icon,
  name,
  meta,
  status,
}: {
  icon: ReactNode;
  name: string;
  meta?: string;
  status?: AssetStatus;
}) {
  return (
    <div className="flex w-[150px] shrink-0 flex-col gap-2 rounded-md border border-line bg-panel-2 p-2">
      <div className="relative flex aspect-video items-center justify-center rounded bg-elev text-faint">
        {icon}
        {status && (
          <span className="absolute right-1 top-1">
            <StatusBadge status={status} />
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="truncate text-2xs font-medium text-ink">{name}</p>
        {meta && <p className="truncate text-3xs text-faint">{meta}</p>}
      </div>
    </div>
  );
}

export function AssetLoaderTiles({
  statuses,
  kinds,
}: {
  statuses: Record<string, AssetStatus>;
  kinds?: Record<string, AssetKind>;
}) {
  return (
    <>
      {Object.keys(statuses).map((key) => {
        const Icon = kinds?.[key] ? KIND_ICON[kinds[key]] : Package;
        return (
          <AssetTile
            key={key}
            icon={<Icon size={22} />}
            name={key}
            status={statuses[key]}
          />
        );
      })}
    </>
  );
}
