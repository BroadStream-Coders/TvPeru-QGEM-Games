import { VideoComponent } from "@engine/components/video/videoComponent";
import { useAssets } from "@engine/assetsContext";

export function VideoView({ component }: { component: VideoComponent }) {
  const { assets } = useAssets();
  const url = component.assetKey ? assets[component.assetKey]?.url : undefined;
  if (!url) return null;
  return (
    <video
      src={url}
      autoPlay
      loop={component.loop}
      muted={component.muted}
      playsInline
      className="h-full w-full"
      style={{ objectFit: component.fit }}
    />
  );
}
