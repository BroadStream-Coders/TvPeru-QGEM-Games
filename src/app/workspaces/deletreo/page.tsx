"use client";

import { useEffect, useCallback } from "react";
import { SpellCheck } from "lucide-react";
import { saveAsJson, loadJsonFile } from "@/helpers/persistence";
import { getColumnData } from "@/helpers/data-processing";
import { GroupsContainer } from "@/components/shared/group-column/layout/GroupsContainer";
import { useWorkspaceHeader } from "@/hooks/use-workspace-header";
import { useWorkspaceGroups } from "@/hooks/use-workspace-groups";
import { DeletreoColumn } from "./components/DeletreoColumn";

const DEFAULT_FILENAME = "Deletreo.json";

interface DeletreoGroup {
  words: string[];
}

interface DeletreoData {
  groups: DeletreoGroup[];
}

export default function DeletreoPage() {
  const {
    groups,
    addGroup,
    removeGroup,
    addItem,
    removeItem,
    updateItem,
    replaceGroup,
    setGroups,
  } = useWorkspaceGroups<string>([["", "", ""]], () => "");

  const setHeader = useWorkspaceHeader((s) => s.setHeader);
  const resetHeader = useWorkspaceHeader((s) => s.resetHeader);

  const handleQuickLoad = (groupIndex: number, matrix: string[][]) => {
    replaceGroup(groupIndex, getColumnData(matrix, 0));
  };

  const handleSave = useCallback(() => {
    const data: DeletreoData = { groups: groups.map((words) => ({ words })) };
    saveAsJson(DEFAULT_FILENAME, data);
  }, [groups]);

  const handleLoad = useCallback(
    async (file: File) => {
      try {
        const isValid = (data: unknown): data is DeletreoData =>
          typeof data === "object" &&
          data !== null &&
          "groups" in data &&
          Array.isArray((data as DeletreoData).groups) &&
          (data as DeletreoData).groups.every((g) => Array.isArray(g.words));

        const data = await loadJsonFile<DeletreoData>(file, isValid);
        if (data?.groups) setGroups(data.groups.map((g) => g.words));
      } catch {
        alert("Error al cargar el archivo JSON.");
      }
    },
    [setGroups],
  );

  useEffect(() => {
    return () => resetHeader();
  }, [resetHeader]);

  useEffect(() => {
    setHeader({
      title: "Deletreo",
      icon: <SpellCheck className="h-3 w-3" />,
      format: "json",
      onSave: handleSave,
      onLoad: handleLoad,
    });
  }, [setHeader, handleSave, handleLoad]);

  return (
    <main className="flex-1 overflow-hidden">
      <GroupsContainer onAddGroup={addGroup} addLabel="Agregar ronda">
        {groups.map((words, groupIndex) => (
          <DeletreoColumn
            key={groupIndex}
            index={groupIndex + 1}
            words={words}
            onWordChange={(wordIdx, val) =>
              updateItem(groupIndex, wordIdx, val)
            }
            onAddWord={() => addItem(groupIndex)}
            onRemoveWord={(wordIdx) => removeItem(groupIndex, wordIdx)}
            onRemoveColumn={() => removeGroup(groupIndex)}
            onQuickLoad={(matrix) => handleQuickLoad(groupIndex, matrix)}
          />
        ))}
      </GroupsContainer>
    </main>
  );
}
