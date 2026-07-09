import { loadJsonFile } from "@/helpers/persistence";
import { useSceneRuntime } from "@/hooks/use-scene-runtime";
import { LEVEL1_ID } from "./constants";
import {
  isLaSabesData,
  type LaSabesData,
} from "./components/controller/controllerComponent";

export async function loadLaSabesSession(file: File) {
  const data = await loadJsonFile<LaSabesData>(file, isLaSabesData);

  useSceneRuntime.getState().patchComponent(LEVEL1_ID, "controller", {
    groups: data.groups,
    groupIndex: 0,
    questionIndex: 0,
    selected: -1,
    fileName: file.name,
    loadedAt: Date.now(),
  });
}
