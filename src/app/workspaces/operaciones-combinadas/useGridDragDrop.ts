"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, RefObject } from "react";

export type DragOrigin = { type: "tray" | "cell"; index: number };
export type Drag = { value: string; origin: DragOrigin };

export function useGridDragDrop(
  stageRef: RefObject<HTMLDivElement | null>,
  initialTray: string[],
) {
  const [tray, setTray] = useState<(string | null)[]>(initialTray);
  const [cells, setCells] = useState<Record<number, string>>({});
  const [drag, setDrag] = useState<Drag | null>(null);
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [hoveredCell, setHoveredCell] = useState<number | null>(null);

  const dragRef = useRef<Drag | null>(null);
  const hoverRef = useRef<number | null>(null);
  const cellsRef = useRef(cells);
  cellsRef.current = cells;

  const updatePointer = (clientX: number, clientY: number) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    setPointer({
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    });
  };

  const beginDrag = (
    value: string,
    origin: DragOrigin,
    e: ReactPointerEvent,
  ) => {
    if (origin.type === "tray") {
      setTray((prev) => prev.map((v, i) => (i === origin.index ? null : v)));
    } else {
      setCells((prev) => {
        const next = { ...prev };
        delete next[origin.index];
        return next;
      });
    }
    const d: Drag = { value, origin };
    dragRef.current = d;
    setDrag(d);
    updatePointer(e.clientX, e.clientY);
  };

  const endDrag = () => {
    const d = dragRef.current;
    if (!d) return;
    const target = hoverRef.current;

    if (target !== null && cellsRef.current[target] === undefined) {
      setCells((prev) => ({ ...prev, [target]: d.value }));
    } else if (d.origin.type === "tray") {
      setTray((prev) =>
        prev.map((v, i) => (i === d.origin.index ? d.value : v)),
      );
    } else {
      setCells((prev) => ({ ...prev, [d.origin.index]: d.value }));
    }

    dragRef.current = null;
    hoverRef.current = null;
    setDrag(null);
    setHoveredCell(null);
  };

  useEffect(() => {
    if (!drag) return;
    const move = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
    const up = () => endDrag();
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drag]);

  const cellEnter = (index: number) => {
    if (!dragRef.current) return;
    hoverRef.current = index;
    setHoveredCell(index);
  };

  const cellLeave = (index: number) => {
    if (hoverRef.current === index) {
      hoverRef.current = null;
      setHoveredCell(null);
    }
  };

  return {
    tray,
    cells,
    drag,
    pointer,
    hoveredCell,
    beginDrag,
    cellEnter,
    cellLeave,
  };
}
