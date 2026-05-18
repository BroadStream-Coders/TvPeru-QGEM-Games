"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp } from "lucide-react";
import { useState } from "react";
import { parseExcelPaste } from "@/helpers/data-processing";

interface QuickLoadProps {
  onLoad: (data: string[][]) => void;
  placeholder?: string;
  className?: string;
}

export function QuickLoad({
  onLoad,
  placeholder = "Pegar lista aquí...",
  className = "",
}: QuickLoadProps) {
  const [inputValue, setInputValue] = useState("");

  const handleProcessLoad = () => {
    if (!inputValue.trim()) return;
    const matrix = parseExcelPaste(inputValue);
    if (matrix.length > 0) {
      onLoad(matrix);
      setInputValue("");
    }
  };

  return (
    <div className={`flex gap-2 w-full ${className}`}>
      <textarea
        placeholder={placeholder}
        className="block h-[72px] flex-1 resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/40 focus:outline-hidden focus:ring-1 focus:ring-brand/40 transition-all overflow-y-auto"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
      />
      <Button
        variant="outline"
        size="icon"
        className="h-auto w-9 shrink-0 border-border bg-background hover:bg-accent hover:text-foreground self-stretch text-muted-foreground"
        onClick={handleProcessLoad}
        title="Cargar datos"
      >
        <ArrowUp className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
