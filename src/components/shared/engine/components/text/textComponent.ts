import { GameObjectComponent } from "@engine/gameObject";

export type TextAlignH = "left" | "center" | "right";
export type TextAlignV = "top" | "middle" | "bottom";
export type TextOverflow = "wrap" | "overflow" | "clip";

export interface TextComponent extends GameObjectComponent {
  type: "text";
  text: string;
  fontSize: number;
  autoSize: boolean;
  fontSizeMin: number;
  fontSizeMax: number;
  color: string;
  fontAssetKey?: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  letterSpacing: number;
  lineSpacing: number;
  alignH: TextAlignH;
  alignV: TextAlignV;
  overflow: TextOverflow;
}

export function createTextComponent(
  init?: Partial<Omit<TextComponent, "type">>,
): TextComponent {
  return {
    type: "text",
    text: init?.text ?? "Texto",
    fontSize: init?.fontSize ?? 8,
    autoSize: init?.autoSize ?? false,
    fontSizeMin: init?.fontSizeMin ?? 1,
    fontSizeMax: init?.fontSizeMax ?? 20,
    color: init?.color ?? "#ffffff",
    fontAssetKey: init?.fontAssetKey,
    bold: init?.bold ?? false,
    italic: init?.italic ?? false,
    underline: init?.underline ?? false,
    letterSpacing: init?.letterSpacing ?? 0,
    lineSpacing: init?.lineSpacing ?? 0,
    alignH: init?.alignH ?? "center",
    alignV: init?.alignV ?? "middle",
    overflow: init?.overflow ?? "wrap",
  };
}
