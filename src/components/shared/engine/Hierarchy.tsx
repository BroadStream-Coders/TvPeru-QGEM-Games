"use client";

import { useMemo, useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { GameObjectKind } from "@engine/gameObject";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from "@/components/ui/context-menu";

export interface TreeNode {
  id: string;
  name: string;
  active?: boolean;
  kind?: GameObjectKind;
  hasAnimation?: boolean;
  children?: TreeNode[];
}

export const KIND_GLYPH: Record<GameObjectKind, string> = {
  group: "▸",
  text: "T",
  image: "▢",
  video: "▶",
  color: "■",
};

export const KIND_COLOR: Record<GameObjectKind, string> = {
  group: "text-ink",
  text: "text-type-text",
  image: "text-type-image",
  video: "text-type-video",
  color: "text-dim",
};

type DropPosition = "before" | "after" | "inside";

interface DropTarget {
  id: string;
  position: DropPosition;
}

interface DndContext {
  enabled: boolean;
  draggingId: string | null;
  dropTarget: DropTarget | null;
  blockedIds: Set<string>;
  onDragStart: (e: React.DragEvent, node: TreeNode) => void;
  onDragOver: (id: string, position: DropPosition) => void;
  onClearTarget: () => void;
  onDrop: () => void;
  onDragEnd: () => void;
}

interface MenuActions {
  onCreate?: (parentId: string | null) => void;
  onDelete?: (id: string) => void;
}

function collectSubtreeIds(node: TreeNode): string[] {
  return [node.id, ...(node.children?.flatMap(collectSubtreeIds) ?? [])];
}

function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    const found = node.children ? findNode(node.children, id) : null;
    if (found) return found;
  }
  return null;
}

export function Hierarchy({
  nodes,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
  onReorder,
  onToggleActive,
}: {
  nodes: TreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onCreate?: (parentId: string | null) => void;
  onDelete?: (id: string) => void;
  onReorder?: (
    draggedId: string,
    targetId: string,
    position: DropPosition,
  ) => void;
  onToggleActive?: (id: string, active: boolean) => void;
}) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);

  const blockedIds = useMemo(() => {
    if (!draggingId) return new Set<string>();
    const node = findNode(nodes, draggingId);
    return new Set(node ? collectSubtreeIds(node) : [draggingId]);
  }, [draggingId, nodes]);

  const reset = () => {
    setDraggingId(null);
    setDropTarget(null);
  };

  const dnd: DndContext = {
    enabled: !!onReorder,
    draggingId,
    dropTarget,
    blockedIds,
    onDragStart: (e, node) => {
      setDraggingId(node.id);
      e.dataTransfer.effectAllowed = "move";
      const chip = document.createElement("div");
      chip.textContent = node.name;
      chip.style.cssText =
        "position:fixed;top:-1000px;left:-1000px;padding:2px 10px;border-radius:9999px;background:var(--editor-acc);color:#fff;font-size:11px;font-weight:500;white-space:nowrap;pointer-events:none;z-index:9999";
      document.body.appendChild(chip);
      e.dataTransfer.setDragImage(chip, 0, 0);
      window.setTimeout(() => document.body.removeChild(chip), 0);
    },
    onDragOver: (id, position) => {
      setDropTarget((prev) =>
        prev && prev.id === id && prev.position === position
          ? prev
          : { id, position },
      );
    },
    onClearTarget: () => setDropTarget(null),
    onDrop: () => {
      if (onReorder && draggingId && dropTarget && draggingId !== dropTarget.id) {
        onReorder(draggingId, dropTarget.id, dropTarget.position);
      }
      reset();
    },
    onDragEnd: reset,
  };

  const menu: MenuActions = { onCreate, onDelete };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="-m-3 flex min-h-full flex-col py-1">
          {nodes.map((node) => (
            <TreeItem
              key={node.id}
              node={node}
              depth={0}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggleActive={onToggleActive}
              dnd={dnd}
              menu={menu}
            />
          ))}
        </div>
      </ContextMenuTrigger>
      {onCreate && (
        <ContextMenuContent>
          <ContextMenuItem onSelect={() => onCreate(null)}>
            <Plus />
            Crear GameObject
          </ContextMenuItem>
        </ContextMenuContent>
      )}
    </ContextMenu>
  );
}

function DropLine({ depth }: { depth: number }) {
  return (
    <div
      style={{ paddingLeft: depth * 12 + 8 }}
      className="pointer-events-none relative -my-px h-0.5"
    >
      <div className="relative h-0.5 rounded-full bg-acc">
        <span className="absolute -left-0.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-acc" />
      </div>
    </div>
  );
}

