"use client";

import { useState } from "react";
import { Popover } from "radix-ui";
import {
  useMemoryBudget,
  categoryBytes,
  formatBytes,
  MEMORY_BUDGET_BYTES,
} from "@/hooks/use-memory-budget";

type HardwareRow = { label: string; value: string };

const simplifyGpu = (raw: string): string => {
  const inner = raw.match(/^ANGLE \((.*)\)$/)?.[1] ?? raw;
  const parts = inner.split(", ");
  return (parts[1] ?? parts[0])
    .replace(/\s*\(0x[0-9A-Fa-f]+\)/g, "")
    .replace(/\s*Direct3D.*$/i, "")
    .trim();
};

function readHardware(): HardwareRow[] {
  const nav = navigator as Navigator & { deviceMemory?: number };
  const perf = performance as Performance & {
    memory?: { jsHeapSizeLimit: number };
  };
  const rows: HardwareRow[] = [];
  if (nav.deviceMemory)
    rows.push({
      label: "RAM",
      value:
        nav.deviceMemory === 8
          ? "≥ 8 GB"
          : `${nav.deviceMemory} GB`,
    });
  rows.push({
    label: "CPU",
    value: `${navigator.hardwareConcurrency} núcleos`,
  });
  const gl = document.createElement("canvas").getContext("webgl");
  const ext = gl?.getExtension("WEBGL_debug_renderer_info");
  if (gl && ext)
    rows.push({
      label: "GPU",
      value: simplifyGpu(String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL))),
    });
  if (perf.memory)
    rows.push({
      label: "Heap JS",
      value: formatBytes(perf.memory.jsHeapSizeLimit),
    });
  rows.push({
    label: "Budget",
    value: `${formatBytes(MEMORY_BUDGET_BYTES)} para assets`,
  });
  return rows;
}

export function MemoryBadge() {
  const entries = useMemoryBudget((s) => s.entries);
  const [hardware, setHardware] = useState<HardwareRow[]>([]);

  const cats: [string, number][] = [
    ["Catálogo", categoryBytes(entries.catalog)],
    ["Local", categoryBytes(entries.local)],
    ["Sesión", categoryBytes(entries.session)],
  ];
  const total = cats.reduce((sum, [, bytes]) => sum + bytes, 0);
  const pct = (total / MEMORY_BUDGET_BYTES) * 100;
  const tone =
    pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-amber-500" : "bg-acc";
  const title = [
    `Memoria estimada de assets · presupuesto ${formatBytes(MEMORY_BUDGET_BYTES)}`,
    ...cats
      .filter(([, bytes]) => bytes > 0)
      .map(([name, bytes]) => `${name}: ${formatBytes(bytes)}`),
  ].join("\n");

  return (
    <Popover.Root
      onOpenChange={(open) => open && setHardware(readHardware())}
    >
      <Popover.Trigger
        title={title}
        className="flex items-center gap-1.5 rounded px-1 transition-colors hover:bg-elev"
      >
        <div className="h-[5px] w-14 overflow-hidden rounded-full bg-elev">
          <div
            className={`h-full ${tone} transition-[width]`}
            style={{ width: `${Math.min(100, pct)}%` }}
          />
        </div>
        <span className="tabular-nums">
          {Math.round(pct)}% · {formatBytes(total)}
        </span>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="end"
          sideOffset={6}
          className="z-50 w-72 rounded-lg border border-line bg-panel p-2.5 text-xs text-ink shadow-md"
        >
          <div className="mb-1.5 font-semibold text-dim">
            Hardware del equipo
          </div>
          <dl className="space-y-1">
            {hardware.map((row) => (
              <div key={row.label} className="flex gap-2">
                <dt className="w-14 shrink-0 text-faint">{row.label}</dt>
                <dd className="min-w-0 break-words">{row.value}</dd>
              </div>
            ))}
          </dl>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
