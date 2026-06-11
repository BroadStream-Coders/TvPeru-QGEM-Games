import { Type, Upload, Trash2 } from "lucide-react";
import { NumberField } from "@engine/NumberField";
import {
  TextAlignH,
  TextAlignV,
  TextComponent,
  TextOverflow,
} from "@engine/components/text/textComponent";

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

        <NumberField
          label="Tamaño"
          value={component.fontSize}
          onChange={(fontSize) => onChange({ ...component, fontSize })}
        />

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

        <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md bg-brand px-2.5 py-1 text-2xs font-semibold uppercase tracking-wider text-brand-foreground transition-colors hover:opacity-90">
          <Upload size={13} />
          Cargar fuente desde equipo
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
        {component.fontFileName && (
          <span className="truncate text-2xs text-muted-foreground">
            {component.fontFileName}
          </span>
        )}

        <label className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Horiz.
          </span>
          <select
            value={component.alignH}
            onChange={(e) =>
              onChange({ ...component, alignH: e.target.value as TextAlignH })
            }
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs text-foreground outline-none focus:border-ring"
          >
            <option value="left" className="bg-card text-foreground">
              Izquierda
            </option>
            <option value="center" className="bg-card text-foreground">
              Centro
            </option>
            <option value="right" className="bg-card text-foreground">
              Derecha
            </option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Vert.
          </span>
          <select
            value={component.alignV}
            onChange={(e) =>
              onChange({ ...component, alignV: e.target.value as TextAlignV })
            }
            className="h-7 w-full min-w-0 rounded-md border border-input bg-input/30 px-2 text-xs text-foreground outline-none focus:border-ring"
          >
            <option value="top" className="bg-card text-foreground">
              Arriba
            </option>
            <option value="middle" className="bg-card text-foreground">
              Medio
            </option>
            <option value="bottom" className="bg-card text-foreground">
              Abajo
            </option>
          </select>
        </label>

        <label className="flex items-center gap-2">
          <span className="w-12 shrink-0 text-2xs font-mono uppercase tracking-wider text-muted-foreground">
            Ajuste
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
              Contener
            </option>
            <option value="overflow" className="bg-card text-foreground">
              Desbordar
            </option>
            <option value="clip" className="bg-card text-foreground">
              Recortar
            </option>
          </select>
        </label>
      </div>
    </div>
  );
}
