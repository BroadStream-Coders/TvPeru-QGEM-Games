"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";

interface FileActionsProps {
  format: "json" | "zip";
  onSave: () => void;
  onLoad: (file: File) => void;
  saveLabel?: string;
  loadLabel?: string;
}

export function FileActions({
  format,
  onSave,
  onLoad,
  saveLabel = "Guardar",
  loadLabel = "Cargar",
}: FileActionsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onLoad(file);
    e.target.value = "";
  };

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="h-7 gap-1.5 text-xs text-muted-foreground hover:text-foreground font-bold uppercase"
      >
        <Upload className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{loadLabel}</span>
      </Button>

      <Button
        size="sm"
        onClick={onSave}
        className="h-7 gap-1.5 bg-brand hover:brightness-110 active:scale-[0.98] text-brand-foreground text-xs shadow-sm transition-all font-bold uppercase"
      >
        <Download className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{saveLabel}</span>
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept={format === "json" ? ".json" : ".zip"}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
