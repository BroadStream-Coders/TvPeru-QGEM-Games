"use client";

import React, { useRef, useState, useEffect } from "react";
import { Maximize } from "lucide-react";
import { cn } from "@/lib/utils";

export type FullScreenBackground =
  | { type: "color"; value: string }
  | { type: "image"; value: string }
  | { type: "video"; value: string };

interface FullScreenProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Clase para manejar la proporción, por defecto 16:9 (aspect-video) */
  aspectRatioClass?: string;
  background?: FullScreenBackground;
}

function StageBackground({ background }: { background: FullScreenBackground }) {
  if (background.type === "video") {
    return (
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src={background.value}
        autoPlay
        loop
        muted
        playsInline
      />
    );
  }

  if (background.type === "image") {
    return (
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${background.value})` }}
      />
    );
  }

  return <div className="absolute inset-0" style={{ backgroundColor: background.value }} />;
}

export function FullScreen({
  children,
  className,
  aspectRatioClass = "aspect-video",
  background = { type: "color", value: "#000000" },
  ...props
}: FullScreenProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Escuchar cuando el navegador entra o sale de FullScreen (por ejemplo si el usuario presiona ESC)
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
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
      console.error("Error al intentar cambiar el modo de pantalla completa:", err);
    }
  };

  return (
    // 'group' nos sirve para mostrar el botón de maximizar solo cuando pasamos el mouse
    <div className="relative group w-full flex flex-col items-center">

      <div
        ref={containerRef}
        tabIndex={0}
        className={cn(
          "relative focus:outline-none flex items-center justify-center transition-all duration-300",
          isFullscreen ? "w-screen h-screen bg-black" : "w-full"
        )}
      >
        <div
          className={cn(
            "relative overflow-hidden [container-type:size]",
            aspectRatioClass,
            isFullscreen
              ? "h-full w-auto max-w-full"
              : "w-full max-w-[1280px] rounded-xl shadow-lg border border-slate-800",
            className
          )}
          {...props}
        >
          <StageBackground background={background} />

          <div className="relative z-10 w-full h-full">{children}</div>

          {!isFullscreen && (
            <button
              onClick={toggleFullscreen}
              className={cn(
                "absolute bottom-4 right-4 p-2 bg-black/60 hover:bg-black/80 text-white rounded-lg transition-opacity z-50 backdrop-blur-sm",
                "opacity-0 group-hover:opacity-100"
              )}
              title="Pantalla completa"
            >
              <Maximize size={24} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
}
