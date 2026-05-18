"use client";

import { useState, useCallback, Dispatch, SetStateAction } from "react";

interface UseWorkspaceGroupsReturn<TItem> {
  groups: TItem[][];
  addGroup: () => void;
  removeGroup: (groupIndex: number) => void;
  addItem: (groupIndex: number) => void;
  removeItem: (groupIndex: number, itemIndex: number) => void;
  updateItem: (groupIndex: number, itemIndex: number, value: TItem) => void;
  replaceGroup: (groupIndex: number, items: TItem[]) => void;
  setGroups: Dispatch<SetStateAction<TItem[][]>>;
}

export function useWorkspaceGroups<TItem>(
  initialGroups: TItem[][],
  createEmptyItem: () => TItem,
): UseWorkspaceGroupsReturn<TItem> {
  const [groups, setGroups] = useState<TItem[][]>(initialGroups);

  const addGroup = useCallback(() => {
    setGroups((prev) => [...prev, [createEmptyItem()]]);
  }, [createEmptyItem]);

  const removeGroup = useCallback((groupIndex: number) => {
    setGroups((prev) => prev.filter((_, i) => i !== groupIndex));
  }, []);

  const addItem = useCallback(
    (groupIndex: number) => {
      setGroups((prev) =>
        prev.map((group, i) =>
          i === groupIndex ? [...group, createEmptyItem()] : group,
        ),
      );
    },
    [createEmptyItem],
  );

  const removeItem = useCallback((groupIndex: number, itemIndex: number) => {
    setGroups((prev) =>
      prev.map((group, i) =>
        i === groupIndex ? group.filter((_, j) => j !== itemIndex) : group,
      ),
    );
  }, []);

  const updateItem = useCallback(
    (groupIndex: number, itemIndex: number, value: TItem) => {
      setGroups((prev) =>
        prev.map((group, i) =>
          i === groupIndex
            ? group.map((item, j) => (j === itemIndex ? value : item))
            : group,
        ),
      );
    },
    [],
  );

  const replaceGroup = useCallback((groupIndex: number, items: TItem[]) => {
    setGroups((prev) =>
      prev.map((group, i) => (i === groupIndex ? items : group)),
    );
  }, []);

  return {
    groups,
    addGroup,
    removeGroup,
    addItem,
    removeItem,
    updateItem,
    replaceGroup,
    setGroups,
  };
}
