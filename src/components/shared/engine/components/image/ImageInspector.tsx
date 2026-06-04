import { Image as ImageIcon, Upload } from "lucide-react";
import {
  ImageComponent,
  ImageFit,
} from "@/components/shared/engine/components/image/imageComponent";

export function ImageInspector({
  component,
  onChange,
}: {
  component: ImageComponent;
  onChange: (next: ImageComponent) => void;
}) {
  const onPickFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () =>
      onChange({
        ...component,
        src: String(reader.result),
        fileName: file.name,
      });
    reader.readAsDataURL(file);
  };

  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center gap-1.5 border-b border-border bg-background/40 px-2.5 py-1.5">
        <ImageIcon size={13} className="text-muted-foreground" />
        <span className="text-xs font-semibold text-foreground">Image</span>
      </div>
      <div className="flex flex-col gap-2 p-2.5">
        <div
          className="aspect-video w-full rounded-md border border-border bg-[repeating-conic-gradient(#e5e7eb_0_25%,transparent_0_50%)] bg-[length:16px_16px] bg-center bg-no-repeat"
          style={
            component.src
              ? {
                  backgroundImage: `url(${component.src})`,
                  backgroundSize: "contain",
                }
              : undefined
          }
        />
        <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-brand-foreground transition-colors hover:opacity-90">
          <Upload size={13} />
          Cargar desde equipo
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) onPickFile(file);
            }}
            className="hidden"
          />
        </label>
        {component.fileName && (
          <span className="truncate text-2xs text-muted-foreground">
            {component.fileName}
          </span>
        )}
        <label className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Ajuste
          </span>
          <select
            value={component.fit}
            onChange={(e) =>
              onChange({ ...component, fit: e.target.value as ImageFit })
            }
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs text-foreground outline-none focus:border-ring"
          >
            <option value="contain">Contener</option>
            <option value="cover">Cubrir</option>
            <option value="fill">Estirar</option>
          </select>
        </label>
      </div>
    </div>
  );
}
