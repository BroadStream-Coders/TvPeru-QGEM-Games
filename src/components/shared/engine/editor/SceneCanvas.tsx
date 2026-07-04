"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import InfiniteViewer from "react-infinite-viewer";
import Moveable from "react-moveable";
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
import { ancestorOffset } from "@engine/gameObject";
import { toAbsRect, fromAbsRect, type AbsRect } from "@engine/editor/sceneTransform";
import { cn } from "@/lib/utils";

const CHECKER =
  "repeating-conic-gradient(#101214 0 25%, #0c0e10 0 50%) 0 / 44px 44px";
const MIN_ZOOM = 0.05;
const MAX_ZOOM = 4;
const FIT_MARGIN = 0.9;

function isTyping(t: EventTarget | null) {
  return (
    t instanceof HTMLElement &&
    (t.tagName === "INPUT" || t.tagName === "TEXTAREA")
  );
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
  const [zoom, setZoom] = useState(1);
  const [spaceHeld, setSpaceHeld] = useState(false);
  const [shiftHeld, setShiftHeld] = useState(false);
  const [keepRatio, setKeepRatio] = useState(false);
  const [target, setTarget] = useState<HTMLElement | null>(null);

  const gestureRef = useRef<{
    id: string;
    el: HTMLElement;
    pivot: Vec2;
    rotation: number;
    position: Vec2;
    size: Vec2;
    origin: Vec2;
    parentSize: Vec2;
    abs: AbsRect;
    pending: Partial<RectTransformValues> | null;
  } | null>(null);
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
    if (!e.selectedId) {
      setTarget(null);
      return;
    }
    const el = viewportRef.current?.querySelector<HTMLElement>(
      `[data-go-id="${e.selectedId}"]`,
    );
    setTarget(el ?? null);
  }, [e.selectedId]);

  useEffect(() => {
    if (!draggingRef.current) moveableRef.current?.updateRect();
  }, [e.gameObjects]);

  function startGesture() {
    const go = e.selected;
    if (!go || !target) return;
    const origin = ancestorOffset(go, e.gameObjects);
    const parent = go.parentId
      ? e.gameObjects.find((g) => g.id === go.parentId)
      : undefined;
    gestureRef.current = {
      id: go.id,
      el: target,
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
    draggingRef.current = true;
  }

  function paint(position: Vec2, size: Vec2, rotation: number) {
    const g = gestureRef.current;
    if (!g) return;
    Object.assign(
      g.el.style,
      rectTransformStyle(position, size, g.pivot, rotation, g.parentSize),
    );
  }

  function endGesture() {
    const g = gestureRef.current;
    draggingRef.current = false;
    gestureRef.current = null;
    if (g?.pending) e.setTransform(g.id, g.pending);
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
            selectedId={e.selectedId}
            onAnimatePosition={e.animatePosition}
          />
        )),
    [e.gameObjects, e.selectedId, e.animatePosition],
  );

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
        <span className="mx-0.5 h-4 w-px bg-line" />
        <button
          onClick={() => setKeepRatio((v) => !v)}
          title="Mantener proporción al redimensionar"
          className={cn(
            "flex h-6 items-center rounded-[5px] border px-2 text-2xs font-medium transition-colors",
            keepRatio
              ? "border-acc/60 bg-acc-bg text-acc"
              : "border-line bg-elev text-dim hover:bg-elev-2",
          )}
        >
          Ratio
        </button>
        <div className="flex-1" />
        <span className="font-mono text-2xs text-faint">1920 × 1080</span>
      </div>

      <div
        className="relative min-h-0 flex-1 overflow-hidden"
        style={{ background: "#202327" }}
      >
        <InfiniteViewer
          ref={viewerRef}
          className={cn("h-full w-full", spaceHeld && "cursor-grab")}
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
              target={target}
              draggable
              resizable
              rotatable
              keepRatio={keepRatio || shiftHeld}
              origin={false}
              onDragStart={startGesture}
              onDrag={(ev) => {
                const g = gestureRef.current;
                if (!g) return;
                const rect: AbsRect = {
                  left: g.abs.left + ev.dist[0],
                  top: g.abs.top + ev.dist[1],
                  w: g.abs.w,
                  h: g.abs.h,
                };
                const { position } = fromAbsRect(rect, g.pivot, g.origin);
                g.pending = { position };
                paint(position, g.size, g.rotation);
              }}
              onDragEnd={endGesture}
              onResizeStart={startGesture}
              onResize={(ev) => {
                const g = gestureRef.current;
                if (!g) return;
                const rect: AbsRect = {
                  left: g.abs.left + ev.drag.beforeTranslate[0],
                  top: g.abs.top + ev.drag.beforeTranslate[1],
                  w: ev.width,
                  h: ev.height,
                };
                const { position, size } = fromAbsRect(rect, g.pivot, g.origin);
                g.pending = { position, size };
                paint(position, size, g.rotation);
              }}
              onResizeEnd={endGesture}
              onRotateStart={startGesture}
              onRotate={(ev) => {
                const g = gestureRef.current;
                if (!g) return;
                const rotation = Math.round(ev.rotation);
                g.pending = { rotation };
                paint(g.position, g.size, rotation);
              }}
              onRotateEnd={endGesture}
            />
          </div>
        </InfiniteViewer>
      </div>
    </div>
  );
}
