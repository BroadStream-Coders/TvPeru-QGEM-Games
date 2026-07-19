"use client";

import { Maximize2 } from "lucide-react";
import { ComponentSection } from "@engine/ComponentSection";
import { NumberField } from "@engine/NumberField";
import {
  AssetSelectField,
  AxisField,
  ColorField,
  FieldIconButton,
  SelectField,
  ToggleField,
} from "@engine/InspectorFields";
import { useAssets } from "@engine/assetsContext";
import type {
  ComponentDefinition,
  SchemaField,
} from "@engine/componentRegistry";
import type { GameObjectComponent } from "@engine/gameObject";
import type { Vec2 } from "@engine/RectTransform";
import type { AssetKind } from "@/helpers/asset-preloader";

function measureAsset(url: string, kind: AssetKind, onSize: (s: Vec2) => void) {
  if (kind === "video") {
    const v = document.createElement("video");
    v.onloadedmetadata = () => onSize({ x: v.videoWidth, y: v.videoHeight });
    v.src = url;
  } else {
    const img = new window.Image();
    img.onload = () => onSize({ x: img.naturalWidth, y: img.naturalHeight });
    img.src = url;
  }
}

function Field({
  field,
  values,
  set,
  onResize,
}: {
  field: SchemaField;
  values: Record<string, unknown>;
  set: (key: string, value: unknown) => void;
  onResize: (size: Vec2) => void;
}) {
  const { assets } = useAssets();

  switch (field.type) {
    case "number":
      return (
        <NumberField
          label={field.label}
          value={(values[field.key] as number) ?? 0}
          onChange={(v) => set(field.key, v)}
        />
      );
    case "boolean": {
      const raw = Boolean(values[field.key]);
      const checked = field.invert ? !raw : raw;
      return (
        <ToggleField
          label={field.label}
          checked={checked}
          onChange={(v) => set(field.key, field.invert ? !v : v)}
        />
      );
    }
    case "color":
      return (
        <ColorField
          label={field.label}
          value={(values[field.key] as string) ?? "#000000"}
          onChange={(v) => set(field.key, v)}
        />
      );
    case "vec2": {
      const value = (values[field.key] as Vec2) ?? { x: 0, y: 0 };
      return (
        <AxisField
          label={field.label}
          axes={[
            {
              axis: "X",
              value: value.x,
              onChange: (x) => set(field.key, { ...value, x }),
            },
            {
              axis: "Y",
              value: value.y,
              onChange: (y) => set(field.key, { ...value, y }),
            },
          ]}
        />
      );
    }
    case "enum":
      return (
        <SelectField
          label={field.label}
          value={(values[field.key] as string) ?? ""}
          options={field.options}
          onChange={(v) => set(field.key, v)}
        />
      );
    case "assetKey": {
      const value = (values[field.key] as string | undefined) ?? "";
      const url = value ? assets[value]?.url : undefined;
      return (
        <AssetSelectField
          label={field.label}
          kind={field.kind}
          value={value}
          onChange={(key) => set(field.key, key || undefined)}
          actions={
            field.resize ? (
              <FieldIconButton
                icon={<Maximize2 size={13} />}
                title="Fit to asset size"
                onClick={() => url && measureAsset(url, field.kind, onResize)}
                disabled={!url}
              />
            ) : undefined
          }
        />
      );
    }
  }
}

export function SchemaInspector({
  definition,
  component,
  onChange,
  onRemove,
  onResize,
}: {
  definition: ComponentDefinition;
  component: GameObjectComponent;
  onChange: (next: GameObjectComponent) => void;
  onRemove: () => void;
  onResize: (size: Vec2) => void;
}) {
  const schema = definition.schema;
  if (!schema) return null;

  const Icon = schema.icon;
  const values = component as unknown as Record<string, unknown>;
  const set = (key: string, value: unknown) =>
    onChange({ ...component, [key]: value });

  return (
    <ComponentSection
      title={definition.label}
      icon={<Icon size={13} />}
      accent={schema.accent}
      onRemove={onRemove}
    >
      {schema.fields.map((field) => (
        <Field
          key={field.key}
          field={field}
          values={values}
          set={set}
          onResize={onResize}
        />
      ))}
    </ComponentSection>
  );
}
