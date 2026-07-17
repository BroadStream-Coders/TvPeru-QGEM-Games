"use client";

import { CSSProperties, useLayoutEffect, useRef, useState } from "react";
import {
  TextAlignH,
  TextAlignV,
  TextComponent,
} from "@engine/components/text/textComponent";
import { useAssets } from "@engine/assetsContext";

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
  const boxRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const [fittedSize, setFittedSize] = useState(component.fontSize);

  const { assets } = useAssets();
  const fontFamily = component.fontAssetKey
    ? assets[component.fontAssetKey]?.family
    : undefined;

  const { autoSize, fontSizeMin, fontSizeMax, text, bold, italic } = component;
  const letterSpacing = component.letterSpacing ?? 0;
  const lineSpacing = component.lineSpacing ?? 0;

  useLayoutEffect(() => {
    if (!autoSize) return;
    const box = boxRef.current;
    const el = textRef.current;
    if (!box || !el) return;

    const prev = el.style.fontSize;

    const measure = () => {
      const maxW = box.clientWidth;
      const maxH = box.clientHeight;
      if (maxW === 0 || maxH === 0) return;

      const min = Math.max(0, Math.min(fontSizeMin, fontSizeMax));
      const max = Math.max(fontSizeMin, fontSizeMax);

      const fits = (size: number) => {
        el.style.fontSize = `${size}cqh`;
        const fitsH = el.scrollHeight <= maxH + 0.5;
        const fitsW = el.scrollWidth <= maxW + 0.5;
        return fitsH && fitsW;
      };

      let best = min;
      if (fits(max)) {
        best = max;
      } else if (fits(min)) {
        let lo = min;
        let hi = max;
        for (let i = 0; i < 12; i++) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) {
            best = mid;
            lo = mid;
          } else {
            hi = mid;
          }
        }
      }
      el.style.fontSize = `${best}cqh`;
      setFittedSize(best);
    };

    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(box);

    let cancelled = false;
    document.fonts.ready.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
      ro.disconnect();
      el.style.fontSize = prev;
    };
  }, [
    autoSize,
    fontSizeMin,
    fontSizeMax,
    text,
    fontFamily,
    bold,
    italic,
    wrap,
    letterSpacing,
    lineSpacing,
  ]);

  const size = autoSize ? fittedSize : component.fontSize;

  return (
    <div
      ref={boxRef}
      className="flex h-full w-full"
      style={{
        justifyContent: JUSTIFY[component.alignH],
        alignItems: ALIGN[component.alignV],
        overflow: component.overflow === "overflow" ? "visible" : "hidden",
      }}
    >
      <div
        ref={textRef}
        style={{
          minWidth: 0,
          color: component.color,
          fontFamily,
          fontSize: `${size}cqh`,
          fontWeight: component.bold ? "bold" : "normal",
          fontStyle: component.italic ? "italic" : "normal",
          textDecoration: component.underline ? "underline" : "none",
          letterSpacing: `${letterSpacing / 100}em`,
          lineHeight: lineSpacing === 0 ? "normal" : 1.2 + lineSpacing / 100,
          textAlign: TEXT_ALIGN[component.alignH],
          whiteSpace: wrap ? "pre-wrap" : "pre",
        }}
      >
        {component.text}
      </div>
    </div>
  );
}
