import { GameObjectComponent } from "@engine/gameObject";
import { Vec2 } from "@engine/RectTransform";

export interface SlideComponent extends GameObjectComponent {
  type: "slide";
  speed: number;
  target: Vec2;
}

export function createSlideComponent(
  init?: Partial<Omit<SlideComponent, "type">>,
): SlideComponent {
  return {
    type: "slide",
    speed: init?.speed ?? 1800,
    target: init?.target ?? { x: 0, y: 0 },
  };
}
