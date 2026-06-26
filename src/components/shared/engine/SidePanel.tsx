import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SidePanel({
  title,
  count,
  actions,
  children,
  className,
}: {
  title: string;
  count?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col overflow-hidden rounded-md border border-line bg-panel",
        className,
      )}
    >
      <div className="flex h-[30px] shrink-0 items-center gap-2 border-b border-line bg-head px-3">
        <span className="text-caption font-semibold uppercase tracking-[0.6px] text-dim">
          {title}
        </span>
        {count !== undefined && (
          <span className="font-mono text-2xs text-faint">{count}</span>
        )}
        {actions && (
          <div className="ml-auto flex items-center gap-1.5">{actions}</div>
        )}
      </div>
      <div className="relative flex-1">
        <div className="scrl absolute inset-0 flex flex-col gap-2 overflow-y-auto p-3">
          {children}
        </div>
      </div>
    </div>
  );
}
