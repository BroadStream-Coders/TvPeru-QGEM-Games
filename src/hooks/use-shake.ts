import { useCallback, useEffect, useRef } from "react";

export interface ShakeOptions {
  /** Magnitud máxima del desplazamiento lateral (en `unit`). */
  amplitude?: number;
  /** Unidad CSS del desplazamiento. Por defecto "%" (relativo al ancho del elemento). */
  unit?: string;
  /** Sacudidas completas (cada una = ida y vuelta). */
  shakes?: number;
  /** Duración total del efecto en segundos. */
  duration?: number;
}

export function useShake<T extends HTMLElement>({
  amplitude = 2,
  unit = "%",
  shakes = 3,
  duration = 0.4,
}: ShakeOptions = {}) {
  const ref = useRef<T>(null);
  const animRef = useRef<Animation | null>(null);

  const shake = useCallback(() => {
    const el = ref.current;
    if (!el || shakes <= 0 || duration <= 0 || amplitude <= 0) return;

    animRef.current?.cancel();

    // Cada sacudida = 2 pasos (derecha, izquierda); +1 paso final que vuelve a 0.
    const lateralSteps = shakes * 2;
    const values: number[] = [0];
    for (let i = 0; i < lateralSteps; i++) {
      values.push(i % 2 === 0 ? amplitude : -amplitude);
    }
    values.push(0);

    const keyframes = values.map((x) => ({
      transform: `translateX(${x}${unit})`,
    }));

    animRef.current = el.animate(keyframes, {
      duration: duration * 1000,
      easing: "linear",
    });
  }, [amplitude, unit, shakes, duration]);

  useEffect(() => () => animRef.current?.cancel(), []);

  return { ref, shake };
}
