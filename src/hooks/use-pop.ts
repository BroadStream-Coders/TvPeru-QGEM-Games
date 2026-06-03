import { useCallback, useEffect, useRef } from "react";

export interface PopOptions {
  /** Escala máxima alcanzada durante el pop. */
  scale?: number;
  /** Duración total del efecto en segundos. */
  duration?: number;
  /** Easing de la subida (hasta la escala máxima). */
  easeIn?: string;
  /** Easing de la bajada (vuelta a la escala original). */
  easeOut?: string;
}

export function usePop<T extends HTMLElement>({
  scale = 1.1,
  duration = 0.3,
  easeIn = "cubic-bezier(0.34, 1.56, 0.64, 1)",
  easeOut = "cubic-bezier(0.61, 1, 0.88, 1)",
}: PopOptions = {}) {
  const ref = useRef<T>(null);
  const animRef = useRef<Animation | null>(null);

  const pop = useCallback(() => {
    const el = ref.current;
    if (!el || scale <= 0 || duration <= 0) return;

    animRef.current?.cancel();

    const keyframes = [
      { transform: "scale(1)", easing: easeIn },
      { transform: `scale(${scale})`, easing: easeOut },
      { transform: "scale(1)" },
    ];

    animRef.current = el.animate(keyframes, {
      duration: duration * 1000,
    });
  }, [scale, duration, easeIn, easeOut]);

  useEffect(() => () => animRef.current?.cancel(), []);

  return { ref, pop };
}
