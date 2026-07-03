"use client";

import { useEffect, useRef, useState } from "react";
import InfiniteViewer from "react-infinite-viewer";
import Moveable from "react-moveable";
import Selecto from "react-selecto";

/* ---- Stage de diseño (mismo espacio que el engine: 1920x1080) ---- */
const STAGE_W = 1920;
const STAGE_H = 1080;
const FIT_ZOOM = 0.45;

interface Box {
  id: string;
  label: string;
  color: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

const INITIAL_BOXES: Box[] = [
  { id: "b1", label: "Título", color: "#3b82f6", x: 260, y: 140, w: 520, h: 180 },
  { id: "b2", label: "Logo", color: "#22c55e", x: 1240, y: 160, w: 360, h: 360 },
  { id: "b3", label: "Marcador", color: "#f59e0b", x: 300, y: 560, w: 420, h: 300 },
  { id: "b4", label: "Timer", color: "#ef4444", x: 1180, y: 640, w: 460, h: 220 },
];

let boxSeq = 0;

function Tbtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="rounded-md border border-line bg-elev px-2.5 py-1 text-2xs font-medium text-ink transition-colors hover:bg-elev-2 disabled:opacity-40"
    />
  );
}

function Toggle({
  label,
  on,
  onChange,
}: {
  label: string;
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`rounded-md border px-2.5 py-1 text-2xs font-medium transition-colors ${
        on
          ? "border-acc/60 bg-acc-bg text-acc"
          : "border-line bg-elev text-dim hover:bg-elev-2"
      }`}
    >
      {label}
    </button>
  );
}

