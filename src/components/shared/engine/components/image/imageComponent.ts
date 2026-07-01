import { GameObjectComponent } from "@engine/gameObject";

export type ImageFit = "contain" | "fill";

export interface ImageComponent extends GameObjectComponent {
  type: "image";
  src: string;
  fit: ImageFit;
  fileName?: string;
  assetKey?: string;
}

export function createImageComponent(
  init?: Partial<Omit<ImageComponent, "type">>,
): ImageComponent {
  return {
    type: "image",
    src: init?.src ?? "",
    fit: init?.fit ?? "fill",
    fileName: init?.fileName,
    assetKey: init?.assetKey,
  };
}
