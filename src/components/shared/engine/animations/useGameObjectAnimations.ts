import { useCallback, useEffect, useRef } from "react";
import { animate, type AnimationPlaybackControls } from "motion";
import { GameObject } from "@engine/gameObject";
import { Vec2 } from "@engine/RectTransform";
import { PopComponent } from "@engine/components/pop/popComponent";
import { ShakeComponent } from "@engine/components/shake/shakeComponent";
import { BounceComponent } from "@engine/components/bounce/bounceComponent";
import { SlideComponent } from "@engine/components/slide/slideComponent";
import { useAnimations } from "./AnimationsContext";

const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

function easeOutBounce(t: number) {
  const n1 = 7.5625;
  const d1 = 2.75;
  if (t < 1 / d1) return n1 * t * t;
  if (t < 2 / d1) return n1 * (t -= 1.5 / d1) * t + 0.75;
  if (t < 2.5 / d1) return n1 * (t -= 2.25 / d1) * t + 0.9375;
  return n1 * (t -= 2.625 / d1) * t + 0.984375;
}

const noop = () => {};

/**
 * Corre las animaciones de un GameObject sobre `motion`. Pop y Shake animan el
 * content-div (que envuelve componentes + hijos); Bounce y Slide animan la
 * posición del transform (a través de `onAnimatePosition`, capa runtime).
 * Registra cada trigger en el contexto de animaciones bajo el id del
 * GameObject, sólo para los tipos presentes como componentes. Devuelve un
 * callback-ref para el content-div.
 */
