"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import {
  Layers,
  Plus,
  X,
  Boxes,
  SlidersHorizontal,
  Frame,
  Type,
  Image as ImageIcon,
  Move,
} from "lucide-react";
import { loadJsonFile } from "@/helpers/persistence";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useTransformGesture, HANDLES } from "@/hooks/use-transform-gesture";

import { Scene } from "@/components/shared/engine/Scene";
import { NumberField } from "@/components/shared/NumberField";
import {
  RectTransform,
  RectTransformValues,
  Vec2,
  DESIGN_WIDTH,
} from "@/components/shared/engine/RectTransform";

type TextAlign = "left" | "center" | "right";

interface TextContent {
  type: "text";
  value: string;
  fontSize: number;
  color: string;
  bold: boolean;
  align: TextAlign;
  letterSpacing: number;
}

type ImageFit = "contain" | "cover" | "fill";

interface ImageContent {
  type: "image";
  value: string;
  mode: "url" | "file";
  fit: ImageFit;
  fileName?: string;
}

type SourceContent = TextContent | ImageContent;
type SourceType = SourceContent["type"];

interface Source {
  id: string;
  name: string;
  content: SourceContent;
  transform: RectTransformValues;
}

interface SourceFile {
  name: string;
  content: SourceContent;
  transform: RectTransformValues;
}

interface EscenaData {
  sources: SourceFile[];
}

function defaultTransform(): RectTransformValues {
  return {
    position: { x: 0, y: 0 },
    size: { x: 600, y: 300 },
    pivot: { x: 0.5, y: 0.5 },
  };
}

function defaultContent(type: SourceType, name: string): SourceContent {
  if (type === "image") {
    return { type: "image", value: "", mode: "url", fit: "contain" };
  }
  return {
    type: "text",
    value: name,
    fontSize: 120,
    color: "#ffffff",
    bold: true,
    align: "center",
    letterSpacing: 0,
  };
}

function SourceView({ content }: { content: SourceContent }) {
  if (content.type === "image") {
    if (!content.value) return null;
    const backgroundSize = content.fit === "fill" ? "100% 100%" : content.fit;
    return (
      <div
        className="w-full h-full bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${content.value})`, backgroundSize }}
      />
    );
  }

  const alignItems =
    content.align === "left"
      ? "flex-start"
      : content.align === "right"
        ? "flex-end"
        : "center";

  return (
    <div
      className="w-full h-full flex flex-col justify-center"
      style={{
        alignItems,
        color: content.color,
        fontSize: `${(content.fontSize / DESIGN_WIDTH) * 100}cqw`,
        fontWeight: content.bold ? 900 : 400,
        textAlign: content.align,
        letterSpacing: `${(content.letterSpacing / DESIGN_WIDTH) * 100}cqw`,
        lineHeight: 1.1,
        whiteSpace: "pre-wrap",
      }}
    >
      {content.value}
    </div>
  );
}

