import {
  Type,
  Upload,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartHorizontal,
  AlignCenterHorizontal,
  AlignEndHorizontal,
  Bold,
  Italic,
  Underline,
  Scaling,
  LucideIcon,
} from "lucide-react";
import { NumberField, NumberInput } from "@engine/NumberField";
import {
  TextAlignH,
  TextAlignV,
  TextComponent,
  TextOverflow,
} from "@engine/components/text/textComponent";

const ALIGN_H_OPTIONS: { value: TextAlignH; icon: LucideIcon; title: string }[] =
  [
    { value: "left", icon: AlignLeft, title: "Izquierda" },
    { value: "center", icon: AlignCenter, title: "Centro" },
    { value: "right", icon: AlignRight, title: "Derecha" },
  ];

const ALIGN_V_OPTIONS: { value: TextAlignV; icon: LucideIcon; title: string }[] =
  [
    { value: "top", icon: AlignStartHorizontal, title: "Arriba" },
    { value: "middle", icon: AlignCenterHorizontal, title: "Medio" },
    { value: "bottom", icon: AlignEndHorizontal, title: "Abajo" },
  ];

const STYLE_TOGGLES: {
  key: "bold" | "italic" | "underline";
  icon: LucideIcon;
  title: string;
}[] = [
  { key: "bold", icon: Bold, title: "Negrita" },
  { key: "italic", icon: Italic, title: "Cursiva" },
  { key: "underline", icon: Underline, title: "Subrayado" },
];

function AlignGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; icon: LucideIcon; title: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <div className="flex flex-1 gap-1">
        {options.map(({ value: v, icon: Icon, title }) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            title={title}
            className={`flex h-7 flex-1 items-center justify-center rounded-md border transition-colors ${
              value === v
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} />
          </button>
        ))}
      </div>
    </label>
  );
}

export function TextInspector({
  component,
  onChange,
  onRemove,
}: {
  component: TextComponent;
  onChange: (next: TextComponent) => void;
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
          <Type size={13} className="text-muted-foreground" />
          Text
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
        <textarea
          value={component.text}
          onChange={(e) => onChange({ ...component, text: e.target.value })}
          rows={2}
          placeholder="Escribe el texto…"
          className="w-full resize-y rounded-md border border-input bg-input/30 px-2 py-1 text-xs text-foreground outline-none focus:border-ring"
        />

        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Font
          </span>
          <span className="min-w-0 flex-1 truncate text-xs text-foreground">
            {component.fontFileName ?? "Geist Sans"}
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

        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Size
          </span>
          <div className="flex flex-1 gap-1">
            {component.autoSize ? (
              <>
                <NumberInput
                  value={component.fontSizeMin}
                  onChange={(fontSizeMin) =>
                    onChange({ ...component, fontSizeMin })
                  }
                  title="Mínimo"
                />
                <NumberInput
                  value={component.fontSizeMax}
                  onChange={(fontSizeMax) =>
                    onChange({ ...component, fontSizeMax })
                  }
                  title="Máximo"
                />
              </>
            ) : (
              <NumberInput
                value={component.fontSize}
                onChange={(fontSize) => onChange({ ...component, fontSize })}
              />
            )}
          </div>
          <button
            type="button"
            onClick={() =>
              onChange({ ...component, autoSize: !component.autoSize })
            }
            title="Auto Size"
            className={`flex size-7 shrink-0 items-center justify-center rounded-md border transition-colors ${
              component.autoSize
                ? "border-brand bg-brand/10 text-foreground"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Scaling size={14} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Style
          </span>
          <div className="flex flex-1 gap-1">
            {STYLE_TOGGLES.map(({ key, icon: Icon, title }) => (
              <button
                key={key}
                type="button"
                onClick={() => onChange({ ...component, [key]: !component[key] })}
                title={title}
                className={`flex h-7 flex-1 items-center justify-center rounded-md border transition-colors ${
                  component[key]
                    ? "border-brand bg-brand/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Color
          </span>
          <input
            type="color"
            value={component.color}
            onChange={(e) => onChange({ ...component, color: e.target.value })}
            className="h-7 w-10 shrink-0 cursor-pointer rounded-md border border-input bg-input/30 p-0.5"
          />
          <input
            type="text"
            value={component.color}
            onChange={(e) => onChange({ ...component, color: e.target.value })}
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs font-mono text-foreground outline-none focus:border-ring"
          />
        </label>

        <AlignGroup
          label="Horiz."
          value={component.alignH}
          options={ALIGN_H_OPTIONS}
          onChange={(alignH) => onChange({ ...component, alignH })}
        />

        <AlignGroup
          label="Vert."
          value={component.alignV}
          options={ALIGN_V_OPTIONS}
          onChange={(alignV) => onChange({ ...component, alignV })}
        />

        <label className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Fit
          </span>
          <select
            value={component.overflow}
            onChange={(e) =>
              onChange({
                ...component,
                overflow: e.target.value as TextOverflow,
              })
            }
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs text-foreground outline-none focus:border-ring"
          >
            <option value="wrap" className="bg-card text-foreground">
              Wrap
            </option>
            <option value="overflow" className="bg-card text-foreground">
              Overflow
            </option>
            <option value="clip" className="bg-card text-foreground">
              Clip
            </option>
          </select>
        </label>
      </div>
    </div>
  );
}
