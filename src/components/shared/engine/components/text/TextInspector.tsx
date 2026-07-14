import {
  Type,
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
import { cn } from "@/lib/utils";
import { ComponentSection } from "@engine/ComponentSection";
import {
  ColorField,
  SelectField,
  FieldRow,
  AssetSelectField,
} from "@engine/InspectorFields";
import { NumberInput } from "@engine/NumberField";
import {
  TextAlignH,
  TextAlignV,
  TextComponent,
  TextOverflow,
} from "@engine/components/text/textComponent";

const ALIGN_H_OPTIONS: {
  value: TextAlignH;
  icon: LucideIcon;
  title: string;
}[] = [
  { value: "left", icon: AlignLeft, title: "Izquierda" },
  { value: "center", icon: AlignCenter, title: "Centro" },
  { value: "right", icon: AlignRight, title: "Derecha" },
];

const ALIGN_V_OPTIONS: {
  value: TextAlignV;
  icon: LucideIcon;
  title: string;
}[] = [
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
    <FieldRow label={label}>
      {options.map(({ value: v, icon: Icon, title }) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          title={title}
          className={cn(
            "flex h-7 flex-1 items-center justify-center rounded-[5px] border transition-colors",
            value === v
              ? "border-acc bg-acc-bg text-ink"
              : "border-line text-dim hover:text-ink",
          )}
        >
          <Icon size={14} />
        </button>
      ))}
    </FieldRow>
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
  return (
    <ComponentSection
      title="Text"
      icon={<Type size={13} />}
      accent="text"
      onRemove={onRemove}
    >
      <textarea
        value={component.text}
        onChange={(e) => onChange({ ...component, text: e.target.value })}
        rows={2}
        placeholder="Escribe el texto…"
        className="w-full resize-y rounded-[5px] border border-line bg-bg px-2 py-1 text-xs text-ink outline-none focus:border-acc"
      />

      <AssetSelectField
        label="Font"
        kind="font"
        value={component.fontAssetKey ?? ""}
        onChange={(key) =>
          onChange({ ...component, fontAssetKey: key || undefined })
        }
      />

      <FieldRow label="Size">
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
        <button
          type="button"
          onClick={() =>
            onChange({ ...component, autoSize: !component.autoSize })
          }
          title="Auto Size"
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
            component.autoSize
              ? "border-acc bg-acc-bg text-ink"
              : "border-line text-dim hover:text-ink",
          )}
        >
          <Scaling size={14} />
        </button>
      </FieldRow>

      <FieldRow label="Char Sp.">
        <NumberInput
          value={component.letterSpacing ?? 0}
          onChange={(letterSpacing) => onChange({ ...component, letterSpacing })}
          title="Character spacing"
        />
      </FieldRow>

      <FieldRow label="Line Sp.">
        <NumberInput
          value={component.lineSpacing ?? 0}
          onChange={(lineSpacing) => onChange({ ...component, lineSpacing })}
          title="Line spacing"
        />
      </FieldRow>

      <FieldRow label="Style">
        {STYLE_TOGGLES.map(({ key, icon: Icon, title }) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ ...component, [key]: !component[key] })}
            title={title}
            className={cn(
              "flex h-7 flex-1 items-center justify-center rounded-[5px] border transition-colors",
              component[key]
                ? "border-acc bg-acc-bg text-ink"
                : "border-line text-dim hover:text-ink",
            )}
          >
            <Icon size={14} />
          </button>
        ))}
      </FieldRow>

      <ColorField
        label="Color"
        value={component.color}
        onChange={(color) => onChange({ ...component, color })}
      />

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

      <SelectField
        label="Fit"
        value={component.overflow}
        onChange={(overflow) => onChange({ ...component, overflow })}
        options={[
          { value: "wrap" as TextOverflow, label: "Wrap" },
          { value: "overflow" as TextOverflow, label: "Overflow" },
          { value: "clip" as TextOverflow, label: "Clip" },
        ]}
      />
    </ComponentSection>
  );
}
