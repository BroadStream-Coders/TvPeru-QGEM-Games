"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TreeNode {
  id: string;
  name: string;
  children?: TreeNode[];
}

export function Hierarchy({
  nodes,
  selectedId,
  onSelect,
}: {
  nodes: TreeNode[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex flex-col">
      {nodes.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          selectedId={selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}

function TreeItem({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: TreeNode;
  depth: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = !!node.children?.length;
  const selected = node.id === selectedId;

  return (
    <div className="flex flex-col">
      <div
        onClick={() => onSelect(node.id)}
        style={{ paddingLeft: depth * 12 + 4 }}
        className={cn(
          "flex cursor-pointer select-none items-center gap-1 rounded py-1 pr-2 text-xs",
          selected
            ? "bg-brand text-brand-foreground"
            : "text-foreground hover:bg-accent",
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

      {hasChildren && expanded && (
        <div className="flex flex-col">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
