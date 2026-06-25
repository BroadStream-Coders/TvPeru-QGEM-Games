import { GameObjectComponent } from "@engine/gameObject";

export interface VideoControlComponent extends GameObjectComponent {
  type: "videoControl";
  pauseKey: string;
  restartKey: string;
}

export function createVideoControlComponent(
  init?: Partial<Omit<VideoControlComponent, "type">>,
): VideoControlComponent {
  return {
    type: "videoControl",
    pauseKey: init?.pauseKey ?? "k",
    restartKey: init?.restartKey ?? "j",
  };
}
