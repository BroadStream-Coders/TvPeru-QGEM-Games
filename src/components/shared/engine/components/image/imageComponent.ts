import { GameObjectComponent } from "@engine/gameObject";

export type ImageFit = "contain" | "fill";

export interface ImageComponent extends GameObjectComponent {
  type: "image";
  fit: ImageFit;
  assetKey?: string;
  src?: string;
  flipX?: boolean;
  filter?: string;
}

export function createImageComponent(
  init?: Partial<Omit<ImageComponent, "type">>,
): ImageComponent {
  return {
    type: "image",
    fit: init?.fit ?? "fill",
    assetKey: init?.assetKey,
  };
}
