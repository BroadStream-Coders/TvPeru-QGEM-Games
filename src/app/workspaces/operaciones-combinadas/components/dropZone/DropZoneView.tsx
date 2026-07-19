import { cn } from "@/lib/utils";
import { DropZoneComponent } from "./dropZoneComponent";

export function DropZoneView({ component }: { component: DropZoneComponent }) {
  return (
    <div
      data-dropzone=""
      className={cn(
        "h-full w-full rounded-[1.5cqi] border-[0.3cqi] border-dashed border-white/30 transition-colors",
        component.hover && "border-white bg-white/10",
        component.filled && "border-solid border-[#43A047] bg-[#43A047]/15",
      )}
    />
  );
}
