import { ImageComponent } from "@engine/components/image/imageComponent";
import { useAssets } from "@engine/assetsContext";

export function ImageView({ component }: { component: ImageComponent }) {
  const { assets } = useAssets();
  const url =
    component.src ||
    (component.assetKey ? assets[component.assetKey]?.url : undefined);
  if (!url) return null;
  const backgroundSize = component.fit === "fill" ? "100% 100%" : component.fit;
  return (
    <div
      className="h-full w-full bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${url})`,
        backgroundSize,
        transform: component.flipX ? "scaleX(-1)" : undefined,
        filter: component.filter,
      }}
    />
  );
}
