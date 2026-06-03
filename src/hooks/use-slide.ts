import { useCallback, useEffect, useRef } from "react";
import type { Vec2 } from "@/components/shared/Transform";

export interface SlideOptions {
  /** Velocidad del movimiento en unidades de diseño por segundo. */
  speed?: number;
}

const easeInOutSine = (t: number) => -(Math.cos(Math.PI * t) - 1) / 2;

const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export function useSlide({ speed = 1800 }: SlideOptions = {}) {
  const rafRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const moveTo = useCallback(
    (from: Vec2, to: Vec2, onUpdate: (pos: Vec2) => void) => {
      cancel();

      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      const duration = dist / speed;
      if (duration <= 0) {
        onUpdate(to);
        return;
      }

      const start = performance.now();
      const tick = (now: number) => {
        const t = (now - start) / 1000;
        if (t < duration) {
          onUpdate(lerp(from, to, easeInOutSine(t / duration)));
          rafRef.current = requestAnimationFrame(tick);
        } else {
          onUpdate(to);
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [speed, cancel],
  );

  useEffect(() => cancel, [cancel]);

  return { moveTo, cancel };
}
