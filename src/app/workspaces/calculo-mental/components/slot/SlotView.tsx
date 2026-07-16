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
  centerLeft: string,
  centerTop: string,
  width: string,
  height: string,
  src: string,
): CSSProperties => ({
  position: "absolute",
  left: `calc(${centerLeft} - ${width} / 2)`,
  top: `calc(${centerTop} - ${height} / 2)`,
  width,
  height,
  backgroundImage: src ? `url(${src})` : undefined,
  backgroundSize: "100% 100%",
  backgroundRepeat: "no-repeat",
});

export function SlotView({ component }: { component: SlotComponent }) {
  const { assets } = useAssets();
  const url = (key: string) => assets[key]?.url ?? "";
  return (
    <div className="absolute inset-0">
      <div
        style={frameStyle(
          "47.33%",
          "34.5%",
          "94.66%",
          "69%",
          url(FRAME_KEYS.blue),
        )}
      />
      <div
        style={frameStyle(
          "68.54%",
          "75.79%",
          "62.93%",
          "48.41%",
          url(FRAME_KEYS.purple),
        )}
      />

      {component.status === "correct" && (
        <div
          style={frameStyle(
            "95.84%",
            "4.06%",
            "25.17%",
            "45.63%",
            url(FRAME_KEYS.check),
          )}
        />
      )}
      {component.status === "incorrect" && (
        <div
          style={frameStyle(
            "93.65%",
            "3.78%",
            "20.79%",
            "40.62%",
            url(FRAME_KEYS.x),
          )}
        />
      )}
    </div>
  );
}
