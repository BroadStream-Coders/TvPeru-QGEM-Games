import { CSSProperties } from "react";
import { useAssets } from "@engine/assetsContext";
import { SlotComponent } from "./slotComponent";

const FRAME_KEYS = {
  blue: "blueFrame",
  purple: "purpleFrame",
  check: "check",
  x: "x",
} as const;

const frameStyle = (
  left: string,
  top: string,
  width: string,
  height: string,
  src: string,
): CSSProperties => ({
  position: "absolute",
  left,
  top,
  width,
  height,
  transform: "translate(-50%, -50%)",
  backgroundImage: src ? `url(${src})` : undefined,
  backgroundSize: "contain",
  backgroundRepeat: "no-repeat",
  backgroundPosition: "center",
});

export function SlotView({ component }: { component: SlotComponent }) {
  const { assets } = useAssets();
  const url = (key: string) => assets[key]?.url ?? "";
  return (
    <div className="absolute inset-0">
      <div
        style={frameStyle("48%", "35%", "86.5%", "62%", url(FRAME_KEYS.blue))}
      />
      <div
        style={frameStyle(
          "67.25%",
          "72.5%",
          "57.5%",
          "43.5%",
          url(FRAME_KEYS.purple),
        )}
      />

      {component.status === "correct" && (
        <div
          style={frameStyle("92.5%", "7.5%", "23%", "41%", url(FRAME_KEYS.check))}
        />
      )}
      {component.status === "incorrect" && (
        <div
          style={frameStyle("90%", "7.5%", "19%", "36.5%", url(FRAME_KEYS.x))}
        />
      )}
    </div>
  );
}
