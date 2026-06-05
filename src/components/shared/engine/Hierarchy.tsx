"use client";

import { useMemo, useState } from "react";
import { ChevronRight, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

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
  onAdd,
  onReorder,
}: {
  nodes: TreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd?: () => void;
  onReorder?: (
    draggedId: string,
    targetId: string,
    position: DropPosition,
  ) => void;
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
        "position:fixed;top:-1000px;left:-1000px;padding:2px 10px;border-radius:9999px;background:var(--brand);color:var(--brand-foreground);font-size:11px;font-weight:500;white-space:nowrap;pointer-events:none;z-index:9999";
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

  return (
    <div className="flex flex-col">
      {onAdd && (
        <div className="mb-1 flex justify-end">
          <button
            onClick={onAdd}
            title="Crear GameObject"
            className="flex size-5 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-brand hover:text-foreground"
          >
            <Plus size={13} />
          </button>
        </div>
      )}
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
          dnd={dnd}
        />
      ))}
    </div>
  );
}

function DropLine({ depth }: { depth: number }) {
  return (
    <div
      style={{ paddingLeft: depth * 12 + 4 }}
      className="pointer-events-none relative -my-px h-0.5"
    >
      <div className="relative h-0.5 rounded-full bg-brand">
        <span className="absolute -left-0.5 top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-brand" />
      </div>
    </div>
  );
}

function TreeItem({
  node,
  depth,
  selectedId,
  onSelect,
  dnd,
}: {
  node: TreeNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  dnd: DndContext;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = !!node.children?.length;
  const selected = node.id === selectedId;

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

  return (
    <div className="flex flex-col">
      {showBefore && <DropLine depth={depth} />}
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
        style={{ paddingLeft: depth * 12 + 4 }}
        className={cn(
          "flex cursor-pointer select-none items-center gap-1 rounded py-1 pr-2 text-xs",
          selected
            ? "bg-brand text-brand-foreground"
            : "text-foreground hover:bg-accent",
          isInsideTarget && "ring-1 ring-brand ring-inset bg-brand/10",
          isDragging && "opacity-40",
        )}
      >
        {hasChildren ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            className="flex size-4 shrink-0 items-center justify-center opacity-70 hover:opacity-100"
          >
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        ) : (
          <span className="size-4 shrink-0" />
        )}
        <span className="truncate">{node.name}</span>
      </div>

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
              dnd={dnd}
            />
          ))}
        </div>
      )}
    </div>
  );
}