export default function ReactMoveableLab() {
  const viewerRef = useRef<InfiniteViewer>(null);
  const moveableRef = useRef<Moveable>(null);
  const selectoRef = useRef<Selecto>(null);
  const boxEls = useRef<Record<string, HTMLDivElement | null>>({});

  const [boxes, setBoxes] = useState<Box[]>(INITIAL_BOXES);
  const [targets, setTargets] = useState<(HTMLElement | SVGElement)[]>([]);
  const [zoom, setZoom] = useState(FIT_ZOOM);

  const [draggable, setDraggable] = useState(true);
  const [resizable, setResizable] = useState(true);
  const [scalable, setScalable] = useState(false);
  const [rotatable, setRotatable] = useState(true);
  const [warpable, setWarpable] = useState(false);
  const [keepRatio, setKeepRatio] = useState(false);
  const [snappable, setSnappable] = useState(true);
  const [bounded, setBounded] = useState(true);

  const [panToggle, setPanToggle] = useState(false);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const panMode = panToggle || spaceHeld;

  // Refs vivas para leerlas desde los atajos (efecto con deps vacías)
  const targetsRef = useRef(targets);
  targetsRef.current = targets;
  const boxesRef = useRef(boxes);
  boxesRef.current = boxes;

  // Estilo base de cada caja: se aplica UNA vez. Luego Moveable es dueño del
  // inline style, así los transforms sobreviven a los re-render de React.
  const initBox = (b: Box) => (el: HTMLDivElement | null) => {
    boxEls.current[b.id] = el;
    if (el && !el.dataset.init) {
      el.dataset.init = "1";
      el.style.left = `${b.x}px`;
      el.style.top = `${b.y}px`;
      el.style.width = `${b.w}px`;
      el.style.height = `${b.h}px`;
      el.style.background = b.color;
    }
  };

  // Encajar la vista al montar (tras medir el contenedor)
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      const v = viewerRef.current;
      if (!v) return;
      v.resize();
      v.setZoom(FIT_ZOOM);
      v.scrollCenter();
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  function zoomBy(factor: number) {
    const v = viewerRef.current;
    if (!v) return;
    const next = Math.min(4, Math.max(0.1, v.getZoom() * factor));
    v.setZoom(next);
    setZoom(next);
  }

  function fit() {
    const v = viewerRef.current;
    if (!v) return;
    v.resize();
    v.setZoom(FIT_ZOOM);
    v.scrollCenter();
    setZoom(FIT_ZOOM);
    moveableRef.current?.updateRect();
  }

  function zoom100() {
    const v = viewerRef.current;
    if (!v) return;
    v.setZoom(1);
    v.scrollCenter();
    setZoom(1);
    moveableRef.current?.updateRect();
  }

  function selectedIds(): Set<string> {
    const sel = targetsRef.current;
    return new Set(
      Object.entries(boxEls.current)
        .filter(([, el]) => el && sel.includes(el))
        .map(([id]) => id),
    );
  }

  function selectAll() {
    const els = boxesRef.current
      .map((b) => boxEls.current[b.id])
      .filter((el): el is HTMLDivElement => !!el);
    setTargets(els);
  }

  function deleteSelected() {
    if (!targetsRef.current.length) return;
    const ids = selectedIds();
    setTargets([]);
    setBoxes((prev) => prev.filter((b) => !ids.has(b.id)));
    ids.forEach((id) => delete boxEls.current[id]);
  }

  function duplicateSelected() {
    if (!targetsRef.current.length) return;
    const ids = selectedIds();
    const clones = boxesRef.current
      .filter((b) => ids.has(b.id))
      .map((b) => {
        boxSeq += 1;
        return { ...b, id: `d${boxSeq}_${Date.now()}`, x: b.x + 40, y: b.y + 40 };
      });
    setBoxes((prev) => [...prev, ...clones]);
  }

  function nudge(dx: number, dy: number) {
    if (!targetsRef.current.length) return;
    moveableRef.current?.request("draggable", { deltaX: dx, deltaY: dy }, true);
  }

  function addBox() {
    boxSeq += 1;
    setBoxes((prev) => [
      ...prev,
      {
        id: `n${boxSeq}_${Date.now()}`,
        label: `Caja ${prev.length + 1}`,
        color: "#a855f7",
        x: 700 + ((boxSeq * 40) % 300),
        y: 420 + ((boxSeq * 40) % 200),
        w: 320,
        h: 200,
      },
    ]);
  }

  function reset() {
    setTargets([]);
    Object.values(boxEls.current).forEach((el) => {
      if (el) {
        el.style.cssText = "";
        delete el.dataset.init;
      }
    });
    boxEls.current = {};
    setBoxes(INITIAL_BOXES);
    requestAnimationFrame(fit);
  }

  // Atajos tipo Figma
  useEffect(() => {
    const isTyping = (t: EventTarget | null) =>
      t instanceof HTMLElement &&
      (t.tagName === "INPUT" || t.tagName === "TEXTAREA");

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTyping(e.target)) return;
      const mod = e.ctrlKey || e.metaKey;

      if (e.code === "Space") {
        e.preventDefault();
        setSpaceHeld(true);
        return;
      }
      if (!mod && (e.key === "+" || e.key === "=")) {
        e.preventDefault();
        zoomBy(1.2);
        return;
      }
      if (!mod && e.key === "-") {
        e.preventDefault();
        zoomBy(1 / 1.2);
        return;
      }
      if (e.shiftKey && e.key === "1") {
        e.preventDefault();
        fit();
        return;
      }
      if (e.shiftKey && e.key === "0") {
        e.preventDefault();
        zoom100();
        return;
      }
      if (mod && e.key.toLowerCase() === "a") {
        e.preventDefault();
        selectAll();
        return;
      }
      if (mod && e.key.toLowerCase() === "d") {
        e.preventDefault();
        duplicateSelected();
        return;
      }
      if (e.key === "Escape") {
        setTargets([]);
        return;
      }
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        deleteSelected();
        return;
      }
      const step = e.shiftKey ? 10 : 1;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        nudge(-step, 0);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        nudge(step, 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        nudge(0, -step);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        nudge(0, step);
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceHeld(false);
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex h-screen flex-col bg-bg text-ink">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-edge bg-head px-3 py-2">
        <span className="mr-2 text-xs font-bold tracking-tight">
          react-moveable · playground
        </span>

        <Tbtn onClick={() => zoomBy(1 / 1.2)}>−</Tbtn>
        <span className="w-12 text-center text-2xs font-mono text-dim">
          {Math.round(zoom * 100)}%
        </span>
        <Tbtn onClick={() => zoomBy(1.2)}>+</Tbtn>
        <Tbtn onClick={fit}>Encajar</Tbtn>

        <span className="mx-1 h-4 w-px bg-line" />

        <Toggle label="Drag" on={draggable} onChange={setDraggable} />
        <Toggle label="Resize" on={resizable} onChange={setResizable} />
        <Toggle label="Scale" on={scalable} onChange={setScalable} />
        <Toggle label="Rotate" on={rotatable} onChange={setRotatable} />
        <Toggle label="Warp" on={warpable} onChange={setWarpable} />
        <Toggle label="Ratio" on={keepRatio} onChange={setKeepRatio} />
        <Toggle label="Snap" on={snappable} onChange={setSnappable} />
        <Toggle label="Bounds" on={bounded} onChange={setBounded} />

        <span className="mx-1 h-4 w-px bg-line" />

        <Toggle label="Modo pan" on={panMode} onChange={setPanToggle} />
        <Tbtn onClick={addBox}>+ Caja</Tbtn>
        <Tbtn onClick={reset}>Reset</Tbtn>

        <span className="ml-auto text-2xs text-faint">
          space+arrastra pan · +/− zoom · shift+1 encajar · shift+0 100% ·
          ctrl+a todo · supr borrar · flechas nudge · ctrl+d duplicar
        </span>
      </div>

      {/* Canvas */}
      <div className="relative min-h-0 flex-1 overflow-hidden">
        <InfiniteViewer
          ref={viewerRef}
          className="viewer h-full w-full"
          usePinch
          useAutoZoom
          useWheelScroll
          useWheelPinch
          useMouseDrag={panMode}
          onScroll={() => moveableRef.current?.updateRect()}
          onPinch={(e) => {
            setZoom(e.zoom);
            moveableRef.current?.updateRect();
          }}
        >
          <div
            className="viewport relative"
            style={{ width: STAGE_W, height: STAGE_H }}
          >
            {/* Marco 16:9 de referencia (salida broadcast) */}
            <div
              className="pointer-events-none absolute inset-0 border-2 border-acc/40"
              style={{
                background:
                  "repeating-conic-gradient(#101214 0 25%, #0c0e10 0 50%) 0 / 44px 44px",
              }}
            />
            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-acc/20" />
            <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-acc/20" />

            {boxes.map((b) => (
              <div
                key={b.id}
                ref={initBox(b)}
                className="sc-box absolute grid select-none place-items-center rounded-md text-sm font-bold text-white/90 shadow-lg"
              >
                {b.label}
              </div>
            ))}

            <Moveable
              ref={moveableRef}
              target={targets}
              draggable={draggable}
              resizable={resizable}
              scalable={scalable}
              rotatable={rotatable}
              warpable={warpable}
              keepRatio={keepRatio}
              snappable={snappable}
              snapThreshold={6}
              snapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
              elementSnapDirections={{ top: true, left: true, bottom: true, right: true, center: true, middle: true }}
              elementGuidelines={[".sc-box"]}
              verticalGuidelines={[0, STAGE_W / 2, STAGE_W]}
              horizontalGuidelines={[0, STAGE_H / 2, STAGE_H]}
              isDisplaySnapDigit
              snapGap
              bounds={
                bounded
                  ? { left: 0, top: 0, right: STAGE_W, bottom: STAGE_H, position: "css" }
                  : undefined
              }
              origin={false}
              onRender={(e) => {
                e.target.style.cssText += e.cssText;
              }}
              onRenderGroup={(e) => {
                e.events.forEach((ev) => {
                  ev.target.style.cssText += ev.cssText;
                });
              }}
            />
          </div>
        </InfiniteViewer>

        {!panMode && (
          <Selecto
            ref={selectoRef}
            dragContainer=".viewer"
            selectableTargets={[".sc-box"]}
            hitRate={0}
            selectByClick
            selectFromInside={false}
            toggleContinueSelect={["shift"]}
            ratio={0}
            scrollOptions={{
              container: () => viewerRef.current!.getContainer(),
              throttleTime: 30,
              threshold: 0,
            }}
            onDragStart={(e) => {
              const t = e.inputEvent.target as HTMLElement;
              if (
                moveableRef.current?.isMoveableElement(t) ||
                targetsRef.current.some((el) => el === t || el.contains(t))
              ) {
                e.stop();
              }
            }}
            onScroll={(e) => {
              viewerRef.current?.scrollBy(e.direction[0] * 10, e.direction[1] * 10);
            }}
            onSelect={(e) => {
              setTargets(e.selected);
            }}
            onSelectEnd={(e) => {
              if (e.isDragStartEnd) {
                e.inputEvent.preventDefault();
                moveableRef.current?.waitToChangeTarget().then(() => {
                  moveableRef.current?.dragStart(e.inputEvent);
                });
              }
              setTargets(e.selected);
            }}
          />
        )}
      </div>
    </div>
  );
}
