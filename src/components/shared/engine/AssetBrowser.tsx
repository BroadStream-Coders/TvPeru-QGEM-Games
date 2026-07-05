"use client";

import { useMemo, useState } from "react";
import {
  Image as ImageIcon,
  Video,
  Music,
  Type,
  Folder,
  FolderOpen,
  Check,
  Loader2,
  X,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AssetCatalog, CatalogEntry } from "@/helpers/asset-source";
import type { LoadedAsset, AssetKind } from "@/helpers/asset-preloader";
import type { AssetStatus } from "@/hooks/use-asset-preloader";

const KIND_ICON: Record<AssetKind, typeof ImageIcon> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  font: Type,
};

interface FolderNode {
  path: string;
  name: string;
  depth: number;
  children: FolderNode[];
}

/** Carpeta local del asset (organización propia, no el origen físico). */
const folderOf = (entry: CatalogEntry) => entry.folder ?? "";

function buildTree(catalog: AssetCatalog): FolderNode {
  const root: FolderNode = { path: "", name: "Local", depth: 0, children: [] };
  for (const key in catalog) {
    const dir = folderOf(catalog[key]);
    if (!dir) continue;
    let cur = root;
    let acc = "";
    for (const seg of dir.split("/")) {
      acc = acc ? `${acc}/${seg}` : seg;
      let next = cur.children.find((c) => c.name === seg);
      if (!next) {
        next = { path: acc, name: seg, depth: cur.depth + 1, children: [] };
        cur.children.push(next);
      }
      cur = next;
    }
  }
  const sort = (n: FolderNode) => {
    n.children.sort((a, b) => a.name.localeCompare(b.name));
    n.children.forEach(sort);
  };
  sort(root);
  return root;
}

/** ¿el asset está bajo esta carpeta local (recursivo)? "" = raíz, cubre todo. */
const under = (dir: string, folder: string) =>
  folder === "" || dir === folder || dir.startsWith(`${folder}/`);

const extOf = (path: string) => {
  const dot = path.lastIndexOf(".");
  return dot >= 0 ? path.slice(dot + 1).toUpperCase() : "";
};

function StatusBadge({ status }: { status?: AssetStatus }) {
  const base =
    "absolute right-1 top-1 flex h-[15px] w-[15px] items-center justify-center rounded-full shadow-sm";
  if (status === "ready")
    return (
      <span className={cn(base, "bg-success text-black")}>
        <Check className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    );
  if (status === "error")
    return (
      <span className={cn(base, "bg-destructive text-white")}>
        <X className="h-2.5 w-2.5" strokeWidth={3} />
      </span>
    );
  return (
    <span className={cn(base, "bg-black/70 text-faint")}>
      <Loader2 className="h-2.5 w-2.5 animate-spin" />
    </span>
  );
}

function AssetThumb({
  entry,
  loaded,
  status,
}: {
  entry: CatalogEntry;
  loaded?: LoadedAsset;
  status?: AssetStatus;
}) {
  const Icon = KIND_ICON[entry.kind];
  if (entry.kind === "image" && status === "ready" && loaded?.url) {
    return (
      <img
        src={loaded.url}
        alt=""
        className="h-full w-full object-contain"
        style={{
          background:
            "repeating-conic-gradient(#26292f 0 25%, #1d2024 0 50%) 0 / 12px 12px",
        }}
      />
    );
  }
  return <Icon className="h-6 w-6 text-faint" />;
}

