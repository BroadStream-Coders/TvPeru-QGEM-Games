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
    <div className={cn("flex flex-col", className)}>
      <div className="flex items-end pl-2">
        <span className="rounded-t-md bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
          {title}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-2 rounded-md border border-border bg-card p-3">
        {children}
      </div>
    </div>
  );
}
