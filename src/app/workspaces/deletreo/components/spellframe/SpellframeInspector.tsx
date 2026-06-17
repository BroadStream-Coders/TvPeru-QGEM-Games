import { SpellCheck, Upload, Trash2 } from "lucide-react";
import { NumberField } from "@engine/NumberField";
import { SpellframeComponent } from "./spellframeComponent";
import { DEFAULT_FONT } from "./defaultFont";

export function SpellframeInspector({
  component,
  onChange,
  onRemove,
}: {
  component: SpellframeComponent;
  onChange: (next: SpellframeComponent) => void;
  onRemove: () => void;
  onResize: (size: { x: number; y: number }) => void;
}) {
  const onPickFont = async (file: File) => {
    if (component.fontSrc?.startsWith("blob:")) {
      URL.revokeObjectURL(component.fontSrc);
    }
    const src = URL.createObjectURL(file);
    const family = `qgem-font-${crypto.randomUUID()}`;
    const face = new FontFace(family, `url(${src})`);
    try {
      await face.load();
      document.fonts.add(face);
      onChange({
        ...component,
        fontFamily: family,
        fontSrc: src,
        fontFileName: file.name,
      });
    } catch {
      URL.revokeObjectURL(src);
    }
  };

  return (
    <div className="rounded-md border border-border">
      <div className="flex items-center justify-between border-b border-border bg-background/40 px-2.5 py-1.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <SpellCheck size={13} className="text-muted-foreground" />
          Spellframe
        </span>
        <button
          onClick={onRemove}
          title="Eliminar componente"
          className="flex size-5 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <Trash2 size={13} />
        </button>
      </div>
      <div className="flex flex-col gap-2 p-2.5">
        <NumberField
          label="Size"
          value={component.fontSize}
          onChange={(fontSize) => onChange({ ...component, fontSize })}
        />
        <NumberField
          label="Spacing"
          value={component.letterSpacing}
          onChange={(letterSpacing) => onChange({ ...component, letterSpacing })}
        />
        <NumberField
          label="Underline ↕"
          value={component.underlineGap}
          onChange={(underlineGap) => onChange({ ...component, underlineGap })}
        />

        <div className="flex items-center gap-2">
          <span className="shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Font:
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-foreground">
            {component.fontFileName ?? DEFAULT_FONT.label}
          </span>
          <label
            title="Cargar fuente desde equipo"
            className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
          >
            <Upload size={13} />
            <input
              type="file"
              accept=".ttf,.otf,.woff,.woff2,font/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPickFont(file);
              }}
              className="hidden"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
