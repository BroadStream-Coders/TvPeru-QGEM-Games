import { loadZipFile } from "@/helpers/persistence";
import { useGameSession } from "@/hooks/use-game-session";
import { useMemoryBudget } from "@/hooks/use-memory-budget";
import {
  isAlbumData,
  type AlbumRound,
} from "./components/controller/controllerComponent";

export interface AlbumSession {
  rounds: AlbumRound[];
}

const mimeFor = (path: string) =>
  /\.jpe?g$/i.test(path) ? "image/jpeg" : "image/png";

export async function loadAlbumSession(file: File) {
  const zip = await loadZipFile(file);
  const entry = zip.file("sessionData.json");
  if (!entry) throw new Error("El ZIP no contiene sessionData.json.");
  const data: unknown = JSON.parse(await entry.async("string"));
  if (!isAlbumData(data)) {
    throw new Error("Estructura de archivo no válida para este juego.");
  }

  const rounds: AlbumRound[] = await Promise.all(
    data.rounds.map(async (r) => ({
      title: r.title,
      cards: await Promise.all(
        r.cards.map(async (c) => {
          const base = { isCroma: !!c.isCroma, question: c.question };
          const img = zip.file(c.imagePath);
          if (!img) return { ...base, imageUrl: "" };

          const blob = new Blob([await img.async("arraybuffer")], {
            type: mimeFor(c.imagePath),
          });
          const imageUrl = URL.createObjectURL(blob);
          const el = new Image();
          el.src = imageUrl;
          await el.decode().catch(() => {});
          useMemoryBudget.getState().register("session", c.imagePath, {
            kind: "image",
            bytes: blob.size,
            width: el.naturalWidth,
            height: el.naturalHeight,
          });
          return { ...base, imageUrl };
        }),
      ),
    })),
  );

  const session: AlbumSession = { rounds };
  useGameSession.getState().setSession(session, {
    fileName: file.name,
    dispose: () => {
      rounds.forEach((r) =>
        r.cards.forEach((c) => {
          if (c.imageUrl) URL.revokeObjectURL(c.imageUrl);
        }),
      );
      useMemoryBudget.getState().clear("session");
    },
  });
}
