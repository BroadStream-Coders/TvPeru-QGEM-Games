import { loadJsonFile } from "@/helpers/persistence";
import { useGameSession } from "@/hooks/use-game-session";
import {
  isBuscaLogoData,
  type BoardData,
  type BuscaLogoData,
} from "./components/controller/controllerComponent";

export interface BuscaLogoSession {
  boards: BoardData[];
}

export async function loadBuscaLogoSession(file: File) {
  const data = await loadJsonFile<BuscaLogoData>(file, isBuscaLogoData);
  const session: BuscaLogoSession = { boards: data.boards };
  useGameSession.getState().setSession(session, { fileName: file.name });
}
