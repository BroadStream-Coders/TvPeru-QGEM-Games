import { GameObjectComponent } from "@engine/gameObject";
import { ImageFit } from "@engine/components/image/imageComponent";

export interface ColorComponent extends GameObjectComponent {
  type: "color";
  value: string;
  shape?: string;
  shapeFileName?: string;
  fit: ImageFit;
}

export function createColorComponent(
  init?: Partial<Omit<ColorComponent, "type">>,
): ColorComponent {
  return {
    type: "color",
    value: init?.value ?? "#ffffff",
    shape: init?.shape,
    shapeFileName: init?.shapeFileName,
    fit: init?.fit ?? "fill",
  };
}
