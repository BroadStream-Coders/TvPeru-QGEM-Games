import { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

interface GroupColumnProps {
  index: number;
  onRemove: () => void;
  children: ReactNode;
  width?: string;
  currentCapacity?: number;
  maxCapacity?: number;
}

export function GroupColumn({
  index,
  onRemove,
  children,
  width = "w-[320px]",
  currentCapacity,
  maxCapacity,
}: GroupColumnProps) {
  return (
    <Card
      className={`flex h-full flex-col shrink-0 rounded-xl border border-border bg-card shadow-none gap-0 py-0 overflow-hidden ${width}`}
    >
      <CardHeader className="flex flex-row items-center justify-between border-b border-border p-4 shrink-0 bg-muted/5">
        <div className="flex items-center gap-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-brand/20 text-brand text-2xs font-bold font-mono">
            {index}
          </div>

          {maxCapacity !== undefined && currentCapacity !== undefined && (
            <div className="flex items-center gap-2">
              <span className="text-2xs font-mono text-muted-foreground tracking-wider">
                CAPACIDAD: {currentCapacity}/{maxCapacity}
              </span>
              <div className="h-1.5 w-16 bg-muted overflow-hidden rounded-full">
                <div
                  className="h-full bg-brand transition-all"
                  style={{
                    width: `${Math.min(100, (currentCapacity / maxCapacity) * 100)}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-7 w-7 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col min-h-0 p-0">
        {children}
      </CardContent>
    </Card>
  );
}
