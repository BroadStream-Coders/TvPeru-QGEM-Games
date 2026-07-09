import { loadZipFile } from "@/helpers/persistence";
import { useGameSession } from "@/hooks/use-game-session";
import { useMemoryBudget } from "@/hooks/use-memory-budget";
import {
  isIntrusoData,
  type IntrusoRound,
} from "./components/controller/controllerComponent";

export interface IntrusoSession {
  rounds: IntrusoRound[];
}

const mimeFor = (path: string) =>
  /\.jpe?g$/i.test(path) ? "image/jpeg" : "image/png";

export async function loadIntrusoSession(file: File) {
  const zip = await loadZipFile(file);
  const entry = zip.file("sessionData.json");
  if (!entry) throw new Error("El ZIP no contiene sessionData.json.");
  const data: unknown = JSON.parse(await entry.async("string"));
  if (!isIntrusoData(data)) {
    throw new Error("Estructura de archivo no válida para este juego.");
  }

  const rounds: IntrusoRound[] = await Promise.all(
    data.textRounds.map(async (r) => {
      const img = zip.file(r.imagePath);
      const base = { answerIndex: r.answerIndex, choices: r.choices };
      if (!img) return { ...base, imageUrl: "" };

      const blob = new Blob([await img.async("arraybuffer")], {
        type: mimeFor(r.imagePath),
      });
      const imageUrl = URL.createObjectURL(blob);
      const el = new Image();
      el.src = imageUrl;
      await el.decode().catch(() => {});
      useMemoryBudget.getState().register("session", r.imagePath, {
        kind: "image",
        bytes: blob.size,
        width: el.naturalWidth,
        height: el.naturalHeight,
      });
      return { ...base, imageUrl };
    }),
  );

  const session: IntrusoSession = { rounds };
  useGameSession.getState().setSession(session, {
    fileName: file.name,
    dispose: () => {
      rounds.forEach((r) => {
        if (r.imageUrl) URL.revokeObjectURL(r.imageUrl);
      });
      useMemoryBudget.getState().clear("session");
    },
  });
}
