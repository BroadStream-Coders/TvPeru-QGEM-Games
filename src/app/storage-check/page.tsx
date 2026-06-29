"use client";

import { useEffect, useState } from "react";
import { resolveAssetUrl } from "@/helpers/asset-source";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/\/$/, "");
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
const STORAGE_BASE = SUPABASE_URL ? `${SUPABASE_URL}/storage/v1` : "";
const BUCKET = "assets";

type Node = {
  name: string;
  path: string;
  isFolder: boolean;
  size?: number;
  children?: Node[];
};

async function listFolder(prefix: string): Promise<Node[]> {
  const res = await fetch(`${STORAGE_BASE}/object/list/${BUCKET}`, {
    method: "POST",
    headers: {
      apikey: ANON,
      Authorization: `Bearer ${ANON}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prefix,
      limit: 1000,
      offset: 0,
      sortBy: { column: "name", order: "asc" },
    }),
  });
  if (!res.ok) throw new Error(`${res.status} — ${await res.text()}`);

  const items: Array<{
    name: string;
    id: string | null;
    metadata: { size?: number } | null;
  }> = await res.json();

  const nodes: Node[] = [];
  for (const it of items) {
    if (it.name === ".emptyFolderPlaceholder") continue;
    const path = prefix + it.name;
    if (it.id === null) {
      nodes.push({
        name: it.name,
        path,
        isFolder: true,
        children: await listFolder(path + "/"),
      });
    } else {
      nodes.push({ name: it.name, path, isFolder: false, size: it.metadata?.size });
    }
  }
  return nodes;
}

function formatSize(bytes?: number) {
  if (bytes == null) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function Tree({ nodes, depth = 0 }: { nodes: Node[]; depth?: number }) {
  return (
    <ul className="space-y-0.5">
      {nodes.map((n) => (
        <li key={n.path}>
          <div
            className="flex items-center gap-2 rounded px-1.5 py-0.5 text-sm hover:bg-elev"
            style={{ paddingLeft: `${depth * 16 + 6}px` }}
          >
            {n.isFolder ? (
              <span className="text-acc">📁 {n.name}/</span>
            ) : (
              <a
                href={resolveAssetUrl(n.path)}
                target="_blank"
                rel="noreferrer"
                className="text-ink hover:text-acc hover:underline"
              >
                📄 {n.name}
              </a>
            )}
            {!n.isFolder && (
              <span className="text-2xs text-dim">{formatSize(n.size)}</span>
            )}
          </div>
          {n.children && n.children.length > 0 && (
            <Tree nodes={n.children} depth={depth + 1} />
          )}
        </li>
      ))}
    </ul>
  );
}

export default function StorageCheck() {
  const [tree, setTree] = useState<Node[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    setError(null);
    listFolder("")
      .then(setTree)
      .catch((e) => setError(String(e.message ?? e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (SUPABASE_URL && ANON) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-bg px-6 py-12 text-ink font-sans">
      <div className="mx-auto w-full max-w-2xl space-y-4">
        <h1 className="text-2xl font-bold tracking-tight">Storage check</h1>
        <p className="text-sm text-dim">
          Bucket:{" "}
          <code className="rounded bg-elev px-1.5 py-0.5 text-xs text-acc">
            {BUCKET}
          </code>{" "}
          en{" "}
          <code className="rounded bg-elev px-1.5 py-0.5 text-xs text-acc">
            {STORAGE_BASE || "(sin configurar)"}
          </code>
        </p>

        {!SUPABASE_URL && (
          <p className="text-sm text-red-400">
            Falta NEXT_PUBLIC_SUPABASE_URL en .env.local.
          </p>
        )}
        {SUPABASE_URL && !ANON && (
          <p className="text-sm text-red-400">
            Falta NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local para poder listar.
          </p>
        )}

        <button
          onClick={load}
          disabled={loading || !SUPABASE_URL || !ANON}
          className="rounded-lg border border-line bg-panel px-3 py-1.5 text-sm hover:border-acc disabled:opacity-40"
        >
          {loading ? "Cargando…" : "Recargar"}
        </button>

        {error && (
          <pre className="whitespace-pre-wrap rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400">
            {error}
            {"\n\n"}
            Si dice algo de RLS o devuelve vacío: en Supabase → Storage →
            Policies, agrega una policy de SELECT para el bucket (template
            “Enable read access for all users”).
          </pre>
        )}

        {tree && tree.length === 0 && !error && (
          <p className="text-sm text-dim">
            El bucket está vacío (o no hay policy de SELECT para listar).
          </p>
        )}

        {tree && tree.length > 0 && (
          <div className="rounded-lg border border-line bg-panel p-3">
            <Tree nodes={tree} />
          </div>
        )}
      </div>
    </div>
  );
}
