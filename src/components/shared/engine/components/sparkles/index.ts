import { Sparkle } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import {
  SparklesComponent,
  createSparklesComponent,
} from "./sparklesComponent";
import { SparklesView } from "./SparklesView";

export const sparklesDefinition = defineComponent<SparklesComponent>({
  type: "sparkles",
  label: "Sparkles",
  create: () => createSparklesComponent(),
  view: SparklesView,
  schema: {
    icon: Sparkle,
    accent: "anim",
    fields: [
      { key: "enabled", type: "boolean", label: "Enabled" },
      { key: "rate", type: "number", label: "Rate" },
      { key: "size", type: "number", label: "Size" },
      { key: "duration", type: "number", label: "Duration" },
    ],
  },
});
