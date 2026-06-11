import { CSSProperties } from "react";
import { ColorComponent } from "@engine/components/color/colorComponent";

export function ColorView({ component }: { component: ColorComponent }) {
  const maskStyle: CSSProperties = component.shape
    ? (() => {
        const maskSize =
          component.fit === "fill" ? "100% 100%" : component.fit;
        const mask = `url(${component.shape})`;
        return {
          maskImage: mask,
          WebkitMaskImage: mask,
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
          maskSize,
          WebkitMaskSize: maskSize,
        };
      })()
    : {};

  return (
    <div
      className="h-full w-full"
      style={{ backgroundColor: component.value, ...maskStyle }}
    />
  );
}
