import { GameObjectComponent } from "@engine/gameObject";

export type ImageFit = "contain" | "cover" | "fill";

export interface ImageComponent extends GameObjectComponent {
  type: "image";
  src: string;
  fit: ImageFit;
  fileName?: string;
}

export function createImageComponent(
  init?: Partial<Omit<ImageComponent, "type">>,
): ImageComponent {
  return {
    type: "image",
    src: init?.src ?? "",
    fit: init?.fit ?? "fill",
    fileName: init?.fileName,
  };
}
