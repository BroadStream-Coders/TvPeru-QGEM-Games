import { useCallback, useEffect, useRef } from "react";
import { animate, type AnimationPlaybackControls } from "motion";
import { GameObject } from "@engine/gameObject";
import { Vec2 } from "@engine/RectTransform";
import { PopComponent } from "@engine/components/pop/popComponent";
import { BlinkComponent } from "@engine/components/blink/blinkComponent";
import { FlipComponent } from "@engine/components/flip/flipComponent";
import { FloatComponent } from "@engine/components/float/floatComponent";
import { SparklesComponent } from "@engine/components/sparkles/sparklesComponent";
import { ShakeComponent } from "@engine/components/shake/shakeComponent";
import { BounceComponent } from "@engine/components/bounce/bounceComponent";
import { SlideComponent } from "@engine/components/slide/slideComponent";
import { useSceneViewMode } from "@engine/SceneViewMode";
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
 * Corre las animaciones de un GameObject sobre `motion`. Pop, Shake, Flip y
 * Blink animan el content-div (que envuelve componentes + hijos); Bounce y
 * Slide animan la posición del transform (a través de `onAnimatePosition`,
 * capa runtime). Bounce y Slide viajan desde la posición actual hacia su
 * `target`: una posición **absoluta en coordenadas locales del padre** (igual
 * que `transform.position` y que los `target` de UIBounceMove/UISlide en
 * Unity); no hay "home" implícito. Flip registra dos
 * triggers (`flipHide`: 0→90°, sostiene el canto; `flipShow`: 90°→0) para que
 * el behavior haga el swap de caras en el medio; Blink hace lo mismo con
 * `blink` (pulso + parpadeos, resuelve antes del swap) y `blinkSettle` (dip
 * final tras el swap).
 * Float es ambiental: no se dispara con `play()`, corre en loop mientras el
 * GameObject esté montado (bob vertical en % de la altura + balanceo de
 * rotación a período distinto; `phase` desincroniza instancias).
 * Registra cada trigger en el contexto de animaciones bajo el id del
 * GameObject, sólo para los tipos presentes como componentes y sólo cuando la
 * vista es Game: las instancias del editor (panel Scene) no registran, para no
 * pisar los triggers del display (los paneles comparten un único mapa por
 * clave `(goId, type)`). Devuelve un callback-ref para el content-div.
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
  const sparklesComp = gameObject.components.find(
    (c) => c.type === "sparkles",
  ) as SparklesComponent | undefined;
  const shakeComp = gameObject.components.find((c) => c.type === "shake") as
    ShakeComponent | undefined;
  const bounceComp = gameObject.components.find((c) => c.type === "bounce") as
    BounceComponent | undefined;
  const slideComp = gameObject.components.find((c) => c.type === "slide") as
    SlideComponent | undefined;
  const blinkComp = gameObject.components.find((c) => c.type === "blink") as
    BlinkComponent | undefined;

  const { register, unregister } = useAnimations();
  const isGameView = useSceneViewMode() === "game";
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
  const hasSparkles = !!sparklesComp && sparklesComp.enabled !== false;
  const sparklesRate = sparklesComp?.rate ?? 3;
  const sparklesSize = sparklesComp?.size ?? 3.5;
  const sparklesDuration = sparklesComp?.duration ?? 0.7;
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
  const bounceTargetX = bounceComp?.target?.x ?? 0;
  const bounceTargetY = bounceComp?.target?.y ?? 0;
  const slideSpeed = slideComp?.speed ?? 1800;
  const slideTargetX = slideComp?.target?.x ?? 0;
  const slideTargetY = slideComp?.target?.y ?? 0;
  const hasBlink = !!blinkComp;
  const blinkPulseScale = blinkComp?.pulseScale ?? 1.25;
  const blinkPulseDuration = blinkComp?.pulseDuration ?? 0.12;
  const blinkCount = blinkComp?.blinkCount ?? 3;
  const blinkDuration = blinkComp?.blinkDuration ?? 0.08;

  const elRef = useRef<HTMLDivElement | null>(null);
  const popRef = useRef<AnimationPlaybackControls | null>(null);
  const blinkRef = useRef<AnimationPlaybackControls | null>(null);
  const blinkSeqRef = useRef(0);
  const flipRef = useRef<AnimationPlaybackControls | null>(null);
  const shakeRef = useRef<AnimationPlaybackControls | null>(null);
  const moveRef = useRef<{ seq: number; controls: AnimationPlaybackControls | null }>({
    seq: 0,
    controls: null,
  });

  const posRef = useRef<Vec2>(gameObject.transform.position);
  posRef.current = gameObject.transform.position;

  const cancelMove = useCallback(() => {
    moveRef.current.seq++;
    moveRef.current.controls?.stop();
    moveRef.current.controls = null;
  }, []);

  useEffect(() => {
    if (!hasPop || !isGameView) return;
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
  }, [id, hasPop, isGameView, popScale, popDuration, register, unregister]);

  useEffect(() => {
    if (!hasFlip || !isGameView) return;
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
    isGameView,
    flipHideDuration,
    flipShowDuration,
    flipPerspective,
    register,
    unregister,
  ]);

  useEffect(() => {
    if (!hasSparkles) return;
    const el = elRef.current;
    if (!el || sparklesRate <= 0 || sparklesDuration <= 0) return;
    const container = document.createElement("div");
    container.style.cssText =
      "position:absolute;inset:0;pointer-events:none;z-index:30;";
    el.appendChild(container);
    let timer = 0;
    const spawn = () => {
      const size =
        ((el.offsetWidth * sparklesSize) / 100) * (0.6 + Math.random() * 0.8);
      const p = document.createElement("div");
      const color = Math.random() < 0.35 ? "white" : "oklch(0.9 0.13 92)";
      p.style.cssText =
        `position:absolute;left:${5 + Math.random() * 90}%;top:${5 + Math.random() * 90}%;` +
        `width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;` +
        `background:${color};` +
        "clip-path:polygon(50% 0%, 65% 35%, 100% 50%, 65% 65%, 50% 100%, 35% 65%, 0% 50%, 35% 35%);" +
        `filter:drop-shadow(0 0 ${size / 3}px oklch(0.85 0.16 90 / 0.9));`;
      container.appendChild(p);
      const twinkle = animate(
        p,
        {
          scale: [0, 1, 0],
          rotate: [0, 90 + Math.random() * 90],
        },
        {
          duration: sparklesDuration * (0.7 + Math.random() * 0.6),
          ease: "easeInOut",
        },
      );
      twinkle.then(
        () => p.remove(),
        () => p.remove(),
      );
    };
    const tick = () => {
      spawn();
      timer = window.setTimeout(
        tick,
        (1000 / sparklesRate) * (0.5 + Math.random()),
      );
    };
    tick();
    return () => {
      window.clearTimeout(timer);
      container.remove();
    };
  }, [hasSparkles, sparklesRate, sparklesSize, sparklesDuration]);

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
    if (!hasShake || !isGameView) return;
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
    isGameView,
    shakeAmplitude,
    shakeShakes,
    shakeDuration,
    register,
    unregister,
  ]);

  useEffect(() => {
    if (!hasBounce || !isGameView) return;
    const run = async () => {
      cancelMove();
      const seq = moveRef.current.seq;
      const from = posRef.current;
      const to = { x: bounceTargetX, y: bounceTargetY };
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
    isGameView,
    travelSpeed,
    bounceAmplitude,
    bounceDuration,
    bounceTargetX,
    bounceTargetY,
    cancelMove,
    onAnimatePosition,
    register,
    unregister,
  ]);

  useEffect(() => {
    if (!hasBlink || !isGameView) return;
    const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    const blink = async () => {
      const el = elRef.current;
      if (!el || blinkPulseDuration <= 0) return;
      const seq = ++blinkSeqRef.current;
      el.style.opacity = "";
      const pulse = animate(
        el,
        { scale: [1, blinkPulseScale, 1] },
        { duration: blinkPulseDuration * 2, ease: "easeInOut" },
      );
      blinkRef.current = pulse;
      try {
        await pulse;
      } catch {
        return;
      }
      for (let i = 0; i < blinkCount; i++) {
        if (blinkSeqRef.current !== seq) return;
        el.style.opacity = "0";
        await wait(blinkDuration * 1000);
        if (blinkSeqRef.current !== seq) return;
        el.style.opacity = "";
        await wait(blinkDuration * 1000);
      }
      if (blinkSeqRef.current === seq) el.style.transform = "";
    };
    const settle = async () => {
      const el = elRef.current;
      if (!el) return;
      blinkRef.current?.cancel();
      const controls = animate(
        el,
        { scale: [1, 0.9, 1] },
        { duration: 0.16, ease: "easeInOut" },
      );
      blinkRef.current = controls;
      try {
        await controls;
      } catch {
        return;
      }
      if (blinkRef.current === controls) el.style.transform = "";
    };
    register(id, "blink", blink);
    register(id, "blinkSettle", settle);
    return () => {
      unregister(id, "blink");
      unregister(id, "blinkSettle");
    };
  }, [
    id,
    hasBlink,
    isGameView,
    blinkPulseScale,
    blinkPulseDuration,
    blinkCount,
    blinkDuration,
    register,
    unregister,
  ]);

  useEffect(() => {
    if (!hasSlide || !isGameView) return;
    const run = async () => {
      cancelMove();
      const from = posRef.current;
      const to = { x: slideTargetX, y: slideTargetY };
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
    isGameView,
    slideSpeed,
    slideTargetX,
    slideTargetY,
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
      blinkRef.current?.cancel();
      blinkSeqRef.current++;
      cancelMove();
    },
    [cancelMove],
  );

  return useCallback((node: HTMLDivElement | null) => {
    elRef.current = node;
  }, []);
}
