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
  fontFamily?: string;
  fontSrc?: string;
  fontFileName?: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
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
    fontFamily: init?.fontFamily,
    fontSrc: init?.fontSrc,
    fontFileName: init?.fontFileName,
    bold: init?.bold ?? false,
    italic: init?.italic ?? false,
    underline: init?.underline ?? false,
    alignH: init?.alignH ?? "center",
    alignV: init?.alignV ?? "middle",
    overflow: init?.overflow ?? "wrap",
  };
}
