import { jetBrainsMono } from "@/lib/fonts";
import { DESIGN_WIDTH } from "@engine/RectTransform";

export interface SpellTextConfig {
  fontSize: number;
  letterSpacing: number;
  underlineGap: number;
}

export function SpellFrame({
  word,
  spellStep,
  textConfig,
}: {
  word: string;
  spellStep: number;
  textConfig: SpellTextConfig;
}) {
  return (
    <div className="w-full h-full">
      <div
        className={`${jetBrainsMono.className} w-full h-full flex items-center justify-center font-black uppercase leading-none text-white`}
        style={{
          fontSize: `${(textConfig.fontSize / DESIGN_WIDTH) * 100}cqw`,
          gap: `${(textConfig.letterSpacing / DESIGN_WIDTH) * 100}cqw`,
        }}
      >
        {word.split("").map((char, i) => (
          <span
            key={i}
            className="inline-flex flex-col items-center leading-none"
          >
            <span className="leading-none">{char}</span>
            <span
              className="bg-current"
              style={{
                marginTop: `${textConfig.underlineGap / 100}em`,
                width: "0.7em",
                height: "0.09em",
                opacity: i < spellStep ? 1 : 0,
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
