import { MousePointerClick } from "lucide-react";
import { defineComponent } from "@engine/componentRegistry";
import { CardComponent, createCardComponent } from "./cardComponent";
import { CardView } from "./CardView";

export const cardDefinition = defineComponent<CardComponent>({
  type: "card",
  label: "Card",
  create: () => createCardComponent(),
  view: CardView,
  schema: {
    icon: MousePointerClick,
    fields: [{ key: "index", type: "number", label: "Index" }],
  },
});
