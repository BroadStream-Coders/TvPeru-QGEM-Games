"use client";

import { useCallback, useEffect, useState } from "react";
import JSZip from "jszip";
import {
  Download,
  FolderDown,
  CalendarArrowDown,
  RefreshCw,
} from "lucide-react";
import { supabase } from "@/helpers/supabase";
import { useAuth } from "@/hooks/use-auth";
import { AuthButton } from "@/components/shared/AuthButton";
import { loadJsonFile, loadZipFile } from "@/helpers/persistence";

const BUCKET = "data";
const FOLDERS = ["oficial", "ejemplo"] as const;

type Entry = {
  folder: string;
  name: string;
  path: string;
  size?: number;
  updatedAt?: string;
};

function formatSize(bytes?: number) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const localDate = (d: Date) => d.toLocaleDateString("sv");
const todayStr = () => localDate(new Date());
const isToday = (iso?: string) =>
  Boolean(iso) && localDate(new Date(iso!)) === todayStr();

function saveBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

export default function Sesiones() {
  const { user, loading } = useAuth();
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ name: string; text: string } | null>(
    null,
  );

  const list = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const all: Entry[] = [];
      for (const folder of FOLDERS) {
        const { data, error } = await supabase.storage
          .from(BUCKET)
          .list(folder, { sortBy: { column: "name", order: "asc" } });
        if (error) throw new Error(error.message);
        all.push(
          ...data
            .filter((f) => f.name !== ".emptyFolderPlaceholder")
            .map((f) => ({
              folder,
              name: f.name,
              path: `${folder}/${f.name}`,
              size: f.metadata?.size,
              updatedAt: f.updated_at ?? undefined,
            })),
        );
      }
      setEntries(all);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    if (user) list();
  }, [user, list]);

  const fetchBlob = async (path: string) => {
    const { data, error } = await supabase.storage.from(BUCKET).download(path);
    if (error) throw new Error(error.message);
    return data;
  };

  const openPreview = async (entry: Entry) => {
    setBusy(true);
    setError(null);
    setPreview(null);
    try {
      const blob = await fetchBlob(entry.path);
      const file = new File([blob], entry.name);
      if (entry.name.toLowerCase().endsWith(".zip")) {
        const zip = await loadZipFile(file);
        const names = Object.keys(zip.files);
        const jsonName = names.find((n) => n.toLowerCase().endsWith(".json"));
        const json = jsonName
          ? JSON.stringify(
              JSON.parse(await zip.files[jsonName].async("string")),
              null,
              2,
            )
          : "(el ZIP no contiene JSON)";
        setPreview({
          name: entry.path,
          text: `Contenido del ZIP:\n${names.map((n) => `  ${n}`).join("\n")}\n\n${jsonName ?? ""}\n${json}`,
        });
      } else {
        const parsed = await loadJsonFile<unknown>(file);
        setPreview({ name: entry.path, text: JSON.stringify(parsed, null, 2) });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const downloadOne = async (entry: Entry) => {
    setBusy(true);
    setError(null);
    try {
      saveBlob(await fetchBlob(entry.path), entry.name);
      setStatus(`✓ ${entry.name} descargado`);
      setTimeout(() => setStatus(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const downloadZip = async (
    files: Entry[],
    zipName: string,
    withFolders: boolean,
  ) => {
    if (files.length === 0) return;
    setBusy(true);
    setError(null);
    try {
      const zip = new JSZip();
      for (const f of files) {
        zip.file(withFolders ? f.path : f.name, await fetchBlob(f.path));
      }
      saveBlob(await zip.generateAsync({ type: "blob" }), zipName);
      setStatus(`✓ ${zipName} (${files.length} archivos)`);
      setTimeout(() => setStatus(null), 4000);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const todayFiles = (entries ?? []).filter(
    (e) => e.folder === "oficial" && isToday(e.updatedAt),
  );

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-bg px-6 py-12 font-sans text-ink">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Sesiones</h1>
          <AuthButton />
        </div>
        <p className="text-sm text-dim">
          Data de los juegos en el bucket{" "}
          <code className="rounded bg-elev px-1.5 py-0.5 text-xs text-acc">
            {BUCKET}
          </code>
          . Clic en el nombre para ver el contenido; el ícono descarga el
          archivo con su nombre original.
        </p>

        {!loading && !user && (
          <p className="text-sm text-yellow-400">
            Inicia sesión con Google para listar el bucket.
          </p>
        )}

        {user && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={list}
              disabled={busy}
              className="flex items-center gap-1.5 rounded-lg border border-line bg-panel px-3 py-1.5 text-sm hover:border-acc disabled:opacity-40"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {busy ? "Trabajando…" : "Recargar"}
            </button>
            <button
              onClick={() =>
                downloadZip(todayFiles, `sesiones-hoy-${todayStr()}.zip`, false)
              }
              disabled={busy || todayFiles.length === 0}
              title="Solo archivos de oficial/ subidos hoy"
              className="flex items-center gap-1.5 rounded-lg border border-acc/40 bg-panel px-3 py-1.5 text-sm text-acc hover:border-acc disabled:opacity-40"
            >
              <CalendarArrowDown className="h-3.5 w-3.5" />
              Descargar lo de hoy ({todayFiles.length})
            </button>
            {status && (
              <span className="text-2xs font-bold uppercase text-acc">
                {status}
              </span>
            )}
          </div>
        )}

        {error && (
          <pre className="whitespace-pre-wrap rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
            {"\n\n"}
            Si la lista sale vacía o denegada: revisa que tu email esté en la
            tabla production_access y que existan las policies del bucket.
          </pre>
        )}

        {user && entries && entries.length === 0 && !error && (
          <p className="text-sm text-dim">
            El bucket está vacío (o tu cuenta no está en el allowlist: sin
            policy que aplique, listar devuelve vacío).
          </p>
        )}

        {entries && entries.length > 0 && (
          <div className="rounded-lg border border-line bg-panel p-3">
            <ul className="space-y-0.5">
              {FOLDERS.map((folder) => {
                const files = entries.filter((e) => e.folder === folder);
                return (
                  <li key={folder}>
                    <div className="flex items-center gap-2 rounded px-1.5 py-0.5 text-sm">
                      <span className="font-semibold text-acc">
                        📁 {folder}/
                      </span>
                      <span className="text-2xs text-dim">
                        {files.length}{" "}
                        {files.length === 1 ? "archivo" : "archivos"}
                      </span>
                      {files.length > 0 && (
                        <button
                          onClick={() =>
                            downloadZip(
                              files,
                              `${folder}-${todayStr()}.zip`,
                              false,
                            )
                          }
                          disabled={busy}
                          title={`Descargar carpeta ${folder} como ZIP`}
                          className="ml-auto rounded p-1 text-dim hover:bg-elev hover:text-acc disabled:opacity-40"
                        >
                          <FolderDown className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                    <ul className="space-y-0.5">
                      {files.map((e) => (
                        <li
                          key={e.path}
                          className="flex items-center gap-2 rounded py-0.5 pl-6 pr-1.5 text-sm hover:bg-elev"
                        >
                          <button
                            onClick={() => openPreview(e)}
                            className="text-ink hover:text-acc hover:underline"
                          >
                            📄 {e.name}
                          </button>
                          <span className="text-2xs text-dim">
                            {formatSize(e.size)}
                          </span>
                          {isToday(e.updatedAt) && (
                            <span className="rounded-full bg-acc/15 px-1.5 text-2xs font-bold uppercase text-acc">
                              hoy
                            </span>
                          )}
                          <span className="ml-auto text-2xs text-faint">
                            {e.updatedAt &&
                              new Date(e.updatedAt).toLocaleString()}
                          </span>
                          <button
                            onClick={() => downloadOne(e)}
                            disabled={busy}
                            title={`Descargar ${e.name}`}
                            className="rounded p-1 text-dim hover:bg-elev hover:text-acc disabled:opacity-40"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {preview && (
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-acc">{preview.name}</h2>
            <pre className="max-h-[50vh] overflow-auto rounded-lg border border-line bg-panel p-3 text-xs text-ink">
              {preview.text}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
