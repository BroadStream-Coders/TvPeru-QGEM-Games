import { SpellCheck } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { NumberField } from "@engine/NumberField";
import { AssetSelectField } from "@engine/InspectorFields";
import { SpellframeComponent } from "./spellframeComponent";

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

      <AssetSelectField
        label="Font"
        kind="font"
        value={component.fontAssetKey ?? ""}
        onChange={(key) =>
          onChange({ ...component, fontAssetKey: key || undefined })
        }
      />
    </ComponentSection>
  );
}
