import { DESIGN_WIDTH } from "@engine/RectTransform";
import { SpellframeComponent } from "./spellframeComponent";
import { useAssets } from "@engine/assetsContext";

export function SpellframeView({
  component,
}: {
  component: SpellframeComponent;
}) {
  const { assets } = useAssets();
  const fontFamily = component.fontAssetKey
    ? assets[component.fontAssetKey]?.family
    : undefined;
  return (
    <div className="w-full h-full">
      <div
        className="w-full h-full flex items-center justify-center font-normal uppercase leading-none text-white"
        style={{
          fontFamily,
          fontSize: `${(component.fontSize / DESIGN_WIDTH) * 100}cqw`,
          gap: `${(component.letterSpacing / DESIGN_WIDTH) * 100}cqw`,
        }}
      >
        {component.word.split("").map((char, i) => (
          <span
            key={i}
            className="inline-flex flex-col items-center leading-none"
          >
            <span className="leading-none">{char}</span>
            <span
              className="bg-current"
              style={{
                marginTop: `${component.underlineGap / 100}em`,
                width: "0.7em",
                height: "0.09em",
                opacity: i < component.spellStep ? 1 : 0,
              }}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
