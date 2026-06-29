import { CSSProperties } from "react";
import { GameObjectComponent } from "@engine/gameObject";
import { ImageFit } from "@engine/components/image/imageComponent";

export interface MaskComponent extends GameObjectComponent {
  type: "mask";
  showImage: boolean;
}

export function createMaskComponent(
  init?: Partial<Omit<MaskComponent, "type">>,
): MaskComponent {
  return {
    type: "mask",
    showImage: init?.showImage ?? true,
  };
}

export function maskStyle(src: string, fit: ImageFit): CSSProperties {
  const size = fit === "fill" ? "100% 100%" : fit;
  const mask = `url(${src})`;
  return {
    maskImage: mask,
    WebkitMaskImage: mask,
    maskRepeat: "no-repeat",
    WebkitMaskRepeat: "no-repeat",
    maskPosition: "center",
    WebkitMaskPosition: "center",
    maskSize: size,
    WebkitMaskSize: size,
  };
}
