"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileActionsProps {
  onLoad: (file: File) => void;
  accept?: string;
  loadLabel?: string;
}

export function FileActions({
  onLoad,
  accept = ".json,.zip",
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
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        className="h-7 gap-1.5 bg-acc text-white hover:bg-[#5d99ff] active:scale-[0.98] text-xs shadow-sm transition-all font-semibold"
      >
        <Upload className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{loadLabel}</span>
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </>
  );
}
