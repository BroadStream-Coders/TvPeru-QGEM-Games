import { useCallback, useEffect, useRef } from "react";
import type { Vec2 } from "@/components/shared/RectTransform";

export interface BounceMoveOptions {
  /** Velocidad de viaje en unidades de diseño por segundo. */
  travelSpeed?: number;
  /** Sobrepaso del objetivo antes de rebotar, en unidades de diseño. */
  bounceAmplitude?: number;
  /** Duración del rebote final en segundos. */
  bounceDuration?: number;
}

const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2);

function easeOutBounce(t: number) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

export function useBounceMove({
  travelSpeed = 1800,
  bounceAmplitude = 40,
  bounceDuration = 0.4,
}: BounceMoveOptions = {}) {
  const rafRef = useRef<number | null>(null);

  const cancel = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const moveTo = useCallback(
    (from: Vec2, to: Vec2, onUpdate: (pos: Vec2) => void) => {
      cancel();

      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      if (dist < 0.001) {
        onUpdate(to);
        return;
      }

      const dir = { x: (to.x - from.x) / dist, y: (to.y - from.y) / dist };
      const overshoot = {
        x: to.x + dir.x * bounceAmplitude,
        y: to.y + dir.y * bounceAmplitude,
      };

      const travelDist = Math.hypot(overshoot.x - from.x, overshoot.y - from.y);
      const travel = travelDist / travelSpeed;
      const start = performance.now();

      const tick = (now: number) => {
        const t = (now - start) / 1000;
        if (t < travel) {
          onUpdate(
            lerp(from, overshoot, easeOutSine(travel > 0 ? t / travel : 1)),
          );
          rafRef.current = requestAnimationFrame(tick);
        } else if (t < travel + bounceDuration) {
          onUpdate(
            lerp(overshoot, to, easeOutBounce((t - travel) / bounceDuration)),
          );
          rafRef.current = requestAnimationFrame(tick);
        } else {
          onUpdate(to);
          rafRef.current = null;
        }
      };

      rafRef.current = requestAnimationFrame(tick);
    },
    [travelSpeed, bounceAmplitude, bounceDuration, cancel],
  );

  useEffect(() => cancel, [cancel]);

  return { moveTo, cancel };
}