function TreeItem({
  node,
  depth,
  selectedId,
  onSelect,
  onToggleActive,
  dnd,
  menu,
}: {
  node: TreeNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleActive?: (id: string, active: boolean) => void;
  dnd: DndContext;
  menu: MenuActions;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = !!node.children?.length;
  const selected = node.id === selectedId;
  const isActive = node.active !== false;
  const kind = node.kind ?? "group";

  const blocked = dnd.blockedIds.has(node.id);
  const isDragging = dnd.draggingId === node.id;
  const isInsideTarget =
    dnd.dropTarget?.id === node.id && dnd.dropTarget.position === "inside";
  const showBefore =
    dnd.dropTarget?.id === node.id && dnd.dropTarget.position === "before";
  const showAfter =
    dnd.dropTarget?.id === node.id && dnd.dropTarget.position === "after";

  const handleDragOver = (e: React.DragEvent) => {
    if (!dnd.enabled || !dnd.draggingId) return;
    if (blocked) {
      dnd.onClearTarget();
      return;
    }
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;
    const position: DropPosition =
      ratio < 0.25 ? "before" : ratio > 0.75 ? "after" : "inside";
    dnd.onDragOver(node.id, position);
  };

  const hasMenu = !!menu.onCreate || !!menu.onDelete;

  const row = (
    <div
      draggable={dnd.enabled}
      onDragStart={(e) => dnd.onDragStart(e, node)}
      onDragEnd={dnd.onDragEnd}
      onDragOver={handleDragOver}
      onDrop={(e) => {
        if (blocked) return;
        e.preventDefault();
        dnd.onDrop();
      }}
      onClick={() => onSelect(node.id)}
      onContextMenu={() => onSelect(node.id)}
      style={{ paddingLeft: depth * 12 + 8 }}
      className={cn(
        "group/row relative flex h-[23px] cursor-pointer select-none items-center gap-1.5 pr-1.5 text-xs",
        selected ? "bg-acc-bg text-ink" : "text-ink hover:bg-elev",
        isInsideTarget && "ring-1 ring-inset ring-acc",
        !isActive && "opacity-50",
        isDragging && "opacity-40",
      )}
    >
      {selected && (
        <span className="absolute inset-y-0 left-0 w-0.5 bg-acc" />
      )}
      {hasChildren ? (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="flex size-3.5 shrink-0 items-center justify-center text-faint hover:text-ink"
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
      ) : (
        <span className="size-3.5 shrink-0" />
      )}
      <span
        className={cn(
          "w-3.5 shrink-0 text-center font-mono text-[13px] font-semibold leading-none",
          KIND_COLOR[kind],
        )}
      >
        {KIND_GLYPH[kind]}
      </span>
      <span className={cn("flex-1 truncate", selected && "font-medium")}>
        {node.name}
      </span>
      {node.hasAnimation && (
        <span className="shrink-0 text-2xs leading-none text-anim">✦</span>
      )}
      {onToggleActive && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleActive(node.id, !isActive);
          }}
          className={cn(
            "flex size-4 shrink-0 items-center justify-center text-faint hover:text-ink",
            isActive ? "opacity-0 group-hover/row:opacity-100" : "opacity-100",
          )}
        >
          {isActive ? <Eye size={12} /> : <EyeOff size={12} />}
        </button>
      )}
    </div>
  );

  return (
    <div className="flex flex-col">
      {showBefore && <DropLine depth={depth} />}
      {hasMenu ? (
        <ContextMenu>
          <ContextMenuTrigger asChild>{row}</ContextMenuTrigger>
          <ContextMenuContent>
            {menu.onCreate && (
              <ContextMenuItem onSelect={() => menu.onCreate!(node.id)}>
                <Plus />
                Crear hijo
              </ContextMenuItem>
            )}
            {menu.onCreate && menu.onDelete && <ContextMenuSeparator />}
            {menu.onDelete && (
              <ContextMenuItem
                variant="destructive"
                onSelect={() => menu.onDelete!(node.id)}
              >
                <Trash2 />
                Eliminar
              </ContextMenuItem>
            )}
          </ContextMenuContent>
        </ContextMenu>
      ) : (
        row
      )}

      {showAfter && <DropLine depth={depth} />}

      {hasChildren && expanded && (
        <div className="flex flex-col">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onToggleActive={onToggleActive}
              dnd={dnd}
              menu={menu}
            />
          ))}
        </div>
      )}
    </div>
  );
}
