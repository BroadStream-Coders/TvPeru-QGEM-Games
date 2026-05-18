import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface AddRowButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

export function AddRowButton({
  onClick,
  label = "Agregar fila",
  className = "",
}: AddRowButtonProps) {
  return (
    <div className="p-4 shrink-0 border-t border-border/50">
      <Button
        onClick={onClick}
        variant="outline"
        className={`w-full h-9 gap-2 border-dashed border-border text-muted-foreground hover:text-foreground hover:border-brand/50 hover:bg-brand/5 text-xs transition-all ${className}`}
      >
        <Plus className="h-3.5 w-3.5" />
        {label}
      </Button>
    </div>
  );
}
