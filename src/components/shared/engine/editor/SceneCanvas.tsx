"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InfiniteViewer from "react-infinite-viewer";
import Moveable from "react-moveable";
import Selecto from "react-selecto";
import { Maximize, Minus, Plus } from "lucide-react";

import { useEditor } from "@engine/editor/editorContext";
import { GameObjectView } from "@engine/GameObjectView";
import { SceneViewModeProvider } from "@engine/SceneViewMode";
import {
  DESIGN_WIDTH,
  DESIGN_HEIGHT,
  rectTransformStyle,
  type Vec2,
  type RectTransformValues,
} from "@engine/RectTransform";
import { ancestorOffset, isDescendantOf } from "@engine/gameObject";
import { toAbsRect, fromAbsRect, type AbsRect } from "@engine/editor/sceneTransform";
import { cn } from "@/lib/utils";

const CHECKER =
  "repeating-conic-gradient(#101214 0 25%, #0c0e10 0 50%) 0 / 44px 44px";
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 4;
const FIT_MARGIN = 0.9;

interface Snap {
  id: string;
  pivot: Vec2;
  rotation: number;
  position: Vec2;
  size: Vec2;
  origin: Vec2;
  parentSize: Vec2;
  abs: AbsRect;
  pending: Partial<RectTransformValues> | null;
}

function isTyping(t: EventTarget | null) {
  return (
    t instanceof HTMLElement &&
    (t.tagName === "INPUT" || t.tagName === "TEXTAREA")
  );
}

function goIdsOf(els: Array<HTMLElement | SVGElement>): string[] {
  return els
    .map((el) => (el as HTMLElement).dataset?.goId)
    .filter((id): id is string => !!id);
}

function Tbtn(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="flex h-6 items-center gap-1 rounded-[5px] border border-line bg-elev px-2 text-2xs font-medium text-ink transition-colors hover:bg-elev-2 disabled:opacity-40"
    />
  );
}

