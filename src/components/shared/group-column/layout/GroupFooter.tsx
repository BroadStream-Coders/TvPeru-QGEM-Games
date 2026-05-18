"use client";

import { ReactNode } from "react";
import { CardFooter } from "@/components/ui/card";

interface GroupFooterProps {
  children: ReactNode;
}

export function GroupFooter({ children }: GroupFooterProps) {
  return (
    <CardFooter className="shrink-0 border-t border-border bg-muted/5 p-4 flex flex-col gap-3">
      {children}
    </CardFooter>
  );
}
