import { GameObjectComponent } from "@engine/gameObject";

export interface SpellframeComponent extends GameObjectComponent {
  type: "spellframe";
  word: string;
  spellStep: number;
  fontSize: number;
  letterSpacing: number;
  underlineGap: number;
  fontFamily?: string;
  fontSrc?: string;
  fontFileName?: string;
}

export function createSpellframeComponent(
  init?: Partial<Omit<SpellframeComponent, "type">>,
): SpellframeComponent {
  return {
    type: "spellframe",
    word: init?.word ?? "",
    spellStep: init?.spellStep ?? 0,
    fontSize: init?.fontSize ?? 60,
    letterSpacing: init?.letterSpacing ?? 20,
    underlineGap: init?.underlineGap ?? 0,
    fontFamily: init?.fontFamily,
    fontSrc: init?.fontSrc,
    fontFileName: init?.fontFileName,
  };
}
