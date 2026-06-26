import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SidePanel({
  title,
  count,
  actions,
  children,
  className,
  bodyClassName = "flex flex-col gap-2 p-3",
}: {
  title: string;
  count?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-full min-h-0 flex-col overflow-hidden bg-panel",
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
        <div
          className={cn(
            "scrl absolute inset-0 overflow-y-auto",
            bodyClassName,
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
