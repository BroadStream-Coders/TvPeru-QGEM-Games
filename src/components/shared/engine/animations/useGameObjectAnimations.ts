import { useCallback, useEffect, useRef } from "react";
import { animate, type AnimationPlaybackControls } from "motion";
import { GameObject } from "@engine/gameObject";
import { Vec2 } from "@engine/RectTransform";
import { PopComponent } from "@engine/components/pop/popComponent";
import { FlipComponent } from "@engine/components/flip/flipComponent";
import { FloatComponent } from "@engine/components/float/floatComponent";
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

/**
 * Corre las animaciones de un GameObject sobre `motion`. Pop, Shake y Flip
 * animan el content-div (que envuelve componentes + hijos); Bounce y Slide
 * animan la posición del transform (a través de `onAnimatePosition`, capa
 * runtime). Flip registra dos triggers (`flipHide`: 0→90°, sostiene el canto;
 * `flipShow`: 90°→0) para que el behavior haga el swap de caras en el medio.
 * Float es ambiental: no se dispara con `play()`, corre en loop mientras el
 * GameObject esté montado (bob vertical en % de la altura + balanceo de
 * rotación a período distinto; `phase` desincroniza instancias).
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
  const flipComp = gameObject.components.find((c) => c.type === "flip") as
    FlipComponent | undefined;
  const floatComp = gameObject.components.find((c) => c.type === "float") as
    FloatComponent | undefined;
  const shakeComp = gameObject.components.find((c) => c.type === "shake") as
    ShakeComponent | undefined;
  const bounceComp = gameObject.components.find((c) => c.type === "bounce") as
    BounceComponent | undefined;
  const slideComp = gameObject.components.find((c) => c.type === "slide") as
    SlideComponent | undefined;

  const { register, unregister } = useAnimations();
  const id = gameObject.id;
  const hasPop = !!popComp;
  const hasFlip = !!flipComp;
  const hasShake = !!shakeComp;
  const hasBounce = !!bounceComp;
  const hasSlide = !!slideComp;

  const popScale = popComp?.scale ?? 1.1;
  const popDuration = popComp?.duration ?? 0.3;
  const flipHideDuration = flipComp?.hideDuration ?? 0.25;
  const flipShowDuration = flipComp?.showDuration ?? 0.45;
  const flipPerspective = flipComp?.perspective ?? 6;
  const hasFloat = !!floatComp;
  const floatAmplitude = floatComp?.amplitude ?? 3;
  const floatRotation = floatComp?.rotation ?? 0.6;
  const floatPeriod = floatComp?.period ?? 6;
  const floatPhase = floatComp?.phase ?? 0;
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
  const flipRef = useRef<AnimationPlaybackControls | null>(null);
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
    const pop = async () => {
      const el = elRef.current;
      if (!el || popScale <= 0 || popDuration <= 0) return;
      popRef.current?.cancel();
      const controls = animate(
        el,
        { scale: [1, popScale, 1] },
        { duration: popDuration, ease: ["backOut", "easeOut"] },
      );
      popRef.current = controls;
      try {
        await controls;
      } catch {
        return;
      }
      if (popRef.current === controls) el.style.transform = "";
    };
    register(id, "pop", pop);
    return () => unregister(id, "pop");
  }, [id, hasPop, popScale, popDuration, register, unregister]);

  useEffect(() => {
    if (!hasFlip) return;
    const hide = async () => {
      const el = elRef.current;
      if (!el || flipHideDuration <= 0) return;
      flipRef.current?.stop();
      const controls = animate(
        el,
        {
          transformPerspective: el.offsetWidth * flipPerspective,
          rotateY: [0, 90],
        },
        { duration: flipHideDuration, ease: "easeIn" },
      );
      flipRef.current = controls;
      try {
        await controls;
      } catch {}
    };
    const show = async () => {
      const el = elRef.current;
      if (!el) return;
      flipRef.current?.stop();
      const controls = animate(
        el,
        {
          transformPerspective: el.offsetWidth * flipPerspective,
          rotateY: [90, 0],
        },
        { duration: Math.max(flipShowDuration, 0.01), ease: "backOut" },
      );
      flipRef.current = controls;
      try {
        await controls;
      } catch {}
    };
    register(id, "flipHide", hide);
    register(id, "flipShow", show);
    return () => {
      unregister(id, "flipHide");
      unregister(id, "flipShow");
    };
  }, [
    id,
    hasFlip,
    flipHideDuration,
    flipShowDuration,
    flipPerspective,
    register,
    unregister,
  ]);

  useEffect(() => {
    if (!hasFloat) return;
    const el = elRef.current;
    if (!el || floatPeriod <= 0) return;
    const anims: AnimationPlaybackControls[] = [];
    if (floatAmplitude !== 0) {
      const bob = animate(
        el,
        { y: ["0%", `${-floatAmplitude}%`, "0%"] },
        { duration: floatPeriod, ease: "easeInOut", repeat: Infinity },
      );
      bob.time = floatPhase;
      anims.push(bob);
    }
    if (floatRotation !== 0) {
      const sway = animate(
        el,
        { rotate: [-floatRotation, floatRotation] },
        {
          duration: floatPeriod * 0.65,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "mirror",
        },
      );
      sway.time = floatPhase;
      anims.push(sway);
    }
    return () => anims.forEach((a) => a.stop());
  }, [hasFloat, floatAmplitude, floatRotation, floatPeriod, floatPhase]);

  useEffect(() => {
    if (!hasShake) return;
    const shake = async () => {
      const el = elRef.current;
      if (!el || shakeShakes <= 0 || shakeDuration <= 0 || shakeAmplitude <= 0)
        return;
      shakeRef.current?.cancel();
      const values: number[] = [0];
      for (let i = 0; i < shakeShakes * 2; i++) {
        values.push(i % 2 === 0 ? shakeAmplitude : -shakeAmplitude);
      }
      values.push(0);
      const controls = animate(
        el,
        { x: values.map((v) => `${v}%`) },
        { duration: shakeDuration, ease: "linear" },
      );
      shakeRef.current = controls;
      try {
        await controls;
      } catch {
        return;
      }
      if (shakeRef.current === controls) el.style.transform = "";
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
    const run = async () => {
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
      await travel;
      if (moveRef.current.seq !== seq) return;
      const settle = animate(0, 1, {
        duration: bounceDuration,
        ease: easeOutBounce,
        onUpdate: (t) => onAnimatePosition?.(id, lerp(overshoot, to, t)),
      });
      moveRef.current.controls = settle;
      await settle;
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
    const run = async () => {
      cancelMove();
      const from = posRef.current;
      const home = homeRef.current ?? from;
      const to = { x: home.x + offsetX, y: home.y + offsetY };
      const dist = Math.hypot(to.x - from.x, to.y - from.y);
      if (dist < 0.001 || slideSpeed <= 0) {
        onAnimatePosition?.(id, to);
        return;
      }
      const controls = animate(0, 1, {
        duration: dist / slideSpeed,
        ease: "easeInOut",
        onUpdate: (t) => onAnimatePosition?.(id, lerp(from, to, t)),
      });
      moveRef.current.controls = controls;
      await controls;
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
      popRef.current?.cancel();
      flipRef.current?.stop();
      shakeRef.current?.cancel();
      cancelMove();
    },
    [cancelMove],
  );

  return useCallback((node: HTMLDivElement | null) => {
    elRef.current = node;
  }, []);
}
