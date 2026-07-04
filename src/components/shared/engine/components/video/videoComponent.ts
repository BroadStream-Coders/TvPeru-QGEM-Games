import { GameObjectComponent } from "@engine/gameObject";

export type VideoFit = "contain" | "fill";

export interface VideoComponent extends GameObjectComponent {
  type: "video";
  fit: VideoFit;
  assetKey?: string;
  muted: boolean;
  loop: boolean;
}

export function createVideoComponent(
  init?: Partial<Omit<VideoComponent, "type">>,
): VideoComponent {
  return {
    type: "video",
    fit: init?.fit ?? "fill",
    assetKey: init?.assetKey,
    muted: init?.muted ?? true,
    loop: init?.loop ?? true,
  };
}
