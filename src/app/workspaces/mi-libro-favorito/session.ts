import { loadJsonFile } from "@/helpers/persistence";
import { useGameSession } from "@/hooks/use-game-session";
import {
  isMiLibroData,
  type MiLibroData,
} from "./components/controller/controllerComponent";

export async function loadMiLibroSession(file: File) {
  const data = await loadJsonFile<MiLibroData>(file, isMiLibroData);
  useGameSession.getState().setSession(data, { fileName: file.name });
}
