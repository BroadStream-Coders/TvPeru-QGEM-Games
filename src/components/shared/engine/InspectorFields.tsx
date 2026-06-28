"use client";

import { ReactNode } from "react";
import { ChevronDown, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { NumberInput } from "@engine/NumberField";

const ICON_BTN =
  "flex size-7 shrink-0 items-center justify-center rounded-[5px] border border-line text-dim transition-colors hover:border-acc hover:text-ink disabled:cursor-not-allowed disabled:opacity-50";

const ASSET_BADGE: Record<string, string> = {
  image: "bg-type-image",
  video: "bg-type-video",
};

export function FieldRow({
  label,
  children,
}: {
  label?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center gap-2">
      {label !== undefined && (
        <span className="w-[54px] shrink-0 text-2xs font-medium text-dim">
          {label}
        </span>
      )}
      <div className="flex min-w-0 flex-1 items-center gap-1">{children}</div>
    </div>
  );
}

const BARE_NUM =
  "h-full w-full min-w-0 bg-transparent px-2 text-right text-xs font-mono text-ink outline-none";

export function AxisInput({
  axis,
  value,
  onChange,
}: {
  axis?: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex h-7 min-w-0 flex-1 items-center overflow-hidden rounded-[5px] border border-line bg-bg focus-within:border-acc">
      {axis && (
        <span className="flex h-full w-[18px] shrink-0 items-center justify-center bg-elev text-2xs font-mono text-faint">
          {axis}
        </span>
      )}
      <NumberInput value={value} onChange={onChange} className={BARE_NUM} />
    </div>
  );
}

export function AxisField({
  label,
  axes,
}: {
  label: string;
  axes: { axis: string; value: number; onChange: (value: number) => void }[];
}) {
  return (
    <FieldRow label={label}>
      {axes.map((a) => (
        <AxisInput
          key={a.axis}
          axis={a.axis}
          value={a.value}
          onChange={a.onChange}
        />
      ))}
    </FieldRow>
  );
}

export function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label?: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <FieldRow label={label}>
      <div className="relative min-w-0 flex-1">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-7 w-full min-w-0 appearance-none rounded-[5px] border border-line bg-bg px-2 pr-7 text-xs text-ink outline-none hover:border-line-2 focus:border-acc"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-panel text-ink">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          size={13}
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-faint"
        />
      </div>
    </FieldRow>
  );
}

export function ColorField({
  label,
  value,
  onChange,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <FieldRow label={label}>
      <label className="relative size-[22px] shrink-0 cursor-pointer overflow-hidden rounded-[5px] border border-line-2">
        <span className="block size-full" style={{ background: value }} />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-7 w-full min-w-0 rounded-[5px] border border-line bg-bg px-2 text-xs font-mono uppercase text-ink outline-none focus:border-acc"
      />
    </FieldRow>
  );
}

export function FieldIconButton({
  icon,
  title,
  onClick,
  disabled,
}: {
  icon: ReactNode;
  title: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={ICON_BTN}
    >
      {icon}
    </button>
  );
}

export function AssetField({
  label,
  name,
  kind,
  accent,
  accept,
  onPick,
  actions,
}: {
  label?: string;
  name?: string;
  kind?: string;
  accent: "image" | "video";
  accept?: string;
  onPick: (file: File) => void;
  actions?: ReactNode;
}) {
  return (
    <FieldRow label={label}>
      <div className="flex h-7 min-w-0 flex-1 items-center gap-2 rounded-[5px] border border-line bg-bg px-1.5">
        <span
          className={cn(
            "flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded px-1 text-3xs font-bold text-white",
            ASSET_BADGE[accent],
          )}
        >
          {kind || "—"}
        </span>
        <span
          className={cn(
            "min-w-0 flex-1 truncate text-2xs",
            name ? "text-ink" : "text-faint",
          )}
        >
          {name ?? "Ninguno"}
        </span>
      </div>
      <label className={cn(ICON_BTN, "cursor-pointer")} title="Cargar desde equipo">
        <Upload size={13} />
        <input
          type="file"
          accept={accept}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPick(file);
            e.target.value = "";
          }}
          className="hidden"
        />
      </label>
      {actions}
    </FieldRow>
  );
}

export function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-2xs font-medium text-dim">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative h-[17px] w-[30px] shrink-0 rounded-full transition-colors",
          checked ? "bg-acc" : "bg-elev-2",
        )}
      >
        <span
          className={cn(
            "absolute top-[2px] size-[13px] rounded-full bg-white transition-all",
            checked ? "left-[15px]" : "left-[2px]",
          )}
        />
      </button>
    </div>
  );
}
