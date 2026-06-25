import { VideoComponent } from "@engine/components/video/videoComponent";

export function VideoView({ component }: { component: VideoComponent }) {
  if (!component.src) return null;
  return (
    <video
      src={component.src}
      autoPlay
      loop={component.loop}
      muted={component.muted}
      playsInline
      className="h-full w-full"
      style={{ objectFit: component.fit }}
    />
  );
}
