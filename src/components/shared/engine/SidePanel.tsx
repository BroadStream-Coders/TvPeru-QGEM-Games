import { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function SidePanel({
  title,
  children,
  className,
}: {
  title: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("relative flex flex-col", className)}>
      <div className="flex items-end pl-2">
        <span className="rounded-t-md bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="relative flex-1">
        <div className="absolute inset-0 flex flex-col gap-2 overflow-y-auto rounded-md border border-border bg-card p-3">
          {children}
        </div>
      </div>
    </div>
  );
}
