"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ViewModeTabs } from "@engine/ViewModeTabs";
import { SceneViewModeProvider, ViewMode } from "@engine/SceneViewMode";

interface SceneProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Clase para manejar la proporción, por defecto 16:9 (aspect-video) */
  aspectRatioClass?: string;
  /** Oculta el cursor mientras está en pantalla completa (se sale con ESC) */
  hideCursorOnFullscreen?: boolean;
  viewMode?: ViewMode;
  /** Recibe el toggle de fullscreen una vez montado (para dispararlo desde la topbar). */
  onFullscreenReady?: (toggle: () => void) => void;
}

const STAGE_BACKGROUND_CLASS = "bg-stage";

const VIEWPORT_CHECKER: React.CSSProperties = {
  background:
    "repeating-conic-gradient(#101214 0 25%, #0c0e10 0 50%) 0 / 22px 22px",
};

const GRID_CELL = "5.208333cqw";
const STAGE_GRID_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(to right, var(--border) 0 1px, transparent 1px), linear-gradient(to bottom, var(--border) 0 1px, transparent 1px)",
  backgroundSize: `${GRID_CELL} ${GRID_CELL}`,
  backgroundPosition: "center",
};

export function Scene({
  children,
  className,
  aspectRatioClass = "aspect-video",
  hideCursorOnFullscreen = false,
  viewMode: viewModeProp,
  onFullscreenReady,
  ...props
}: SceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [internalViewMode, setInternalViewMode] = useState<ViewMode>("game");
  const controlled = viewModeProp !== undefined;
  const viewMode = controlled ? viewModeProp : internalViewMode;

  // Escuchar cuando el navegador entra o sale de FullScreen (por ejemplo si el usuario presiona ESC)
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        // Entrar a fullscreen y enfocar el contenedor para que escuche el teclado
        await containerRef.current?.requestFullscreen();
        containerRef.current?.focus();
      } else {
        // Salir de fullscreen
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error(
        "Error al intentar cambiar el modo de pantalla completa:",
        err,
      );
    }
  }, []);

  useEffect(() => {
    onFullscreenReady?.(toggleFullscreen);
  }, [onFullscreenReady, toggleFullscreen]);

  return (
    // 'group' nos sirve para mostrar el botón de maximizar solo cuando pasamos el mouse
    <div className="relative group flex h-full w-full flex-col">
      {!isFullscreen && !controlled && (
        <div className="w-full shrink-0">
          <ViewModeTabs
            mode={viewMode}
            onChange={setInternalViewMode}
            onFullscreen={toggleFullscreen}
          />
        </div>
      )}
      <div
        ref={containerRef}
        tabIndex={0}
        style={isFullscreen ? undefined : VIEWPORT_CHECKER}
        className={cn(
          "relative focus:outline-none flex items-center justify-center transition-all duration-300",
          isFullscreen
            ? "w-screen h-screen bg-black"
            : "min-h-0 w-full flex-1 overflow-auto p-3",
          isFullscreen && hideCursorOnFullscreen && "cursor-none",
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden [container-type:size]",
            STAGE_BACKGROUND_CLASS,
            aspectRatioClass,
            isFullscreen
              ? "h-full w-auto max-w-full"
              : "w-full max-w-[1280px] shadow-lg border border-edge",
            className,
          )}
          {...props}
        >
          <div className="absolute inset-0" style={STAGE_GRID_STYLE} />

          <div className="relative z-10 w-full h-full">
            <SceneViewModeProvider value={viewMode}>
              {children}
            </SceneViewModeProvider>
          </div>
        </div>
      </div>
    </div>
  );
}
