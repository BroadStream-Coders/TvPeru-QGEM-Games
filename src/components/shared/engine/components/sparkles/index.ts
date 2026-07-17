import { defineComponent } from "@engine/componentRegistry";
import {
  SparklesComponent,
  createSparklesComponent,
} from "./sparklesComponent";
import { SparklesView } from "./SparklesView";
import { SparklesInspector } from "./SparklesInspector";

export const sparklesDefinition = defineComponent<SparklesComponent>({
  type: "sparkles",
  label: "Sparkles",
  create: () => createSparklesComponent(),
  view: SparklesView,
  editor: SparklesInspector,
});
