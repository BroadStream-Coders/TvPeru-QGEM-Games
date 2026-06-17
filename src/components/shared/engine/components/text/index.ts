import { defineComponent } from "@engine/componentRegistry";
import { TextComponent, createTextComponent } from "@engine/components/text/textComponent";
import { TextView } from "@engine/components/text/TextView";
import { TextInspector } from "@engine/components/text/TextInspector";

export const textDefinition = defineComponent<TextComponent>({
  type: "text",
  label: "Text",
  create: () => createTextComponent(),
  view: TextView,
  editor: TextInspector,
});
