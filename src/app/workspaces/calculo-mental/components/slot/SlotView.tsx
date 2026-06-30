import { CSSProperties } from "react";
import { SlotComponent } from "./slotComponent";

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
  return (
    <div className="absolute inset-0">
      <div
        style={frameStyle("48%", "35%", "86.5%", "62%", component.blueSrc)}
      />
      <div
        style={frameStyle(
          "67.25%",
          "72.5%",
          "57.5%",
          "43.5%",
          component.purpleSrc,
        )}
      />

      {component.status === "correct" && (
        <div
          style={frameStyle("92.5%", "7.5%", "23%", "41%", component.checkSrc)}
        />
      )}
      {component.status === "incorrect" && (
        <div
          style={frameStyle("90%", "7.5%", "19%", "36.5%", component.xSrc)}
        />
      )}
    </div>
  );
}
