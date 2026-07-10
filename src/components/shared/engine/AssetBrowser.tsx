"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  Image as ImageIcon,
  Video,
  Music,
  Type,
  Folder,
  FolderOpen,
  FolderPlus,
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

const KIND_COLOR: Record<AssetKind, string> = {
  image: "text-type-image",
  video: "text-type-video",
  audio: "text-type-audio",
  font: "text-type-text",
};

const KIND_TINT: Record<AssetKind, string> = {
  image: "bg-type-image/15",
  video: "bg-type-video/15",
  audio: "bg-type-audio/15",
  font: "bg-type-text/15",
};

const KIND_BADGE: Record<AssetKind, string> = {
  image: "bg-type-image text-black",
  video: "bg-type-video text-black",
  audio: "bg-type-audio text-black",
  font: "bg-type-text text-black",
};

interface FolderNode {
  path: string;
  name: string;
  depth: number;
  children: FolderNode[];
}

/** Carpeta local del asset (organización propia, no el origen físico). */
const folderOf = (entry: CatalogEntry) => entry.folder ?? "";

function buildTree(catalog: AssetCatalog, extra: string[]): FolderNode {
  const root: FolderNode = { path: "", name: "Local", depth: 0, children: [] };
  const dirs = [...extra];
  for (const key in catalog) {
    const dir = folderOf(catalog[key]);
    if (dir) dirs.push(dir);
  }
  for (const dir of dirs) {
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

const peaksCache = new Map<string, number[]>();
let decodeCtx: AudioContext | null = null;

async function computePeaks(url: string, buckets: number): Promise<number[]> {
  const cached = peaksCache.get(url);
  if (cached) return cached;
  decodeCtx ??= new AudioContext();
  const buf = await (await fetch(url)).arrayBuffer();
  const audio = await decodeCtx.decodeAudioData(buf);
  const data = audio.getChannelData(0);
  const step = Math.max(1, Math.floor(data.length / buckets));
  const peaks: number[] = [];
  let top = 0;
  for (let i = 0; i < buckets; i++) {
    let max = 0;
    const end = Math.min((i + 1) * step, data.length);
    for (let j = i * step; j < end; j++) {
      const v = Math.abs(data[j]);
      if (v > max) max = v;
    }
    peaks.push(max);
    if (max > top) top = max;
  }
  const norm = top > 0 ? peaks.map((p) => p / top) : peaks;
  peaksCache.set(url, norm);
  return norm;
}

function AudioWave({ url }: { url: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let alive = true;
    computePeaks(url, 36)
      .then((peaks) => {
        const canvas = ref.current;
        if (!alive || !canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const { width: w, height: h } = canvas;
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = getComputedStyle(canvas).color;
        const bw = w / peaks.length;
        peaks.forEach((p, i) => {
          const bh = Math.max(3, p * h * 0.92);
          ctx.fillRect(i * bw + bw * 0.2, (h - bh) / 2, bw * 0.6, bh);
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [url]);
  return (
    <canvas
      ref={ref}
      width={144}
      height={80}
      className="h-[55%] w-[82%] text-type-audio"
    />
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
  const checker = {
    background:
      "repeating-conic-gradient(#26292f 0 25%, #1d2024 0 50%) 0 / 12px 12px",
  };
  const ready = status === "ready" && !!loaded?.url;
  if (ready && entry.kind === "image") {
    return (
      <img
        src={loaded.url}
        alt=""
        draggable={false}
        className="h-full w-full object-contain"
        style={checker}
      />
    );
  }
  if (ready && entry.kind === "video") {
    return (
      <video
        src={loaded.url}
        muted
        playsInline
        preload="metadata"
        onLoadedMetadata={(e) => {
          e.currentTarget.currentTime = 0.01;
        }}
        className="h-full w-full object-contain"
        style={checker}
      />
    );
  }
  if (ready && entry.kind === "audio") {
    return <AudioWave url={loaded.url} />;
  }
  if (ready && entry.kind === "font") {
    return (
      <span
        className="text-[32px] leading-none text-type-text"
        style={{ fontFamily: loaded.family ?? entry.family }}
      >
        Ag
      </span>
    );
  }
  const Icon = KIND_ICON[entry.kind];
  return <Icon className={cn("h-6 w-6", KIND_COLOR[entry.kind])} />;
}

export function AssetBrowser({
  catalog,
  assets,
  statuses,
  onAddFiles,
  folders,
  onCreateFolder,
  onMove,
  onMoveFolder,
}: {
  catalog: AssetCatalog;
  assets: Record<string, LoadedAsset | undefined>;
  statuses: Record<string, AssetStatus>;
  onAddFiles: (files: FileList | File[]) => void;
  folders: string[];
  onCreateFolder: (path: string) => void;
  onMove: (keys: string[], folder: string) => void;
  onMoveFolder: (path: string, target: string) => void;
}) {
  const keys = Object.keys(catalog);
  const root = useMemo(() => buildTree(catalog, folders), [catalog, folders]);
  const [selected, setSelected] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [selKeys, setSelKeys] = useState<Set<string>>(new Set());
  const [selDirs, setSelDirs] = useState<Set<string>>(new Set());
  const [dropTarget, setDropTarget] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const anchorRef = useRef<string | null>(null);
  const dragRef = useRef<{ keys: string[]; dirs: string[] }>({
    keys: [],
    dirs: [],
  });
  const cancelCreateRef = useRef(false);

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
    .filter((k) => folderOf(catalog[k]) === selected)
    .sort((a, b) => a.localeCompare(b));

  const clickTile = (e: React.MouseEvent, key: string) => {
    if (e.shiftKey && anchorRef.current) {
      const a = files.indexOf(anchorRef.current);
      const b = files.indexOf(key);
      if (a >= 0 && b >= 0) {
        const [lo, hi] = a < b ? [a, b] : [b, a];
        setSelKeys(new Set(files.slice(lo, hi + 1)));
        return;
      }
    }
    if (e.ctrlKey || e.metaKey) {
      setSelKeys((prev) => {
        const next = new Set(prev);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        return next;
      });
    } else {
      setSelKeys(new Set([key]));
      setSelDirs(new Set());
    }
    anchorRef.current = key;
  };

  const clickDir = (e: React.MouseEvent, path: string) => {
    if (e.ctrlKey || e.metaKey) {
      setSelDirs((prev) => {
        const next = new Set(prev);
        if (next.has(path)) next.delete(path);
        else next.add(path);
        return next;
      });
    } else {
      setSelDirs(new Set([path]));
      setSelKeys(new Set());
    }
  };

  const clearIfSelf = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setSelKeys(new Set());
      setSelDirs(new Set());
    }
  };

  const dropOn = (target: string) => {
    const { keys, dirs } = dragRef.current;
    dragRef.current = { keys: [], dirs: [] };
    if (keys.length) onMove(keys, target);
    if (dirs.length) {
      for (const dir of dirs) onMoveFolder(dir, target);
      setSelDirs(new Set());
    }
  };

  const findNode = (n: FolderNode, path: string): FolderNode | null => {
    if (n.path === path) return n;
    for (const c of n.children) {
      const hit = findNode(c, path);
      if (hit) return hit;
    }
    return null;
  };

  const subfolders = findNode(root, selected)?.children ?? [];

  const enterFolder = (path: string) => {
    setSelected(path);
    setSelKeys(new Set());
    setSelDirs(new Set());
    setCollapsed((c) => {
      const next = { ...c };
      let acc = "";
      for (const seg of path.split("/")) {
        next[acc] = false;
        acc = acc ? `${acc}/${seg}` : seg;
      }
      return next;
    });
  };

  const confirmCreate = (raw: string) => {
    const name = raw.trim().replace(/\//g, "-");
    if (!name) return;
    const siblings = new Set(
      (findNode(root, selected)?.children ?? []).map((c) => c.name),
    );
    let final = name;
    let i = 2;
    while (siblings.has(final)) final = `${name} ${i++}`;
    onCreateFolder(selected ? `${selected}/${final}` : final);
  };

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
                onClick={() => enterFolder(c.path)}
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
          {subfolders.length + files.length}{" "}
          {subfolders.length + files.length === 1 ? "item" : "items"}
        </span>
        <button
          onClick={() => {
            setCollapsed((c) => ({ ...c, [selected]: false }));
            setCreating(true);
          }}
          className="flex shrink-0 items-center gap-1 rounded-[4px] border border-line px-1.5 py-0.5 text-[11px] text-dim transition-colors hover:border-acc hover:text-ink"
        >
          <FolderPlus className="h-3 w-3" />
          Carpeta
        </button>
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
              <Fragment key={f.path || "__root"}>
                <div
                  onClick={() => enterFolder(f.path)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dropTarget !== f.path) setDropTarget(f.path);
                  }}
                  onDragLeave={() =>
                    setDropTarget((d) => (d === f.path ? null : d))
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    setDropTarget(null);
                    dropOn(f.path);
                  }}
                  className={cn(
                    "flex h-[22px] cursor-default items-center gap-1.5 pr-2 text-[12px]",
                    sel ? "bg-acc-bg text-ink" : "text-ink/85 hover:bg-elev",
                    dropTarget === f.path && "bg-acc-bg2",
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
                {creating && f.path === selected && (
                  <div
                    className="flex h-[22px] items-center gap-1.5 pr-2"
                    style={{ paddingLeft: 8 + (f.depth + 1) * 12 + 12 }}
                  >
                    <Folder className="h-3.5 w-3.5 shrink-0 text-dim" />
                    <input
                      autoFocus
                      defaultValue="Nueva carpeta"
                      onFocus={(e) => e.currentTarget.select()}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") e.currentTarget.blur();
                        if (e.key === "Escape") {
                          cancelCreateRef.current = true;
                          e.currentTarget.blur();
                        }
                      }}
                      onBlur={(e) => {
                        const cancelled = cancelCreateRef.current;
                        cancelCreateRef.current = false;
                        setCreating(false);
                        if (!cancelled) confirmCreate(e.currentTarget.value);
                      }}
                      className="w-full min-w-0 rounded-[3px] border border-acc bg-elev px-1 text-[12px] text-ink outline-none"
                    />
                  </div>
                )}
              </Fragment>
            );
          })}
        </div>

        {/* Grid de miniaturas */}
        <div
          className="scrl flex-1 select-none overflow-auto bg-bg p-3"
          onMouseDown={clearIfSelf}
        >
          {files.length === 0 && subfolders.length === 0 && (
            <p className="flex h-full items-center justify-center text-2xs text-faint">
              Carpeta vacía. Usa «Cargar» para traer archivos del equipo.
            </p>
          )}
          <div
            className="grid gap-3"
            style={{
              gridTemplateColumns: "repeat(auto-fill,minmax(92px,1fr))",
            }}
            onMouseDown={clearIfSelf}
          >
            {subfolders.map((f) => {
              const isSel = selDirs.has(f.path);
              return (
                <div
                  key={`dir:${f.path}`}
                  draggable
                  onClick={(e) => clickDir(e, f.path)}
                  onDoubleClick={() => enterFolder(f.path)}
                  onDragStart={(e) => {
                    const dirs = isSel ? [...selDirs] : [f.path];
                    const dragKeys = isSel ? [...selKeys] : [];
                    if (!isSel) {
                      setSelDirs(new Set([f.path]));
                      setSelKeys(new Set());
                    }
                    dragRef.current = { keys: dragKeys, dirs };
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", "");
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (dropTarget !== f.path) setDropTarget(f.path);
                  }}
                  onDragLeave={() =>
                    setDropTarget((d) => (d === f.path ? null : d))
                  }
                  onDrop={(e) => {
                    e.preventDefault();
                    setDropTarget(null);
                    dropOn(f.path);
                  }}
                  className="flex cursor-default flex-col gap-1.5"
                >
                  <div
                    className={cn(
                      "relative flex aspect-square items-center justify-center rounded-[5px]",
                      (isSel || dropTarget === f.path) &&
                        "bg-acc-bg ring-1 ring-acc",
                    )}
                  >
                    <Folder
                      className="h-[62%] w-[62%] text-type-video/75"
                      fill="currentColor"
                      strokeWidth={0}
                    />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "truncate rounded-[3px] px-1 text-[11px]",
                        isSel ? "bg-acc text-white" : "text-ink",
                      )}
                    >
                      {f.name}
                    </p>
                    <p className="truncate px-1 font-mono text-[9.5px] text-faint">
                      {countUnder(f.path)}{" "}
                      {countUnder(f.path) === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>
              );
            })}
            {files.map((key) => {
              const entry = catalog[key];
              const isSel = selKeys.has(key);
              return (
                <div
                  key={key}
                  draggable
                  onClick={(e) => clickTile(e, key)}
                  onDragStart={(e) => {
                    const dragKeys = isSel ? [...selKeys] : [key];
                    const dirs = isSel ? [...selDirs] : [];
                    if (!isSel) {
                      setSelKeys(new Set([key]));
                      setSelDirs(new Set());
                      anchorRef.current = key;
                    }
                    dragRef.current = { keys: dragKeys, dirs };
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", "");
                  }}
                  className="flex cursor-default flex-col gap-1.5"
                >
                  <div
                    className={cn(
                      "relative flex aspect-square items-center justify-center overflow-hidden rounded-[5px] border",
                      KIND_TINT[entry.kind],
                      isSel ? "border-acc ring-1 ring-acc" : "border-edge",
                    )}
                  >
                    <AssetThumb
                      entry={entry}
                      loaded={assets[key]}
                      status={statuses[key]}
                    />
                    <span
                      className={cn(
                        "absolute bottom-1 left-1 rounded-[3px] px-1 py-px font-mono text-[8.5px] font-bold tracking-wide",
                        KIND_BADGE[entry.kind],
                      )}
                    >
                      {extOf(entry.path) || entry.kind.toUpperCase()}
                    </span>
                    <StatusBadge status={statuses[key]} />
                  </div>
                  <div className="min-w-0">
                    <p
                      className={cn(
                        "truncate rounded-[3px] px-1 text-[11px]",
                        isSel ? "bg-acc text-white" : "text-ink",
                      )}
                    >
                      {key}
                    </p>
                    <p
                      className={cn(
                        "truncate px-1 font-mono text-[9.5px] opacity-75",
                        KIND_COLOR[entry.kind],
                      )}
                    >
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
