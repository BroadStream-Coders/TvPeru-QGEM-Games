import { ImageComponent } from "@/components/shared/engine/components/image/imageComponent";

export function ImageView({ component }: { component: ImageComponent }) {
  if (!component.src) return null;
  const backgroundSize = component.fit === "fill" ? "100% 100%" : component.fit;
  return (
    <div
      className="h-full w-full bg-center bg-no-repeat"
      style={{
        backgroundImage: `url(${component.src})`,
        backgroundSize,
      }}
    />
  );
}
