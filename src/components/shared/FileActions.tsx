"use client";

import { useRef } from "react";
import { Upload } from "lucide-react";

interface FileActionsProps {
  onLoad: (file: File) => void;
  accept?: string;
  title?: string;
}

export function FileActions({
  onLoad,
  accept = ".json,.zip",
  title = "Cargar",
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
      <button
        type="button"
        title={title}
        onClick={() => fileInputRef.current?.click()}
        className="flex h-6 w-7 items-center justify-center rounded-md border border-line bg-elev text-dim transition-colors hover:border-acc hover:text-ink"
      >
        <Upload className="h-3.5 w-3.5" />
      </button>

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
