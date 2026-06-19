import { CSSProperties } from "react";
import { SlotComponent } from "./slotComponent";

const FONT = "var(--font-poppins-semibold)";

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

const textStyle = (fontSize: string): CSSProperties => ({
  color: "#ffffff",
  fontFamily: FONT,
  fontSize,
  lineHeight: 1.1,
  textAlign: "center",
});

export function SlotView({ component }: { component: SlotComponent }) {
  return (
    <div className="absolute inset-0">
      <div style={frameStyle("48%", "35%", "86.5%", "62%", component.blueSrc)}>
        {component.showQuestion && (
          <div className="flex h-full w-full items-center justify-center overflow-hidden">
            <span style={textStyle("2.8cqh")}>{component.question}</span>
          </div>
        )}
      </div>

      <div
        style={frameStyle("67.25%", "72.5%", "57.5%", "43.5%", component.purpleSrc)}
      >
        {component.showAnswer && (
          <div className="flex h-full w-full items-center justify-center overflow-hidden">
            <span style={textStyle("3.6cqh")}>{component.answer}</span>
          </div>
        )}
      </div>

      {component.status === "correct" && (
        <div style={frameStyle("92.5%", "7.5%", "23%", "41%", component.checkSrc)} />
      )}
      {component.status === "incorrect" && (
        <div style={frameStyle("90%", "7.5%", "19%", "36.5%", component.xSrc)} />
      )}
    </div>
  );
}
