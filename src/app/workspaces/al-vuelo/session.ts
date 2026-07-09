import { loadJsonFile } from "@/helpers/persistence";
import { useGameSession } from "@/hooks/use-game-session";
import {
  isAlVueloData,
  type AlVueloData,
} from "./components/controller/controllerComponent";

export async function loadAlVueloSession(file: File) {
  const data = await loadJsonFile<AlVueloData>(file, isAlVueloData);
  useGameSession.getState().setSession(data, { fileName: file.name });
}