export default function EscenaPage() {
  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const [sources, setSources] = useState<Source[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const stageRef = useRef<HTMLDivElement>(null);

  const selected = sources.find((s) => s.id === selectedId) ?? null;

  const { beginGesture } = useTransformGesture({
    stageRef,
    getTransform: () => selected?.transform ?? null,
    onChange: ({ position, size }) =>
      setSources((prev) =>
        prev.map((s) =>
          s.id === selectedId
            ? { ...s, transform: { ...s.transform, position, size } }
            : s,
        ),
      ),
  });

  const addSource = (type: SourceType) => {
    setAddMenuOpen(false);
    const id = crypto.randomUUID();
    setSources((prev) => {
      const name = `Fuente ${prev.length + 1}`;
      return [
        ...prev,
        {
          id,
          name,
          content: defaultContent(type, name),
          transform: defaultTransform(),
        },
      ];
    });
    setSelectedId(id);
  };

  const removeSource = (id: string) => {
    setSources((prev) => prev.filter((s) => s.id !== id));
    setSelectedId((curr) => (curr === id ? null : curr));
  };

  const updateName = (id: string, name: string) =>
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));

  const updateContent = (id: string, content: SourceContent) =>
    setSources((prev) =>
      prev.map((s) => (s.id === id ? { ...s, content } : s)),
    );

  const applyNaturalSize = useCallback((id: string, src: string) => {
    if (!src) return;
    const img = new window.Image();
    img.onload = () =>
      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                transform: {
                  ...s.transform,
                  size: { x: img.naturalWidth, y: img.naturalHeight },
                },
              }
            : s,
        ),
      );
    img.src = src;
  }, []);

  const onPickFile = (id: string, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const src = String(reader.result);
      updateContent(id, {
        type: "image",
        value: src,
        mode: "file",
        fit: "contain",
        fileName: file.name,
      });
      applyNaturalSize(id, src);
    };
    reader.readAsDataURL(file);
  };

  const updateAxis =
    (id: string, field: keyof RectTransformValues, axis: keyof Vec2) =>
    (value: number) =>
      setSources((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                transform: {
                  ...s.transform,
                  [field]: { ...s.transform[field], [axis]: value },
                },
              }
            : s,
        ),
      );

  const handleLoad = useCallback(async (file: File) => {
    try {
      const isValid = (data: unknown): data is EscenaData =>
        typeof data === "object" &&
        data !== null &&
        "sources" in data &&
        Array.isArray((data as EscenaData).sources);

      const data = await loadJsonFile<EscenaData>(file, isValid);
      setSources(
        data.sources.map((s) => ({
          id: crypto.randomUUID(),
          name: s.name,
          content: s.content,
          transform: s.transform,
        })),
      );
      setSelectedId(null);
    } catch {
      console.error("Error al cargar el archivo JSON.");
    }
  }, []);

  useEffect(() => {
    return () => resetHeader();
  }, [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Escena",
      icon: <Layers className="h-3 w-3" />,
      onLoad: handleLoad,
    });
  }, [setHeader, handleLoad]);

  return (
    <main className="flex-1 p-6 overflow-auto flex flex-col gap-6">
      <Scene background={{ type: "color", value: "#00B140" }}>
        <div ref={stageRef} className="absolute inset-0">
          {sources.map((s) => (
            <RectTransform
              key={s.id}
              position={s.transform.position}
              size={s.transform.size}
              pivot={s.transform.pivot}
              className={
                s.id === selectedId
                  ? "border-2 border-dashed border-white"
                  : "border border-dashed border-white/30"
              }
            >
              <SourceView content={s.content} />
              {editMode && s.id === selectedId && (
                <>
                  <div
                    onPointerDown={(e) => beginGesture("move", e)}
                    className="absolute inset-0 cursor-move touch-none select-none"
                  />
                  {HANDLES.map((hd) => (
                    <div
                      key={hd.h}
                      onPointerDown={(e) => beginGesture(hd.h, e)}
                      className={`absolute ${hd.pos} ${hd.cursor} h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-700 bg-white touch-none`}
                    />
                  ))}
                </>
              )}
            </RectTransform>
          ))}
        </div>
      </Scene>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Fuentes */}
        <div className="border border-slate-200 rounded-xl bg-slate-50 flex flex-col h-[380px]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="flex items-center gap-2 font-bold text-slate-700">
              <Boxes size={16} className="text-slate-400" />
              Fuentes
            </h3>
            <div className="relative">
              <button
                onClick={() => setAddMenuOpen((v) => !v)}
                className="flex items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
              >
                <Plus size={14} />
                Agregar fuente
              </button>
              {addMenuOpen && (
                <>
                  <button
                    aria-hidden
                    onClick={() => setAddMenuOpen(false)}
                    className="fixed inset-0 z-10 cursor-default"
                  />
                  <div className="absolute right-0 top-full mt-1 z-20 w-40 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">
                    <button
                      onClick={() => addSource("text")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <Type size={14} className="text-slate-400" />
                      Texto
                    </button>
                    <button
                      onClick={() => addSource("image")}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                    >
                      <ImageIcon size={14} className="text-slate-400" />
                      Imagen
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex flex-col p-2 flex-1 overflow-auto">
            {sources.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-slate-400">
                No hay fuentes. Crea una con “Agregar fuente”.
              </p>
            ) : (
              sources.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`group flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-colors ${
                    s.id === selectedId
                      ? "bg-slate-800 text-white"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate text-sm font-medium">
                    <span
                      className={`text-2xs font-mono uppercase ${
                        s.id === selectedId ? "text-white/60" : "text-slate-400"
                      }`}
                    >
                      {s.content.type === "image" ? "IMG" : "TXT"}
                    </span>
                    <span className="truncate">{s.name}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeSource(s.id);
                    }}
                    className={`shrink-0 rounded p-1 transition-colors ${
                      s.id === selectedId
                        ? "hover:bg-white/20"
                        : "text-slate-400 hover:bg-slate-300 hover:text-slate-700"
                    }`}
                    title="Eliminar"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Propiedades */}
        <div className="border border-slate-200 rounded-xl bg-slate-50 flex flex-col h-[380px]">
          <div className="border-b border-slate-200 px-4 py-3">
            <h3 className="flex items-center gap-2 font-bold text-slate-700">
              <SlidersHorizontal size={16} className="text-slate-400" />
              Propiedades
            </h3>
          </div>

          <div className="p-4 flex-1 overflow-auto">
            {!selected ? (
              <p className="py-6 text-center text-sm text-slate-400">
                Selecciona una fuente para editar su contenido.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                <label className="flex flex-col gap-1">
                  <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
                    Nombre
                  </span>
                  <input
                    type="text"
                    value={selected.name}
                    onChange={(e) => updateName(selected.id, e.target.value)}
                    className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
                  />
                </label>

                {selected.content.type === "text" ? (
                  <TextProperties
                    content={selected.content}
                    onChange={(c) => updateContent(selected.id, c)}
                  />
                ) : (
                  <ImageProperties
                    content={selected.content}
                    onChange={(c) => updateContent(selected.id, c)}
                    onPickFile={(file) => onPickFile(selected.id, file)}
                    onResolveSize={(src) => applyNaturalSize(selected.id, src)}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        {/* Transform */}
        <div className="border border-slate-200 rounded-xl bg-slate-50 flex flex-col h-[380px]">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
            <h3 className="flex items-center gap-2 font-bold text-slate-700">
              <Frame size={16} className="text-slate-400" />
              Transform
            </h3>
            <button
              onClick={() => setEditMode((v) => !v)}
              disabled={!selected}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                editMode
                  ? "bg-brand text-white"
                  : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Move size={14} />
              Editar
            </button>
          </div>

          <div className="p-4 flex-1 overflow-auto">
            {!selected ? (
              <p className="py-6 text-center text-sm text-slate-400">
                Selecciona una fuente para editar su transform.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <NumberField
                  label="Pos X"
                  value={selected.transform.position.x}
                  onChange={updateAxis(selected.id, "position", "x")}
                />
                <NumberField
                  label="Pos Y"
                  value={selected.transform.position.y}
                  onChange={updateAxis(selected.id, "position", "y")}
                />
                <NumberField
                  label="Width"
                  value={selected.transform.size.x}
                  onChange={updateAxis(selected.id, "size", "x")}
                />
                <NumberField
                  label="Height"
                  value={selected.transform.size.y}
                  onChange={updateAxis(selected.id, "size", "y")}
                />
                <NumberField
                  label="Pivot X"
                  step={0.05}
                  value={selected.transform.pivot.x}
                  onChange={updateAxis(selected.id, "pivot", "x")}
                />
                <NumberField
                  label="Pivot Y"
                  step={0.05}
                  value={selected.transform.pivot.y}
                  onChange={updateAxis(selected.id, "pivot", "y")}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

function TextProperties({
  content,
  onChange,
}: {
  content: TextContent;
  onChange: (content: TextContent) => void;
}) {
  return (
    <>
      <label className="flex flex-col gap-1">
        <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
          Texto
        </span>
        <textarea
          value={content.value}
          onChange={(e) => onChange({ ...content, value: e.target.value })}
          rows={3}
          className="w-full resize-none rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
        />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <NumberField
          label="Tamaño"
          value={content.fontSize}
          onChange={(fontSize) => onChange({ ...content, fontSize })}
        />
        <NumberField
          label="Espaciado"
          value={content.letterSpacing}
          onChange={(letterSpacing) => onChange({ ...content, letterSpacing })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
            Color
          </span>
          <input
            type="color"
            value={content.color}
            onChange={(e) => onChange({ ...content, color: e.target.value })}
            className="h-9 w-full cursor-pointer rounded-md border border-slate-300 bg-white"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
            Alineación
          </span>
          <select
            value={content.align}
            onChange={(e) =>
              onChange({ ...content, align: e.target.value as TextAlign })
            }
            className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
          >
            <option value="left">Izquierda</option>
            <option value="center">Centro</option>
            <option value="right">Derecha</option>
          </select>
        </label>
      </div>

      <button
        onClick={() => onChange({ ...content, bold: !content.bold })}
        className={`rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
          content.bold
            ? "bg-slate-800 text-white"
            : "bg-white border border-slate-300 text-slate-600 hover:bg-slate-100"
        }`}
      >
        Negrita
      </button>
    </>
  );
}

function ImageProperties({
  content,
  onChange,
  onPickFile,
  onResolveSize,
}: {
  content: ImageContent;
  onChange: (content: ImageContent) => void;
  onPickFile: (file: File) => void;
  onResolveSize: (src: string) => void;
}) {
  return (
    <>
      <label className="flex flex-col gap-1">
        <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
          Origen
        </span>
        <select
          value={content.mode}
          onChange={(e) =>
            onChange({
              type: "image",
              value: "",
              mode: e.target.value as ImageContent["mode"],
              fit: content.fit,
            })
          }
          className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
        >
          <option value="url">Desde URL</option>
          <option value="file">Cargar desde equipo</option>
        </select>
      </label>

      {content.mode === "url" ? (
        <label className="flex flex-col gap-1">
          <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
            URL de la imagen
          </span>
          <input
            type="text"
            value={content.value}
            onChange={(e) => onChange({ ...content, value: e.target.value })}
            onBlur={(e) => onResolveSize(e.target.value)}
            placeholder="https://…"
            className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
          />
        </label>
      ) : (
        <div className="flex flex-col gap-1">
          <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
            Archivo
          </span>
          <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-md bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-700">
            <ImageIcon size={14} />
            Elegir archivo
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onPickFile(file);
              }}
              className="hidden"
            />
          </label>
          {content.fileName && (
            <span className="truncate text-xs text-slate-500">
              {content.fileName}
            </span>
          )}
        </div>
      )}

      <label className="flex flex-col gap-1">
        <span className="text-2xs font-mono uppercase tracking-wider text-slate-500">
          Ajuste
        </span>
        <select
          value={content.fit}
          onChange={(e) =>
            onChange({ ...content, fit: e.target.value as ImageFit })
          }
          className="h-9 w-full rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-800 focus:border-slate-500 focus:outline-none"
        >
          <option value="contain">Ajustar (sin recortar)</option>
          <option value="cover">Llenar (recorta)</option>
          <option value="fill">Estirar (deforma)</option>
        </select>
      </label>

      {content.mode === "url" && content.value && (
        <div
          className="h-24 w-full rounded-md border border-slate-200 bg-contain bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${content.value})` }}
        />
      )}
    </>
  );
}
