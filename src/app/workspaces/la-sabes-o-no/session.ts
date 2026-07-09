import { loadJsonFile } from "@/helpers/persistence";
import { useGameSession } from "@/hooks/use-game-session";
import {
  isLaSabesData,
  type LaSabesData,
} from "./components/controller/controllerComponent";

export async function loadLaSabesSession(file: File) {
  const data = await loadJsonFile<LaSabesData>(file, isLaSabesData);
  useGameSession.getState().setSession(data, { fileName: file.name });
}
