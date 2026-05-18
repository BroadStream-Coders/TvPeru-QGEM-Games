"use client";

import { ReactNode } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface RowsContainerProps {
  children: ReactNode;
  gap?: string;
  className?: string;
}

export function RowsContainer({
  children,
  gap = "gap-2",
  className = "",
}: RowsContainerProps) {
  return (
    <div className="flex-1 min-h-0">
      <ScrollArea className={`h-full ${className}`}>
        <div className={`flex flex-col px-4 py-3.5 ${gap}`}>{children}</div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
}