export function useGameObjectAnimations(
  gameObject: GameObject,
  onAnimatePosition?: (goId: string, position: Vec2) => void,
): (node: HTMLDivElement | null) => void {
  const popComp = gameObject.components.find((c) => c.type === "pop") as
    PopComponent | undefined;
  const shakeComp = gameObject.components.find((c) => c.type === "shake") as
    ShakeComponent | undefined;
  const bounceComp = gameObject.components.find((c) => c.type === "bounce") as
    BounceComponent | undefined;
  const slideComp = gameObject.components.find((c) => c.type === "slide") as
    SlideComponent | undefined;

  const { register, unregister } = useAnimations();
  const id = gameObject.id;
  const hasPop = !!popComp;
  const hasShake = !!shakeComp;
  const hasBounce = !!bounceComp;
  const hasSlide = !!slideComp;

  const popScale = popComp?.scale ?? 1.1;
  const popDuration = popComp?.duration ?? 0.3;
  const shakeAmplitude = shakeComp?.amplitude ?? 2;
  const shakeShakes = shakeComp?.shakes ?? 3;
  const shakeDuration = shakeComp?.duration ?? 0.4;
  const travelSpeed = bounceComp?.travelSpeed ?? 1800;
  const bounceAmplitude = bounceComp?.bounceAmplitude ?? 40;
  const bounceDuration = bounceComp?.bounceDuration ?? 0.4;
  const slideSpeed = slideComp?.speed ?? 1800;
  const offsetX = slideComp?.hiddenOffset.x ?? 0;
  const offsetY = slideComp?.hiddenOffset.y ?? 0;

  const elRef = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<AnimationPlaybackControls | null>(null);
  const shakeRef = useRef<AnimationPlaybackControls | null>(null);
  const moveRef = useRef<{ seq: number; controls: AnimationPlaybackControls | null }>({
    seq: 0,
    controls: null,
  });

  const posRef = useRef<Vec2>(gameObject.transform.position);
  posRef.current = gameObject.transform.position;
  const homeRef = useRef<Vec2 | null>(null);
  if (homeRef.current === null) homeRef.current = gameObject.transform.position;

  const cancelMove = useCallback(() => {
    moveRef.current.seq++;
    moveRef.current.controls?.stop();
    moveRef.current.controls = null;
  }, []);

  useEffect(() => {
    if (!hasPop) return;
    const pop = () => {
      const el = elRef.current;
      if (!el || popScale <= 0 || popDuration <= 0) return;
      popRef.current?.stop();
      popRef.current = animate(
        el,
        { scale: [1, popScale, 1] },
        { duration: popDuration, ease: ["backOut", "easeOut"] },
      );
    };
    register(id, "pop", pop);
    return () => unregister(id, "pop");
  }, [id, hasPop, popScale, popDuration, register, unregister]);

  useEffect(() => {
    if (!hasShake) return;
    const shake = () => {
      const el = elRef.current;
      if (!el || shakeShakes <= 0 || shakeDuration <= 0 || shakeAmplitude <= 0)
        return;
      shakeRef.current?.stop();
      const values: number[] = [0];
      for (let i = 0; i < shakeShakes * 2; i++) {
        values.push(i % 2 === 0 ? shakeAmplitude : -shakeAmplitude);
      }
      values.push(0);
      shakeRef.current = animate(
        el,
        { x: values.map((v) => `${v}%`) },
        { duration: shakeDuration, ease: "linear" },
      );
    };
    register(id, "shake", shake);
    return () => unregister(id, "shake");
  }, [
    id,
    hasShake,
    shakeAmplitude,
    shakeShakes,
    shakeDuration,
    register,
    unregister,
  ]);

  useEffect(() => {
    if (!hasBounce) return;
    const run = () => {
      cancelMove();
      const seq = moveRef.current.seq;
      const from = posRef.current;
      const to = homeRef.current ?? from;
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      if (dist < 0.001) {
        onAnimatePosition?.(id, to);
        return;
      }
      const dir = { x: (to.x - from.x) / dist, y: (to.y - from.y) / dist };
      const overshoot = {
        x: to.x + dir.x * bounceAmplitude,
        y: to.y + dir.y * bounceAmplitude,
      };
      const travelDist = Math.hypot(overshoot.x - from.x, overshoot.y - from.y);
      const travel = animate(0, 1, {
        duration: travelDist / travelSpeed,
        ease: "easeOut",
        onUpdate: (t) => onAnimatePosition?.(id, lerp(from, overshoot, t)),
      });
      moveRef.current.controls = travel;
      travel.then(() => {
        if (moveRef.current.seq !== seq) return;
        moveRef.current.controls = animate(0, 1, {
          duration: bounceDuration,
          ease: easeOutBounce,
          onUpdate: (t) => onAnimatePosition?.(id, lerp(overshoot, to, t)),
        });
      }, noop);
    };
    register(id, "bounce", run);
    return () => unregister(id, "bounce");
  }, [
    id,
    hasBounce,
    travelSpeed,
    bounceAmplitude,
    bounceDuration,
    cancelMove,
    onAnimatePosition,
    register,
    unregister,
  ]);

  useEffect(() => {
    if (!hasSlide) return;
    const run = () => {
      cancelMove();
      const from = posRef.current;
      const home = homeRef.current ?? from;
      const to = { x: home.x + offsetX, y: home.y + offsetY };
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      if (dist < 0.001 || slideSpeed <= 0) {
        onAnimatePosition?.(id, to);
        return;
      }
      moveRef.current.controls = animate(0, 1, {
        duration: dist / slideSpeed,
        ease: "easeInOut",
        onUpdate: (t) => onAnimatePosition?.(id, lerp(from, to, t)),
      });
    };
    register(id, "slide", run);
    return () => unregister(id, "slide");
  }, [
    id,
    hasSlide,
    slideSpeed,
    offsetX,
    offsetY,
    cancelMove,
    onAnimatePosition,
    register,
    unregister,
  ]);

  useEffect(
    () => () => {
      popRef.current?.stop();
      shakeRef.current?.stop();
      cancelMove();
    },
    [cancelMove],
  );

  return useCallback((node: HTMLDivElement | null) => {
    elRef.current = node;
  }, []);
}
