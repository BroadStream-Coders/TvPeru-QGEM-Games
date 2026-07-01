import type { ReactNode } from "react";
import type { GameObject } from "@engine/gameObject";
import type { ComponentDefinition } from "@engine/componentRegistry";
import type { AssetCatalog } from "@/helpers/asset-source";

export interface GameDefinition {
  id: string;
  title: string;
  icon?: ReactNode;
  assets?: AssetCatalog;
  gameObjects?: GameObject[] | (() => GameObject[]);
  components?: ComponentDefinition[];
}
