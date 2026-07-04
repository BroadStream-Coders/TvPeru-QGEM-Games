"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import InfiniteViewer from "react-infinite-viewer";
import { Maximize, Minus, Plus } from "lucide-react";

import { useEditor } from "@engine/editor/editorContext";
import { GameObjectView } from "@engine/GameObjectView";
import { SelectionOverlay } from "@engine/SelectionOverlay";
import { SceneViewModeProvider } from "@engine/SceneViewMode";
import { DESIGN_WIDTH, DESIGN_HEIGHT } from "@engine/RectTransform";
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
  const [zoom, setZoom] = useState(1);
  const [spaceHeld, setSpaceHeld] = useState(false);

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
      if (isTyping(ev.target) || ev.code !== "Space") return;
      ev.preventDefault();
      setSpaceHeld(true);
    };
    const onKeyUp = (ev: KeyboardEvent) => {
      if (ev.code === "Space") setSpaceHeld(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

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
          className={cn("h-full w-full", spaceHeld && "cursor-grab")}
          useWheelScroll
          useWheelPinch
          useMouseDrag={spaceHeld}
        >
          <div
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
                {e.gameObjects
                  .filter((go) => !go.parentId && go.active)
                  .map((go) => (
                    <GameObjectView
                      key={go.id}
                      gameObject={go}
                      allGameObjects={e.gameObjects}
                      selectedId={e.selectedId}
                      onAnimatePosition={e.animatePosition}
                    />
                  ))}
              </div>
              {e.editMode && (
                <SelectionOverlay
                  selected={e.selected}
                  allGameObjects={e.gameObjects}
                  onGesture={e.beginGesture}
                />
              )}
            </SceneViewModeProvider>
          </div>
        </InfiniteViewer>
      </div>
    </div>
  );
}
