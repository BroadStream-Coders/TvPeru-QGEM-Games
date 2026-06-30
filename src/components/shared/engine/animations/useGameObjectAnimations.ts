import { useCallback, useEffect, useRef } from "react";
import { usePop } from "@/hooks/use-pop";
import { useShake } from "@/hooks/use-shake";
import { useBounceMove } from "@/hooks/use-bounce-move";
import { useSlide } from "@/hooks/use-slide";
import { GameObject } from "@engine/gameObject";
import { Vec2 } from "@engine/RectTransform";
import { PopComponent } from "@engine/components/pop/popComponent";
import { ShakeComponent } from "@engine/components/shake/shakeComponent";
import { BounceComponent } from "@engine/components/bounce/bounceComponent";
import { SlideComponent } from "@engine/components/slide/slideComponent";
import { useAnimations } from "./AnimationsContext";

/**
 * Corre los hooks de animación de un GameObject. Pop y Shake animan el
 * content-div (que envuelve componentes + hijos) vía Web Animations; Bounce y
 * Slide animan la posición del transform (a través de `onAnimatePosition`).
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

  const { ref: popRef, pop } = usePop<HTMLDivElement>({
    scale: popComp?.scale,
    duration: popComp?.duration,
  });
  const { ref: shakeRef, shake } = useShake<HTMLDivElement>({
    amplitude: shakeComp?.amplitude,
    shakes: shakeComp?.shakes,
    duration: shakeComp?.duration,
  });
  const bounce = useBounceMove({
    travelSpeed: bounceComp?.travelSpeed,
    bounceAmplitude: bounceComp?.bounceAmplitude,
    bounceDuration: bounceComp?.bounceDuration,
  });
  const slide = useSlide({ speed: slideComp?.speed });

  const { register, unregister } = useAnimations();
  const id = gameObject.id;
  const hasPop = !!popComp;
  const hasShake = !!shakeComp;
  const hasBounce = !!bounceComp;
  const hasSlide = !!slideComp;
  const offsetX = slideComp?.hiddenOffset.x ?? 0;
  const offsetY = slideComp?.hiddenOffset.y ?? 0;

  const posRef = useRef<Vec2>(gameObject.transform.position);
  posRef.current = gameObject.transform.position;
  const homeRef = useRef<Vec2 | null>(null);
  if (homeRef.current === null) homeRef.current = gameObject.transform.position;

  useEffect(() => {
    if (!hasPop) return;
    register(id, "pop", pop);
    return () => unregister(id, "pop");
  }, [id, hasPop, pop, register, unregister]);

  useEffect(() => {
    if (!hasShake) return;
    register(id, "shake", shake);
    return () => unregister(id, "shake");
  }, [id, hasShake, shake, register, unregister]);

  useEffect(() => {
    if (!hasBounce) return;
    const run = () => {
      slide.cancel();
      const home = homeRef.current ?? posRef.current;
      bounce.moveTo(posRef.current, home, (pos) =>
        onAnimatePosition?.(id, pos),
      );
    };
    register(id, "bounce", run);
    return () => unregister(id, "bounce");
  }, [id, hasBounce, bounce, slide, onAnimatePosition, register, unregister]);

  useEffect(() => {
    if (!hasSlide) return;
    const run = () => {
      bounce.cancel();
      const home = homeRef.current ?? posRef.current;
      const target = { x: home.x + offsetX, y: home.y + offsetY };
      slide.moveTo(posRef.current, target, (pos) =>
        onAnimatePosition?.(id, pos),
      );
    };
    register(id, "slide", run);
    return () => unregister(id, "slide");
  }, [
    id,
    hasSlide,
    bounce,
    slide,
    offsetX,
    offsetY,
    onAnimatePosition,
    register,
    unregister,
  ]);

  return useCallback(
    (node: HTMLDivElement | null) => {
      popRef.current = node;
      shakeRef.current = node;
    },
    [popRef, shakeRef],
  );
}
