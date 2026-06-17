import { defineComponent } from "@engine/componentRegistry";
import {
  SpellframeComponent,
  createSpellframeComponent,
} from "./spellframeComponent";
import { SpellframeView } from "./SpellframeView";
import { SpellframeInspector } from "./SpellframeInspector";

export const spellframeDefinition = defineComponent<SpellframeComponent>({
  type: "spellframe",
  label: "Spellframe",
  create: () => createSpellframeComponent(),
  view: SpellframeView,
  editor: SpellframeInspector,
});