export function AssetBrowser({
  catalog,
  assets,
  statuses,
  onAddFiles,
}: {
  catalog: AssetCatalog;
  assets: Record<string, LoadedAsset | undefined>;
  statuses: Record<string, AssetStatus>;
  onAddFiles: (files: FileList | File[]) => void;
}) {
  const keys = Object.keys(catalog);
  const root = useMemo(() => buildTree(catalog), [catalog]);
  const [selected, setSelected] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const rows = useMemo(() => {
    const out: FolderNode[] = [];
    const walk = (n: FolderNode) => {
      out.push(n);
      if (!collapsed[n.path]) n.children.forEach(walk);
    };
    walk(root);
    return out;
  }, [root, collapsed]);

  const countUnder = (folder: string) =>
    keys.filter((k) => under(folderOf(catalog[k]), folder)).length;

  const files = keys
    .filter((k) => under(folderOf(catalog[k]), selected))
    .sort((a, b) => a.localeCompare(b));

  // breadcrumb: Local › seg › seg
  const crumbs = [
    { name: "Local", path: "" },
    ...(selected
      ? selected.split("/").map((seg, i, arr) => ({
          name: seg,
          path: arr.slice(0, i + 1).join("/"),
        }))
      : []),
  ];

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Barra: breadcrumb + contador */}
      <div className="flex h-[28px] shrink-0 items-center gap-2 border-b border-line bg-head px-2.5">
        <div className="flex min-w-0 items-center gap-1 font-mono text-[11px] text-faint">
          {crumbs.map((c, i) => (
            <span key={c.path} className="flex items-center gap-1">
              {i > 0 && <span className="text-line-2">/</span>}
              <button
                onClick={() => setSelected(c.path)}
                className={cn(
                  "truncate transition-colors hover:text-dim",
                  c.path === selected && "text-dim",
                )}
              >
                {c.name}
              </button>
            </span>
          ))}
        </div>
        <div className="flex-1" />
        <span className="shrink-0 font-mono text-[10.5px] text-faint">
          {files.length} {files.length === 1 ? "item" : "items"}
        </span>
        <label className="flex shrink-0 cursor-pointer items-center gap-1 rounded-[4px] border border-line px-1.5 py-0.5 text-[11px] text-dim transition-colors hover:border-acc hover:text-ink">
          <Upload className="h-3 w-3" />
          Cargar
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*,font/*,.ttf,.otf,.woff,.woff2"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.length) onAddFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Árbol de carpetas locales */}
        <div className="scrl w-[180px] shrink-0 overflow-auto border-r border-line bg-panel py-1">
          {rows.map((f) => {
            const sel = f.path === selected;
            const hasKids = f.children.length > 0;
            const open = !collapsed[f.path];
            return (
              <div
                key={f.path || "__root"}
                onClick={() => setSelected(f.path)}
                className={cn(
                  "flex h-[22px] cursor-default items-center gap-1.5 pr-2 text-[12px]",
                  sel ? "bg-acc-bg text-ink" : "text-ink/85 hover:bg-elev",
                )}
                style={{ paddingLeft: 8 + f.depth * 12 }}
              >
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    if (hasKids)
                      setCollapsed((c) => ({ ...c, [f.path]: !c[f.path] }));
                  }}
                  className="flex w-3 shrink-0 justify-center text-[8px] text-faint"
                >
                  {hasKids ? (open ? "▾" : "▸") : ""}
                </span>
                {open && hasKids ? (
                  <FolderOpen
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      sel ? "text-type-video" : "text-dim",
                    )}
                  />
                ) : (
                  <Folder
                    className={cn(
                      "h-3.5 w-3.5 shrink-0",
                      sel ? "text-type-video" : "text-dim",
                    )}
                  />
                )}
                <span className="flex-1 truncate">{f.name}</span>
                <span className="font-mono text-[10px] text-faint">
                  {countUnder(f.path)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Grid de miniaturas */}
        <div className="scrl flex-1 overflow-auto bg-bg p-3">
          {files.length === 0 && (
            <p className="flex h-full items-center justify-center text-2xs text-faint">
              Carpeta vacía. Usa «Cargar» para traer archivos del equipo.
            </p>
          )}
          <div
            className="grid gap-3"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(92px,1fr))" }}
          >
            {files.map((key) => {
              const entry = catalog[key];
              return (
                <div key={key} className="flex cursor-default flex-col gap-1.5">
                  <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[5px] border border-edge bg-panel-2">
                    <AssetThumb
                      entry={entry}
                      loaded={assets[key]}
                      status={statuses[key]}
                    />
                    <span className="absolute bottom-1 left-1 rounded-[3px] bg-black/65 px-1 py-px font-mono text-[8.5px] font-bold tracking-wide text-white">
                      {extOf(entry.path) || entry.kind.toUpperCase()}
                    </span>
                    <StatusBadge status={statuses[key]} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-[11px] text-ink">{key}</p>
                    <p className="truncate font-mono text-[9.5px] text-faint">
                      {entry.kind}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
