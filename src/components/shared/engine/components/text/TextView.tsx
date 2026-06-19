import { CSSProperties } from "react";
import {
  TextAlignH,
  TextAlignV,
  TextComponent,
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

export function TextView({ component }: { component: TextComponent }) {
  const wrap = component.overflow === "wrap";
  return (
    <div
      className="flex h-full w-full"
      style={{
        justifyContent: JUSTIFY[component.alignH],
        alignItems: ALIGN[component.alignV],
        overflow: component.overflow === "overflow" ? "visible" : "hidden",
      }}
    >
      <div
        style={{
          color: component.color,
          fontFamily: component.fontFamily,
          fontSize: `${component.fontSize}cqh`,
          fontWeight: component.bold ? "bold" : "normal",
          fontStyle: component.italic ? "italic" : "normal",
          textDecoration: component.underline ? "underline" : "none",
          lineHeight: 1.1,
          textAlign: TEXT_ALIGN[component.alignH],
          whiteSpace: wrap ? "pre-wrap" : "pre",
          overflowWrap: wrap ? "break-word" : undefined,
        }}
      >
        {component.text}
      </div>
    </div>
  );
}
