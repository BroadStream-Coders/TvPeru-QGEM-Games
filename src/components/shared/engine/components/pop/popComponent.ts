import { GameObjectComponent } from "@engine/gameObject";

export interface PopComponent extends GameObjectComponent {
  type: "pop";
  scale: number;
  duration: number;
}

export function createPopComponent(
  init?: Partial<Omit<PopComponent, "type">>,
): PopComponent {
  return {
    type: "pop",
    scale: init?.scale ?? 1.1,
    duration: init?.duration ?? 0.3,
  };
}
