import { CSSProperties } from "react";
import {
  TextAlignH,
  TextAlignV,
  TextComponent,
  TextOverflow,
} from "@engine/components/text/textComponent";

const JUSTIFY: Record<TextAlignH, CSSProperties["justifyContent"]> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

const ALIGN: Record<TextAlignV, CSSProperties["alignItems"]> = {
  top: "flex-start",
  middle: "center",
  bottom: "flex-end",
};

const TEXT_ALIGN: Record<TextAlignH, CSSProperties["textAlign"]> = {
  left: "left",
  center: "center",
  right: "right",
};

function overflowStyle(overflow: TextOverflow): CSSProperties {
  if (overflow === "wrap") {
    return { whiteSpace: "pre-wrap", overflowWrap: "break-word", overflow: "hidden" };
  }
  if (overflow === "clip") {
    return { whiteSpace: "pre", overflow: "hidden" };
  }
  return { whiteSpace: "pre", overflow: "visible" };
}

export function TextView({ component }: { component: TextComponent }) {
  return (
    <div
      className="flex h-full w-full"
      style={{
        justifyContent: JUSTIFY[component.alignH],
        alignItems: ALIGN[component.alignV],
      }}
    >
      <div
        style={{
          color: component.color,
          fontFamily: component.fontFamily,
          fontSize: `${component.fontSize}cqh`,
          lineHeight: 1.1,
          textAlign: TEXT_ALIGN[component.alignH],
          ...overflowStyle(component.overflow),
        }}
      >
        {component.text}
      </div>
    </div>
  );
}
