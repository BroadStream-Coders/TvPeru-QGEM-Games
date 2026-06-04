import { GameObjectComponent } from "@engine/gameObject";

export type VideoFit = "contain" | "cover" | "fill";
export type VideoSource = "file" | "url";

export interface VideoComponent extends GameObjectComponent {
  type: "video";
  src: string;
  fit: VideoFit;
  source: VideoSource;
  fileName?: string;
}

export function createVideoComponent(
  init?: Partial<Omit<VideoComponent, "type">>,
): VideoComponent {
  return {
    type: "video",
    src: init?.src ?? "",
    fit: init?.fit ?? "fill",
    source: init?.source ?? "url",
    fileName: init?.fileName,
  };
}
