import type { ComponentType, ReactNode } from "react";
import type { GameObject } from "@engine/gameObject";
import type { ComponentDefinition } from "@engine/componentRegistry";
import type { AssetCatalog } from "@/helpers/asset-source";
import type { PlayEditing } from "@/hooks/use-play-mode";
import type { EditorApi } from "./editorContext";

export interface GameDefinition {
  id: string;
  title: string;
  icon?: ReactNode;
  assets?: AssetCatalog;
  gameObjects?: GameObject[] | (() => GameObject[]);
  initialSelectedId?: string | null;
  components?: ComponentDefinition[];
  behavior?: ComponentType;
  onLoad?: (file: File, editor: EditorApi) => void;
  playConfig?: { editing?: PlayEditing };
  requiresSession?: boolean;
}
