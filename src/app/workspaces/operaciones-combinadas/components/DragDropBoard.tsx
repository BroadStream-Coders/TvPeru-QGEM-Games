"use client";

import type { PointerEvent as ReactPointerEvent } from "react";
import type { Drag, DragOrigin } from "../useGridDragDrop";
import type { GridVec2 } from "../gridConfig";

const OPERATORS = new Set(["+", "-", "*", "/", "="]);
const isOperator = (value: string) => OPERATORS.has(value);
const pieceColor = (value: string) =>
  isOperator(value) ? "bg-amber-500" : "bg-sky-600";

interface GridCellsProps {
  cols: number;
  rows: number;
  gapPercent: GridVec2;
  cells: Record<number, string>;
  drag: Drag | null;
  hoveredCell: number | null;
  beginDrag: (value: string, origin: DragOrigin, e: ReactPointerEvent) => void;
  cellEnter: (index: number) => void;
  cellLeave: (index: number) => void;
}

export function GridCells({
  cols,
  rows,
  gapPercent,
  cells,
  drag,
  hoveredCell,
  beginDrag,
  cellEnter,
  cellLeave,
}: GridCellsProps) {
  return (
    <div
      className="absolute inset-0 grid"
      style={{
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        columnGap: `${gapPercent.x}%`,
        rowGap: `${gapPercent.y}%`,
      }}
    >
      {Array.from({ length: cols * rows }).map((_, i) => {
        const value = cells[i];
        const dropTarget =
          drag !== null && hoveredCell === i && value === undefined;
        return (
          <div
            key={i}
            onPointerEnter={() => cellEnter(i)}
            onPointerLeave={() => cellLeave(i)}
            onPointerDown={(e) =>
              value !== undefined &&
              beginDrag(value, { type: "cell", index: i }, e)
            }
            className={`flex items-center justify-center border-[0.1cqw] font-bold text-white touch-none select-none ${
              dropTarget
                ? "border-emerald-400 bg-emerald-400/25"
                : "border-white/30 bg-white/5"
            } ${value !== undefined ? "cursor-grab" : ""}`}
            style={{ fontSize: "2.2cqw" }}
          >
            {value ?? ""}
          </div>
        );
      })}
    </div>
  );
}

interface TrayPanelProps {
  tray: (string | null)[];
  drag: Drag | null;
  beginDrag: (value: string, origin: DragOrigin, e: ReactPointerEvent) => void;
}

export function TrayPanel({ tray, drag, beginDrag }: TrayPanelProps) {
  return (
    <div
      className="absolute top-1/2 -translate-y-1/2 grid"
      style={{
        right: "4cqw",
        gridTemplateColumns: "repeat(2, 7cqw)",
        gap: "0.8cqw",
        cursor: drag ? "none" : "default",
      }}
    >
      {tray.map((value, i) =>
        value !== null ? (
          <div
            key={i}
            onPointerDown={(e) =>
              beginDrag(value, { type: "tray", index: i }, e)
            }
            className={`flex items-center justify-center rounded-[1cqw] font-bold text-white touch-none select-none ${
              drag ? "" : "cursor-grab"
            } ${pieceColor(value)}`}
            style={{ height: "7cqw", fontSize: "4cqw" }}
          >
            {value}
          </div>
        ) : (
          <div
            key={i}
            className="rounded-[1cqw] border-[0.2cqw] border-dashed border-white/15"
            style={{ height: "7cqw" }}
          />
        ),
      )}
    </div>
  );
}

interface DragGhostProps {
  drag: Drag;
  pointer: { x: number; y: number };
}

export function DragGhost({ drag, pointer }: DragGhostProps) {
  return (
    <div
      className={`pointer-events-none absolute z-30 flex items-center justify-center rounded-[1cqw] font-bold text-white shadow-lg ${pieceColor(
        drag.value,
      )}`}
      style={{
        left: `${pointer.x}%`,
        top: `${pointer.y}%`,
        width: "7cqw",
        height: "7cqw",
        fontSize: "4cqw",
        opacity: 0.92,
        transform: "translate(-50%, -50%)",
      }}
    >
      {drag.value}
    </div>
  );
}