export function SceneCanvas() {
  const e = useEditor();
  const viewerRef = useRef<InfiniteViewer>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const moveableRef = useRef<Moveable>(null);
  const selectoRef = useRef<Selecto>(null);
  const [zoom, setZoom] = useState(1);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [shiftHeld, setShiftHeld] = useState(false);
  const [targets, setTargets] = useState<HTMLElement[]>([]);

  const targetsRef = useRef(targets);
  targetsRef.current = targets;
  const gestureRef = useRef<Map<string, Snap>>(new Map());
  const draggingRef = useRef(false);

  const fit = useCallback(() => {
    const v = viewerRef.current;
    if (!v) return;
    v.resize();
    const c = v.getContainer();
    if (!c.clientWidth || !c.clientHeight) return;
    const z =
      Math.min(c.clientWidth / DESIGN_WIDTH, c.clientHeight / DESIGN_HEIGHT) *
      FIT_MARGIN;
    v.setZoom(z);
    v.scrollCenter();
    setZoom(z);
  }, []);

  const zoomBy = useCallback((factor: number) => {
    const v = viewerRef.current;
    if (!v) return;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.getZoom() * factor));
    v.setZoom(next);
    setZoom(next);
  }, []);

  const zoom100 = useCallback(() => {
    const v = viewerRef.current;
    if (!v) return;
    v.setZoom(1);
    v.scrollCenter();
    setZoom(1);
  }, []);

  useEffect(() => {
    const raf = requestAnimationFrame(fit);
    return () => cancelAnimationFrame(raf);
  }, [fit]);

  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.key === "Shift") setShiftHeld(true);
      if (isTyping(ev.target) || ev.code !== "Space") return;
      ev.preventDefault();
      setSpaceHeld(true);
    };
    const onKeyUp = (ev: KeyboardEvent) => {
      if (ev.key === "Shift") setShiftHeld(false);
      if (ev.code === "Space") setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  useEffect(() => {
    const els = e.selectedIds
      .map((id) =>
        viewportRef.current?.querySelector<HTMLElement>(`[data-go-id="${id}"]`),
      )
      .filter((el): el is HTMLElement => !!el);
    setTargets(els);
  }, [e.selectedIds]);

  useEffect(() => {
    if (!draggingRef.current) moveableRef.current?.updateRect();
  }, [e.gameObjects]);

  const selectByMarquee = useCallback(
    (els: Array<HTMLElement | SVGElement>) => {
      const ids = goIdsOf(els);
      const pruned = ids.filter(
        (id) => !ids.some((o) => o !== id && isDescendantOf(e.gameObjects, id, o)),
      );
      e.setSelectedIds(pruned);
    },
    [e],
  );

  function snapFor(id: string): Snap | null {
    const go = e.gameObjects.find((g) => g.id === id);
    if (!go) return null;
    const origin = ancestorOffset(go, e.gameObjects);
    const parent = go.parentId
      ? e.gameObjects.find((g) => g.id === go.parentId)
      : undefined;
    return {
      id,
      pivot: go.transform.pivot,
      rotation: go.transform.rotation ?? 0,
      position: go.transform.position,
      size: go.transform.size,
      origin,
      parentSize: parent
        ? parent.transform.size
        : { x: DESIGN_WIDTH, y: DESIGN_HEIGHT },
      abs: toAbsRect(
        go.transform.position,
        go.transform.size,
        go.transform.pivot,
        origin,
      ),
      pending: null,
    };
  }

  function beginTargets() {
    const map = new Map<string, Snap>();
    for (const id of goIdsOf(targetsRef.current)) {
      const s = snapFor(id);
      if (s) map.set(id, s);
    }
    gestureRef.current = map;
    draggingRef.current = true;
  }

  function paint(el: HTMLElement, s: Snap, t: RectTransformValues) {
    Object.assign(
      el.style,
      rectTransformStyle(t.position, t.size, s.pivot, t.rotation ?? 0, s.parentSize),
    );
  }

  function applyDrag(el: HTMLElement | SVGElement, dist: number[]) {
    const s = gestureRef.current.get((el as HTMLElement).dataset.goId ?? "");
    if (!s) return;
    const rect: AbsRect = {
      left: s.abs.left + dist[0],
      top: s.abs.top + dist[1],
      w: s.abs.w,
      h: s.abs.h,
    };
    const { position } = fromAbsRect(rect, s.pivot, s.origin);
    s.pending = { position };
    paint(el as HTMLElement, s, { position, size: s.size, pivot: s.pivot, rotation: s.rotation });
  }

  function applyResize(
    el: HTMLElement | SVGElement,
    beforeTranslate: number[],
    width: number,
    height: number,
  ) {
    const s = gestureRef.current.get((el as HTMLElement).dataset.goId ?? "");
    if (!s) return;
    const rect: AbsRect = {
      left: s.abs.left + beforeTranslate[0],
      top: s.abs.top + beforeTranslate[1],
      w: width,
      h: height,
    };
    const { position, size } = fromAbsRect(rect, s.pivot, s.origin);
    s.pending = { position, size };
    paint(el as HTMLElement, s, { position, size, pivot: s.pivot, rotation: s.rotation });
  }

  function applyRotate(
    el: HTMLElement | SVGElement,
    rotation: number,
    beforeTranslate: number[],
  ) {
    const s = gestureRef.current.get((el as HTMLElement).dataset.goId ?? "");
    if (!s) return;
    const rot = Math.round(rotation);
    const rect: AbsRect = {
      left: s.abs.left + beforeTranslate[0],
      top: s.abs.top + beforeTranslate[1],
      w: s.abs.w,
      h: s.abs.h,
    };
    const { position } = fromAbsRect(rect, s.pivot, s.origin);
    s.pending = { position, rotation: rot };
    paint(el as HTMLElement, s, { position, size: s.size, pivot: s.pivot, rotation: rot });
  }

  function commitTargets() {
    const map = gestureRef.current;
    draggingRef.current = false;
    gestureRef.current = new Map();
    const patches = new Map<string, Partial<RectTransformValues>>();
    map.forEach((s, id) => {
      if (s.pending) patches.set(id, s.pending);
    });
    if (patches.size) {
      e.setGameObjects((prev) =>
        prev.map((go) => {
          const p = patches.get(go.id);
          return p ? { ...go, transform: { ...go.transform, ...p } } : go;
        }),
      );
    }
    moveableRef.current?.updateRect();
  }

  const sceneObjects = useMemo(
    () =>
      e.gameObjects
        .filter((go) => !go.parentId && go.active)
        .map((go) => (
          <GameObjectView
            key={go.id}
            gameObject={go}
            allGameObjects={e.gameObjects}
            onAnimatePosition={e.animatePosition}
          />
        )),
    [e.gameObjects, e.animatePosition],
  );

  const moveableTarget =
    targets.length === 0 ? null : targets.length === 1 ? targets[0] : targets;

  return (
    <div className="flex h-full flex-col bg-bg">
      <div className="flex h-[30px] shrink-0 items-center gap-1.5 border-b border-line bg-head px-1.5">
        <Tbtn onClick={() => zoomBy(1 / 1.2)} title="Alejar">
          <Minus size={12} />
        </Tbtn>
        <span className="w-11 text-center font-mono text-2xs text-dim">
          {Math.round(zoom * 100)}%
        </span>
        <Tbtn onClick={() => zoomBy(1.2)} title="Acercar">
          <Plus size={12} />
        </Tbtn>
        <span className="mx-0.5 h-4 w-px bg-line" />
        <Tbtn onClick={fit} title="Encajar">
          <Maximize size={11} />
          Encajar
        </Tbtn>
        <Tbtn onClick={zoom100} title="Zoom 100%">
          100%
        </Tbtn>
        <div className="flex-1" />
        <span className="font-mono text-2xs text-faint">1920 × 1080</span>
      </div>

      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ background: "#202327" }}
      >
        <InfiniteViewer
          ref={viewerRef}
          className={cn("scene-viewer h-full w-full", spaceHeld && "cursor-grab")}
          useWheelScroll
          useWheelPinch
          useMouseDrag={spaceHeld}
          onScroll={() => moveableRef.current?.updateRect()}
          onPinch={() => moveableRef.current?.updateRect()}
        >
          <div
            ref={viewportRef}
            className="relative [container-type:size]"
            style={{ width: DESIGN_WIDTH, height: DESIGN_HEIGHT }}
          >
            <div
              className="pointer-events-none absolute inset-0 border border-edge"
              style={{ background: CHECKER }}
            />
            <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-acc/15" />
            <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-acc/15" />

            <SceneViewModeProvider value="scene">
              <div ref={e.stageRef} className="absolute inset-0">
                {sceneObjects}
              </div>
            </SceneViewModeProvider>

            <Moveable
              ref={moveableRef}
              target={moveableTarget}
              draggable
              resizable
              rotatable
              keepRatio={shiftHeld}
              origin={false}
              onDragStart={beginTargets}
              onDrag={(ev) => applyDrag(ev.target, ev.dist)}
              onDragEnd={commitTargets}
              onResizeStart={beginTargets}
              onResize={(ev) =>
                applyResize(ev.target, ev.drag.beforeTranslate, ev.width, ev.height)
              }
              onResizeEnd={commitTargets}
              onRotateStart={beginTargets}
              onRotate={(ev) =>
                applyRotate(ev.target, ev.rotation, ev.drag.beforeTranslate)
              }
              onRotateEnd={commitTargets}
              onDragGroupStart={beginTargets}
              onDragGroup={(ev) =>
                ev.events.forEach((x) => applyDrag(x.target, x.dist))
              }
              onDragGroupEnd={commitTargets}
              onResizeGroupStart={beginTargets}
              onResizeGroup={(ev) =>
                ev.events.forEach((x) =>
                  applyResize(x.target, x.drag.beforeTranslate, x.width, x.height),
                )
              }
              onResizeGroupEnd={commitTargets}
              onRotateGroupStart={beginTargets}
              onRotateGroup={(ev) =>
                ev.events.forEach((x) =>
                  applyRotate(x.target, x.rotation, x.drag.beforeTranslate),
                )
              }
              onRotateGroupEnd={commitTargets}
            />
          </div>
        </InfiniteViewer>

        {!spaceHeld && (
          <Selecto
            ref={selectoRef}
            dragContainer=".scene-viewer"
            selectableTargets={["[data-go-id]"]}
            hitRate={0}
            selectByClick
            selectFromInside={false}
            toggleContinueSelect={["shift"]}
            ratio={0}
            onDragStart={(ev) => {
              const t = ev.inputEvent.target as HTMLElement;
              if (
                moveableRef.current?.isMoveableElement(t) ||
                targetsRef.current.some((el) => el === t || el.contains(t))
              ) {
                ev.stop();
              }
            }}
            onSelect={(ev) => selectByMarquee(ev.selected)}
            onSelectEnd={(ev) => {
              if (ev.isDragStartEnd) {
                ev.inputEvent.preventDefault();
                moveableRef.current?.waitToChangeTarget().then(() => {
                  moveableRef.current?.dragStart(ev.inputEvent);
                });
              }
              selectByMarquee(ev.selected);
            }}
          />
        )}
      </div>
    </div>
  );
}
