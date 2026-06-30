import { SpellCheck, Upload } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
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
    <ComponentSection
      title="Spellframe"
      icon={<SpellCheck size={13} />}
      accent="text"
      onRemove={onRemove}
    >
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
        <span className="w-[54px] shrink-0 text-2xs font-medium text-dim">
          Font
        </span>
        <span className="min-w-0 flex-1 truncate text-xs text-ink">
          {component.fontFileName ?? DEFAULT_FONT.label}
        </span>
        <label
          title="Cargar fuente desde equipo"
          className="flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-line text-dim transition-colors hover:border-acc hover:text-ink"
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
    </ComponentSection>
  );
}
